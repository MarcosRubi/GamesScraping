import { computed, Injectable, signal } from '@angular/core';
import type { StoreKey } from '../models/game';
import { STORE_KEYS } from '../stores';

// Filtro de tiendas (multi-selección, vacío = todas): limita las secciones
// multi-tienda de la home y en qué tiendas se busca.
@Injectable({ providedIn: 'root' })
export class FiltersStore {
  readonly stores = signal<StoreKey[]>([]);

  readonly searchStores = computed<readonly StoreKey[]>(() =>
    this.stores().length > 0 ? this.stores() : STORE_KEYS,
  );

  toggleStore(key: StoreKey): void {
    this.stores.update((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]));
  }

  matchesStore(game: { store: StoreKey }): boolean {
    const stores = this.stores();
    return stores.length === 0 || stores.includes(game.store);
  }
}
