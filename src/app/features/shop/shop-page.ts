import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { scrollToId } from '../../core/browser/scroll';
import { CatalogStore } from '../../core/state/catalog.store';
import { PreferencesStore } from '../../core/state/preferences.store';
import { STORES } from '../../core/stores';
import { GameCard } from '../../shared/ui/game-card';
import { Icon } from '../../shared/ui/icon/icon';
import { FiltersDrawer } from './components/filters-drawer';
import { GenreCarousel } from './components/genre-carousel';
import { Pagination } from './components/pagination';
import { ShopListItem } from './components/shop-list-item';
import { ShopSidebar, type FilterDraft } from './components/shop-sidebar';
import { ShopToolbar } from './components/shop-toolbar';
import {
  DEFAULT_FILTERS,
  FEATURE_OPTIONS,
  LIST_OPTIONS,
  parseFilters,
  toQueryParams,
  type PageSize,
  type ShopFilters,
  type SortKey,
  type ViewMode,
} from './shop-filters.model';
import { matches, sortEntries } from './shop-filtering';

type MultiFacet = 'lists' | 'stores' | 'genres' | 'features';

interface Chip {
  label: string;
  remove: Partial<ShopFilters>;
}

// Página "Juegos": catálogo completo con filtros, orden, vista y paginación.
//
// La URL es la única fuente de verdad: los filtros se derivan de los query
// params (toSignal se desuscribe solo al destruir la página) y cada cambio
// es una navegación. Todo lo demás es computed: filtrar ~200 juegos es
// instantáneo, así que no hace falta pedirle nada a la API al filtrar.
@Component({
  selector: 'app-shop-page',
  imports: [NgTemplateOutlet, RouterLink, Icon, GameCard, GenreCarousel, ShopSidebar, ShopToolbar, ShopListItem, Pagination, FiltersDrawer],
  templateUrl: './shop-page.html',
})
export class ShopPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly catalog = inject(CatalogStore);
  private readonly currency = inject(PreferencesStore).currency;

  private readonly params = toSignal(this.route.queryParams, { initialValue: {} });
  protected readonly filters = computed(() => parseFilters(this.params()));

  // Panel de filtros en móvil: estado local de la página.
  protected readonly filtersOpen = signal(false);

  protected readonly currencySymbol = computed(() => (this.currency() === 'EUR' ? '€' : 'US$'));

  private readonly filtered = computed(() => {
    const entries = this.catalog.entries();
    if (!entries) return null;
    const f = this.filters();
    return sortEntries(
      entries.filter((e) => matches(e, f)),
      f.sort,
    );
  });

  protected readonly total = computed(() => this.filtered()?.length ?? 0);
  protected readonly pages = computed(() => Math.max(1, Math.ceil(this.total() / this.filters().perPage)));
  // Si la URL pide una página que ya no existe (cambiaron los filtros), la última.
  protected readonly page = computed(() => Math.min(this.filters().page, this.pages()));

  protected readonly pageGames = computed(() => {
    const list = this.filtered();
    if (!list) return null;
    const { perPage } = this.filters();
    const start = (this.page() - 1) * perPage;
    return list.slice(start, start + perPage).map((e) => e.game);
  });

  protected readonly range = computed(() => {
    const { perPage } = this.filters();
    const from = this.total() === 0 ? 0 : (this.page() - 1) * perPage + 1;
    return { from, to: Math.min(this.page() * perPage, this.total()) };
  });

  // Géneros del catálogo, los más comunes primero.
  protected readonly genreOptions = computed(() => {
    const counts = new Map<string, number>();
    for (const entry of this.catalog.entries() ?? []) {
      for (const genre of entry.genres) counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([genre]) => genre);
  });

  protected readonly title = computed(() => {
    const f = this.filters();
    if (f.lists.length === 1 && !f.genres.length) return LIST_OPTIONS.find((o) => o.key === f.lists[0])!.label;
    if (f.genres.length === 1 && !f.lists.length) return `Juegos de ${f.genres[0]}`;
    return 'Todos los juegos';
  });

  protected readonly chips = computed<Chip[]>(() => {
    const f = this.filters();
    const without = <T>(values: T[], value: T) => values.filter((v) => v !== value);
    const symbol = this.currencySymbol();
    const chips: Chip[] = [
      ...f.lists.map((l) => ({ label: LIST_OPTIONS.find((o) => o.key === l)!.label, remove: { lists: without(f.lists, l) } })),
      ...f.stores.map((s) => ({ label: STORES[s].label, remove: { stores: without(f.stores, s) } })),
      ...f.genres.map((g) => ({ label: g, remove: { genres: without(f.genres, g) } })),
      ...f.features.map((x) => ({ label: FEATURE_OPTIONS.find((o) => o.key === x)!.label, remove: { features: without(f.features, x) } })),
    ];
    if (f.min !== null || f.max !== null) {
      const label =
        f.min === null ? `Hasta ${symbol}${f.max}` : f.max === null ? `Desde ${symbol}${f.min}` : `${symbol}${f.min} — ${symbol}${f.max}`;
      chips.push({ label, remove: { min: null, max: null } });
    }
    return chips;
  });

  // --- Acciones: todas terminan en la URL --------------------------------

  protected toggle({ facet, key }: { facet: MultiFacet; key: string }): void {
    const current = this.filters()[facet] as string[];
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    this.update({ [facet]: next } as Partial<ShopFilters>);
  }

  protected toggleGenre(label: string): void {
    this.toggle({ facet: 'genres', key: label });
  }

  // "Aplicar filtros" del panel: todo lo elegido en una sola navegación.
  protected applyFilters(draft: FilterDraft): void {
    this.filtersOpen.set(false);
    this.update(draft);
  }

  protected setSort(sort: SortKey): void {
    this.update({ sort });
  }

  protected setPerPage(perPage: PageSize): void {
    this.update({ perPage });
  }

  protected setView(view: ViewMode): void {
    this.update({ view }, false);
  }

  protected removeChip(chip: Chip): void {
    this.update(chip.remove);
  }

  protected clearFilters(): void {
    this.filtersOpen.set(false);
    const { sort, perPage, view } = this.filters();
    this.update({ ...DEFAULT_FILTERS, sort, perPage, view });
  }

  protected goToPage(page: number): void {
    // Cambiar de página sí queda en el historial (volver atrás vuelve a la anterior).
    void this.router
      .navigate([], { relativeTo: this.route, queryParams: toQueryParams({ ...this.filters(), page }) })
      .then(() => scrollToId('resultados'));
  }

  // Cambios de filtro: vuelven a la página 1, reemplazan la entrada del
  // historial (para que "atrás" no recorra cada checkbox) y dejan la vista
  // en los resultados, debajo del carrusel de géneros.
  private update(partial: Partial<ShopFilters>, resetPage = true): void {
    const next: ShopFilters = { ...this.filters(), ...partial, ...(resetPage ? { page: 1 } : {}) };
    void this.router
      .navigate([], { relativeTo: this.route, queryParams: toQueryParams(next), replaceUrl: true })
      .then(() => scrollToId('resultados'));
  }

  protected readonly activeFilterCount = computed(() => this.chips().length);
  protected readonly gridClass = computed(() =>
    this.filters().view === 'grilla-3' ? 'md:grid-cols-3' : 'md:grid-cols-3 xl:grid-cols-4',
  );
}
