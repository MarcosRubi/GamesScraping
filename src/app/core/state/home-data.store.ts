import { httpResource } from '@angular/common/http';
import { computed, inject, Injectable, Injector, runInInjectionContext, type Signal, untracked } from '@angular/core';
import { api } from '../config/api';
import type { Game, NewsItem, StoreGame, StoreKey } from '../models/game';
import { STORE_KEYS, STORES } from '../stores';
import { dedupeCheapest, discountValue, interleave, normalizeName } from '../utils/game-lists';
import { ExchangeRateStore } from './exchange-rate.store';
import { FiltersStore } from './filters.store';

// null = cargando · [] = falló o vino vacía · array = lista lista.
export type ListState = StoreGame[] | null;

// Datos de la home. Cada lista es un httpResource (una petición, expuesta
// como signal, cancelada si el injector se destruye). Las secciones son
// computed encadenados: cada una excluye los juegos que ya mostró una
// sección de más arriba, así la página no repite los mismos títulos.
@Injectable({ providedIn: 'root' })
export class HomeDataStore {
  private readonly injector = inject(Injector);
  private readonly rate = inject(ExchangeRateStore).eurUsdRate;
  private readonly filters = inject(FiltersStore);

  // --- Fuentes -----------------------------------------------------------
  private readonly spotlight = this.list('steam-spotlight', 'steam');
  private readonly steamFeature = this.list('steam-feature', 'steam');
  private readonly steamSpecials = this.list('steam-specials', 'steam');
  private readonly steamComingSoon = this.list('steam-coming-soon', 'steam');
  private readonly steamNewReleases = this.list('steam-new-releases', 'steam');

  private readonly offers = [
    this.list('top-offers-steam', 'steam'),
    this.list('top-offers-humble', 'humble'),
    this.list('top-offers-fanatical', 'fanatical'),
    this.list('top-offers-instant-gaming', 'instantGaming'),
  ];

  readonly topSellersByStore = Object.fromEntries(
    STORE_KEYS.map((key) => [key, this.list(`top-sellers-${STORES[key].apiSlug}`, key)]),
  ) as Record<StoreKey, Signal<ListState>>;

  private readonly bestRated = [
    this.list('overwhelmingly-positive-steam', 'steam'),
    this.list('best-rated-gog', 'gog'),
    this.list('best-rated-instant-gaming', 'instantGaming'),
  ];

  private readonly newsResource = httpResource<NewsItem[]>(() => api.news());

  // --- Secciones (en orden de prioridad para el dedupe) -------------------

  // Hero: destacados de Steam con ficha completa.
  readonly hero = computed(() => this.spotlight()?.slice(0, 5) ?? null);

  // "Juegos en oferta" al costado del hero: ofertas de todas las tiendas,
  // por mayor descuento, sin repetir el hero.
  readonly discounted = computed<ListState>(() => {
    const lists = this.allLoaded(this.offers);
    if (!lists) return null;
    const merged = lists
      .flat()
      .filter((g) => g.discount && !isNaN(discountValue(g.discount)) && this.filters.matchesStore(g))
      .sort((a, b) => discountValue(b.discount) - discountValue(a.discount));
    return this.excluding(dedupeCheapest(merged, this.rate()), this.usedBy(this.hero)).slice(0, 5);
  });

  // Más vendidos de todas las tiendas (pestaña "Todas").
  readonly topSellers = computed<ListState>(() => {
    const lists = this.allLoaded(STORE_KEYS.map((key) => this.topSellersByStore[key]));
    if (!lists) return null;
    const merged = dedupeCheapest(interleave(lists), this.rate()).filter((g) => this.filters.matchesStore(g));
    return this.excluding(merged, this.usedBy(this.hero, this.discounted)).slice(0, 12);
  });

  // Dos banners promocionales: las ofertas de Steam con más descuento.
  readonly promos = computed<ListState>(() => {
    const specials = this.steamSpecials();
    if (!specials) return null;
    const sorted = [...specials].sort((a, b) => discountValue(b.discount || '0') - discountValue(a.discount || '0'));
    return this.excluding(sorted, this.usedBy(this.hero, this.discounted, this.topSellers)).slice(0, 2);
  });

  // Juego destacado con tráilers.
  readonly feature = computed(() => this.steamFeature()?.[0] ?? null);

  private readonly featureList = computed(() => (this.feature() ? [this.feature()!] : []));
  // Todo lo que ya se mostró arriba de las columnas.
  private readonly aboveColumns = computed(() =>
    this.usedBy(this.hero, this.discounted, this.topSellers, this.promos, this.featureList),
  );

  readonly newReleases = computed(() => this.column(this.steamNewReleases));
  readonly comingSoon = computed(() => this.column(this.steamComingSoon));
  readonly steamDeals = computed(() => this.column(this.steamSpecials));
  readonly topRated = computed<ListState>(() => {
    const lists = this.allLoaded(this.bestRated);
    if (!lists) return null;
    const merged = dedupeCheapest(interleave(lists), this.rate()).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return this.excluding(merged, this.aboveColumns()).slice(0, 5);
  });

  readonly news = computed(() => (this.newsResource.hasValue() ? this.newsResource.value() : null));

  // Pedidos populares del buscador: los títulos más vendidos, cortos.
  readonly popularSearches = computed(() =>
    (this.topSellers() ?? [])
      .slice(0, 6)
      .map((g) => g.name.split(/[:\-–(]/)[0].trim())
      .filter((name) => name.length > 1 && name.length <= 22),
  );

  // --- Géneros (perezosos) -----------------------------------------------
  private readonly genreLists = new Map<string, Signal<ListState>>();

  // El recurso de un género se crea la primera vez que alguien lo pide:
  // si nadie muestra "Carreras", no se hace esa petición. Se suele pedir
  // desde un computed, y un recurso no puede crearse dentro de un contexto
  // reactivo: untracked lo crea afuera.
  genre(slug: string): Signal<ListState> {
    let list = this.genreLists.get(slug);
    if (!list) {
      list = untracked(() => runInInjectionContext(this.injector, () => this.list(`genre-${slug}`, 'steam')));
      this.genreLists.set(slug, list);
    }
    return list;
  }

  // Género para "Populares por género": sin los juegos que ya están en el
  // hero, las ofertas, los más vendidos o los banners.
  popularInGenre(slug: string): ListState {
    const games = this.genre(slug)();
    return games ? this.excluding(games, this.aboveGenres()).slice(0, 5) : null;
  }

  private readonly aboveGenres = computed(() => this.usedBy(this.hero, this.discounted, this.topSellers, this.promos));

  // --- Helpers -----------------------------------------------------------

  private column(source: Signal<ListState>): ListState {
    const games = source();
    return games ? this.excluding(games, this.aboveColumns()).slice(0, 5) : null;
  }

  private usedBy(...sections: Signal<ListState | StoreGame[]>[]): Set<string> {
    const used = new Set<string>();
    for (const section of sections) {
      for (const game of section() ?? []) used.add(normalizeName(game.name));
    }
    return used;
  }

  private excluding(games: StoreGame[], used: Set<string>): StoreGame[] {
    return games.filter((g) => !used.has(normalizeName(g.name)));
  }

  private list(key: string, store: StoreKey): Signal<ListState> {
    const resource = httpResource<Game[]>(() => api.listing(key));
    return computed(() => {
      if (resource.status() === 'error') return [];
      if (!resource.hasValue()) return null;
      const games = resource.value();
      return Array.isArray(games) ? games.map((game) => ({ ...game, store })) : [];
    });
  }

  private allLoaded(lists: Signal<ListState>[]): StoreGame[][] | null {
    const values = lists.map((list) => list());
    return values.every((value) => value !== null) ? (values as StoreGame[][]) : null;
  }
}
