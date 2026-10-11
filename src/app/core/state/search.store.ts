import { httpResource } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import type { Game, SearchResponse, StoreKey } from '../models/game';
import { STORE_KEYS, STORES } from '../stores';
import { cleanGameName } from '../utils/game-lists';
import { FiltersStore } from './filters.store';

declare const umami: { track: (event: string, data?: Record<string, string>) => void } | undefined;

interface SearchRequest {
  term: string;
  stores: readonly StoreKey[];
}

// Búsqueda de un juego en las tiendas. Hay un httpResource por tienda que
// depende de `request`: al pedir una búsqueda nueva, cada recurso cancela
// solo la petición anterior que siga en vuelo (no hay carreras donde una
// respuesta vieja pise a una nueva) y las tiendas fuera del filtro quedan
// en reposo (su request es undefined → no hace petición).
@Injectable({ providedIn: 'root' })
export class SearchStore {
  private readonly filters = inject(FiltersStore);

  // Texto del buscador del header (two-way binding con [(ngModel)] no hace
  // falta: el input escribe directo en la signal).
  readonly term = signal('');

  private readonly request = signal<SearchRequest | null>(null);

  private readonly resources = STORE_KEYS.map((key) => ({
    key,
    resource: httpResource<SearchResponse>(() => {
      const req = this.request();
      if (!req || !req.stores.includes(key)) return undefined;
      // Objeto nuevo en cada búsqueda: repetir el mismo término vuelve a
      // consultar en vez de reutilizar la respuesta anterior.
      return { url: `${environment.apiUrl}/${STORES[key].apiSlug}/${encodeURIComponent(req.term)}` };
    }),
  }));

  readonly hasSearched = computed(() => this.request() !== null);
  readonly searchedTerm = computed(() => this.request()?.term ?? '');
  readonly searchedStores = computed(() => this.request()?.stores ?? []);
  readonly searching = computed(() => this.resources.some(({ resource }) => resource.isLoading()));

  // Progreso por tienda para el checklist de carga.
  readonly progress = computed(() =>
    this.resources
      .filter(({ key }) => this.searchedStores().includes(key))
      .map(({ key, resource }) => ({ key, done: !resource.isLoading() })),
  );

  // Juegos encontrados por tienda; null = esa tienda no lo vende (o falló).
  readonly results = computed(() => {
    const out = new Map<StoreKey, Game[] | null>();
    for (const { key, resource } of this.resources) {
      if (!this.searchedStores().includes(key)) continue;
      const value = resource.hasValue() ? resource.value() : null;
      out.set(key, Array.isArray(value) && value.length > 0 ? value : null);
    }
    return out;
  });

  search(rawTerm: string = this.term()): void {
    const term = rawTerm.trim();
    if (!term) return;
    const stores = this.filters.searchStores();
    this.request.set({ term, stores });
    if (typeof umami !== 'undefined') {
      umami.track('search', { term, stores: stores.join(',') });
    }
  }

  // "Comparar precios" desde una tarjeta: busca ese juego en las tiendas
  // del filtro y lo deja escrito en el buscador.
  compare(gameName: string): void {
    const term = cleanGameName(gameName);
    this.term.set(term);
    this.search(term);
  }
}
