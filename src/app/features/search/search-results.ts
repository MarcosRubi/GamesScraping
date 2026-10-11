import { afterNextRender, Component, computed, effect, ElementRef, inject, Injector, untracked } from '@angular/core';
import type { StoreKey } from '../../core/models/game';
import { ExchangeRateStore } from '../../core/state/exchange-rate.store';
import { SearchStore } from '../../core/state/search.store';
import { STORE_KEYS, STORES } from '../../core/stores';
import { priceToUsdValue } from '../../core/utils/currency';
import { Icon } from '../../shared/icon/icon';
import { StoreResultCard } from './store-result-card';

// Resultados de búsqueda en la misma grilla que la home. Las tiendas sin el
// juego no ocupan una card: se listan en una línea arriba.
@Component({
  selector: 'app-search-results',
  imports: [Icon, StoreResultCard],
  templateUrl: './search-results.html',
  styleUrls: ['../home/sections.scss', './search.scss'],
})
export class SearchResults {
  protected readonly search = inject(SearchStore);
  private readonly rate = inject(ExchangeRateStore).eurUsdRate;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly labels = STORES;

  protected readonly available = computed(() =>
    [...this.search.results()].filter(([, games]) => games !== null).map(([key, games]) => ({ key, games: games! })),
  );
  protected readonly missing = computed(() =>
    [...this.search.results()].filter(([, games]) => games === null).map(([key]) => key),
  );
  protected readonly excluded = computed(() =>
    STORE_KEYS.filter((key) => !this.search.searchedStores().includes(key)),
  );

  // "Mejor precio": primer resultado de cada tienda llevado a USD. Solo tiene
  // sentido con al menos 2 tiendas comparables.
  protected readonly bestStore = computed<StoreKey | null>(() => {
    const prices = this.available()
      .map(({ key, games }) => ({ key, value: priceToUsdValue(games[0]?.price, this.rate()) }))
      .filter((entry) => entry.value !== Infinity);
    if (prices.length < 2) return null;
    return prices.reduce((min, entry) => (entry.value < min.value ? entry : min)).key;
  });

  constructor() {
    // Cada búsqueda nueva baja la vista hasta los resultados. effect porque
    // es un efecto sobre el DOM (scroll), no estado derivado; el scroll se
    // hace después del render para que la sección ya tenga su tamaño.
    effect(() => {
      this.search.searchedTerm();
      this.search.searchedStores();
      untracked(() =>
        afterNextRender(() => this.host.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }), {
          injector: this.injector,
        }),
      );
    });
  }
}
