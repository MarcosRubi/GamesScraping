import { httpResource } from '@angular/common/http';
import { Component, computed, inject, input } from '@angular/core';
import { api } from '../../core/config/api';
import type { Game, SearchResponse, StoreKey } from '../../core/models/game';
import { ExchangeRateStore } from '../../core/state/exchange-rate.store';
import { FiltersStore } from '../../core/state/filters.store';
import { STORE_KEYS, STORES } from '../../core/stores';
import { priceToUsdValue } from '../../core/utils/currency';
import { Icon } from '../../shared/ui/icon/icon';
import { StoreResultCard } from './store-result-card';

// Resultados de /buscar?q=... El término llega como input desde la URL
// (withComponentInputBinding). Hay un httpResource por tienda: cambiar la
// búsqueda cancela las peticiones viejas, y como viven en este componente,
// salir de la página también las cancela.
@Component({
  selector: 'app-search-page',
  imports: [Icon, StoreResultCard],
  templateUrl: './search-page.html',
})
export class SearchPage {
  private readonly filters = inject(FiltersStore);
  private readonly rate = inject(ExchangeRateStore).eurUsdRate;

  readonly q = input('');

  protected readonly term = computed(() => this.q().trim());
  protected readonly labels = STORES;
  // Tiendas consultadas: las del filtro (todas si no hay filtro).
  protected readonly searched = computed(() => this.filters.searchStores());
  protected readonly excluded = computed(() => STORE_KEYS.filter((key) => !this.searched().includes(key)));

  private readonly resources = STORE_KEYS.map((key) => ({
    key,
    resource: httpResource<SearchResponse>(() => {
      const term = this.term();
      return term && this.searched().includes(key) ? api.search(STORES[key].apiSlug, term) : undefined;
    }),
  }));

  protected readonly searching = computed(() => this.resources.some(({ resource }) => resource.isLoading()));

  protected readonly progress = computed(() =>
    this.resources
      .filter(({ key }) => this.searched().includes(key))
      .map(({ key, resource }) => ({ key, done: !resource.isLoading() })),
  );

  // Juegos por tienda; null = no lo vende (o la tienda falló).
  private readonly results = computed(() =>
    this.resources
      .filter(({ key }) => this.searched().includes(key))
      .map(({ key, resource }) => {
        const value = resource.hasValue() ? resource.value() : null;
        return { key, games: Array.isArray(value) && value.length > 0 ? (value as Game[]) : null };
      }),
  );

  protected readonly available = computed(() =>
    this.results().filter((r): r is { key: StoreKey; games: Game[] } => r.games !== null),
  );
  protected readonly missing = computed(() => this.results().filter((r) => r.games === null).map((r) => r.key));

  // Mejor precio: primer resultado de cada tienda en USD (solo si hay al
  // menos dos tiendas comparables).
  protected readonly bestStore = computed<StoreKey | null>(() => {
    const prices = this.available()
      .map(({ key, games }) => ({ key, value: priceToUsdValue(games[0]?.price, this.rate()) }))
      .filter((p) => p.value !== Infinity);
    if (prices.length < 2) return null;
    return prices.reduce((min, p) => (p.value < min.value ? p : min)).key;
  });
}
