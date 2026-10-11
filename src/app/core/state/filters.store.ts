import { computed, Injectable, signal } from '@angular/core';
import type { Game, StoreKey } from '../models/game';
import { STORE_KEYS } from '../stores';

// Filtros multi-selección. Array vacío = "Todas".
// - stores: limita las secciones de la home Y en qué tiendas se busca.
// - categories: solo filtra las secciones de la home.
@Injectable({ providedIn: 'root' })
export class FiltersStore {
  readonly stores = signal<StoreKey[]>([]);
  readonly categories = signal<string[]>([]);

  readonly activeCount = computed(() => this.stores().length + this.categories().length);

  // Tiendas donde buscar: las del filtro, o todas si no hay filtro.
  readonly searchStores = computed<readonly StoreKey[]>(() =>
    this.stores().length > 0 ? this.stores() : STORE_KEYS,
  );

  matches(game: Game & { store: StoreKey }): boolean {
    const stores = this.stores();
    const categories = this.categories();
    if (stores.length > 0 && !stores.includes(game.store)) return false;
    if (categories.length > 0 && !(game.categories ?? []).some((c) => categories.includes(c))) {
      return false;
    }
    return true;
  }
}
