import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { dismissOnOutside } from '../../core/browser/dismiss';
import type { Currency, StoreKey, Theme } from '../../core/models/game';
import { FiltersStore } from '../../core/state/filters.store';
import { HomeDataStore } from '../../core/state/home-data.store';
import { PreferencesStore } from '../../core/state/preferences.store';
import { SearchStore } from '../../core/state/search.store';
import { UiStore } from '../../core/state/ui.store';
import { STORE_KEYS, STORES } from '../../core/stores';
import { Icon, type IconName } from '../../shared/icon/icon';
import { FilterDropdown, type FilterOption } from './filter-dropdown';

const STORE_OPTIONS: FilterOption[] = STORE_KEYS.map((key) => ({ key, label: STORES[key].shortLabel }));

const CURRENCIES: { key: Currency; label: string }[] = [
  { key: 'USD', label: 'US$' },
  { key: 'EUR', label: '€' },
];

const THEMES: { key: Theme; icon: IconName; label: string }[] = [
  { key: 'light', icon: 'sun', label: 'Modo claro' },
  { key: 'dark', icon: 'moon-stars', label: 'Modo oscuro' },
];

type DropdownId = 'stores' | 'categories';

// Header sticky: logo, buscador, filtros, moneda, tema y "¿Cómo funciona?".
// En escritorio las herramientas van en línea; bajo 860px se colapsan en un
// panel que abre el botón de ajustes.
@Component({
  selector: 'app-header',
  imports: [Icon, FilterDropdown],
  templateUrl: './header.html',
})
export class Header {
  protected readonly preferences = inject(PreferencesStore);
  protected readonly filters = inject(FiltersStore);
  protected readonly search = inject(SearchStore);
  private readonly ui = inject(UiStore);
  private readonly homeData = inject(HomeDataStore);

  protected readonly currencies = CURRENCIES;
  protected readonly themes = THEMES;
  protected readonly storeOptions = STORE_OPTIONS;
  protected readonly categoryOptions = computed<FilterOption[]>(() =>
    this.homeData.availableCategories().map((c) => ({ key: c, label: c })),
  );

  // Estado de UI local: solo le importa al header → signals del componente,
  // no del store.
  protected readonly toolsOpen = signal(false);
  protected readonly openDropdown = signal<DropdownId | null>(null);

  private readonly tools = viewChild<ElementRef<HTMLElement>>('tools');
  private readonly toolsToggle = viewChild<ElementRef<HTMLElement>>('toolsToggle');
  private readonly filtersRow = viewChild<ElementRef<HTMLElement>>('filtersRow');

  constructor() {
    dismissOnOutside(
      this.toolsOpen,
      () => [this.tools()?.nativeElement, this.toolsToggle()?.nativeElement],
      () => this.toolsOpen.set(false),
    );
    dismissOnOutside(
      computed(() => this.openDropdown() !== null),
      () => [this.filtersRow()?.nativeElement],
      () => this.openDropdown.set(null),
    );
  }

  protected toggleDropdown(id: DropdownId): void {
    this.openDropdown.update((current) => (current === id ? null : id));
  }

  // FilterDropdown trabaja con string[]; el store de tiendas con StoreKey[].
  protected setStores(keys: string[]): void {
    this.filters.stores.set(keys as StoreKey[]);
  }

  protected onSearchInput(event: Event): void {
    this.search.term.set((event.target as HTMLInputElement).value);
  }

  protected submitSearch(event: Event): void {
    event.preventDefault();
    this.search.search();
  }

  protected scrollToTop(event: Event): void {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected openHowItWorks(): void {
    this.ui.howItWorksOpen.set(true);
  }
}
