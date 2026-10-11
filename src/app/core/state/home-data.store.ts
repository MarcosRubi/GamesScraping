import { httpResource } from '@angular/common/http';
import { computed, inject, Injectable, type Signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import type { Game, StoreGame, StoreKey } from '../models/game';
import { STORE_KEYS, STORES } from '../stores';
import { dedupeCheapest, discountValue, interleave } from '../utils/game-lists';
import { ExchangeRateStore } from './exchange-rate.store';

const SECTION_SIZE = 12;

// null = todavía cargando · [] = falló o vino vacía · array = lista lista.
export type ListState = StoreGame[] | null;

// Datos de la home. Cada endpoint es un httpResource: hace UNA petición al
// crearse el servicio (la primera vez que algún componente lo inyecta),
// expone el resultado como signal y, si la petición sigue en vuelo cuando el
// injector se destruye, la cancela. Las secciones agregadas son computed:
// se recalculan solas cuando llega una lista o cambia el tipo de cambio,
// sin suscripciones manuales que haya que cerrar.
@Injectable({ providedIn: 'root' })
export class HomeDataStore {
  private readonly rate = inject(ExchangeRateStore).eurUsdRate;

  // Más vendidos por tienda (carruseles de abajo + banner + agregado).
  readonly topSellers = Object.fromEntries(
    STORE_KEYS.map((key) => [key, this.list(`top-sellers-${STORES[key].apiSlug}`, key)]),
  ) as Record<StoreKey, Signal<ListState>>;

  private readonly offers = [
    this.list('top-offers-steam', 'steam'),
    this.list('top-offers-humble', 'humble'),
    this.list('top-offers-fanatical', 'fanatical'),
    this.list('top-offers-instant-gaming', 'instantGaming'),
  ];

  // Instant Gaming no tiene endpoint de lanzamientos.
  private readonly releases = [
    this.list('new-releases-steam', 'steam'),
    this.list('new-releases-gog', 'gog'),
    this.list('new-releases-humble', 'humble'),
    this.list('new-releases-fanatical', 'fanatical'),
  ];

  private readonly bestRatedSteam = this.list('overwhelmingly-positive-steam', 'steam');
  private readonly bestRatedGog = this.list('best-rated-gog', 'gog');
  private readonly bestRatedInstantGaming = this.list('best-rated-instant-gaming', 'instantGaming');

  // Mejores ofertas: mezcla de tiendas, ordenadas por descuento, dedupe por
  // título (queda el más barato). Se muestra cuando llegaron todas.
  readonly topOffers = computed<ListState>(() => {
    const lists = this.allLoaded(this.offers);
    if (!lists) return null;
    const merged = lists
      .flat()
      .filter((game) => game.discount && !isNaN(discountValue(game.discount)))
      .sort((a, b) => discountValue(b.discount) - discountValue(a.discount));
    return dedupeCheapest(merged, this.rate()).slice(0, SECTION_SIZE);
  });

  readonly newReleases = computed<ListState>(() => {
    const lists = this.allLoaded(this.releases);
    if (!lists) return null;
    return dedupeCheapest(interleave(lists), this.rate()).slice(0, SECTION_SIZE);
  });

  readonly topSellersAggregated = computed<ListState>(() => {
    const lists = this.allLoaded(STORE_KEYS.map((key) => this.topSellers[key]));
    if (!lists) return null;
    return dedupeCheapest(lists.flat(), this.rate()).slice(0, SECTION_SIZE);
  });

  // Banner "mejor valorados": junta los destacados de cada tienda (Humble y
  // Fanatical usan sus más vendidos), intercala y deduplica. Es progresivo:
  // con la primera lista que llega ya hay banner, y se completa después.
  readonly featured = computed<ListState>(() => {
    const sources = [
      this.bestRatedSteam()?.slice(0, 10) ?? null,
      this.bestRatedGog(),
      this.bestRatedInstantGaming(),
      this.topSellers.humble(),
      this.topSellers.fanatical(),
    ];
    if (sources.every((list) => list === null)) return null;
    const lists = sources.map((list) => list ?? []);
    return dedupeCheapest(interleave(lists), this.rate()).slice(0, SECTION_SIZE);
  });

  // Categorías presentes en las 3 secciones agregadas, más frecuentes primero.
  readonly availableCategories = computed(() => {
    const counts = new Map<string, number>();
    for (const list of [this.topOffers(), this.newReleases(), this.topSellersAggregated()]) {
      for (const game of list ?? []) {
        for (const category of game.categories ?? []) {
          counts.set(category, (counts.get(category) ?? 0) + 1);
        }
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([category]) => category);
  });

  // Una tienda caída no rompe la sección: su lista queda vacía y el resto
  // sigue. Se estampa `store` en cada juego para el tag y el filtro.
  private list(path: string, store: StoreKey): Signal<ListState> {
    const resource = httpResource<Game[]>(() => `${environment.apiUrl}/${path}`);
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
