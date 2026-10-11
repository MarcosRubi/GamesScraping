import type { CatalogEntry } from '../../core/state/catalog.store';
import type { ShopFilters, SortKey } from './shop-filters.model';

export type Facet = 'lists' | 'stores' | 'genres' | 'features' | 'price';

const TOP_RATED = 4;

// ¿El juego pasa los filtros? `skip` ignora una faceta: sirve para contar
// cuántos resultados daría cada opción de esa faceta sin que se anule sola.
export function matches(entry: CatalogEntry, f: ShopFilters, skip?: Facet): boolean {
  const { game } = entry;
  if (skip !== 'lists' && f.lists.length && !f.lists.some((l) => game.lists.includes(l))) return false;
  if (skip !== 'stores' && f.stores.length && !f.stores.includes(game.store)) return false;
  if (skip !== 'genres' && f.genres.length && !f.genres.some((g) => entry.genres.includes(g))) return false;
  if (skip !== 'features') {
    if (f.features.includes('oferta') && entry.discount <= 0) return false;
    if (f.features.includes('gratis') && !entry.free) return false;
    if (f.features.includes('valoracion') && (game.rating ?? 0) < TOP_RATED) return false;
  }
  if (skip !== 'price' && (f.min !== null || f.max !== null)) {
    // Sin precio conocido no puede estar dentro de un rango.
    if (entry.price === null) return false;
    if (f.min !== null && entry.price < f.min) return false;
    if (f.max !== null && entry.price > f.max) return false;
  }
  return true;
}

const byPriceAsc = (a: CatalogEntry, b: CatalogEntry) => (a.price ?? Infinity) - (b.price ?? Infinity);

const COMPARATORS: Record<SortKey, (a: CatalogEntry, b: CatalogEntry) => number> = {
  popularidad: (a, b) => a.game.rank - b.game.rank,
  valoracion: (a, b) => (b.game.rating ?? -1) - (a.game.rating ?? -1) || (b.game.ratingCount ?? 0) - (a.game.ratingCount ?? 0),
  'precio-asc': byPriceAsc,
  // Los sin precio van al final también en orden descendente.
  'precio-desc': (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity),
  descuento: (a, b) => b.discount - a.discount || a.game.rank - b.game.rank,
  nombre: (a, b) => a.game.name.localeCompare(b.game.name, 'es'),
};

export function sortEntries(entries: CatalogEntry[], sort: SortKey): CatalogEntry[] {
  return [...entries].sort(COMPARATORS[sort]);
}

// Cuántos juegos hay por cada valor de una faceta, con el resto de filtros
// aplicados (para los números al lado de cada checkbox).
export function facetCounts(
  entries: CatalogEntry[],
  filters: ShopFilters,
  facet: Exclude<Facet, 'price'>,
): Map<string, number> {
  const counts = new Map<string, number>();
  const add = (key: string) => counts.set(key, (counts.get(key) ?? 0) + 1);
  for (const entry of entries) {
    if (!matches(entry, filters, facet)) continue;
    switch (facet) {
      case 'lists':
        entry.game.lists.forEach(add);
        break;
      case 'stores':
        add(entry.game.store);
        break;
      case 'genres':
        entry.genres.forEach(add);
        break;
      case 'features':
        if (entry.discount > 0) add('oferta');
        if (entry.free) add('gratis');
        if ((entry.game.rating ?? 0) >= TOP_RATED) add('valoracion');
        break;
    }
  }
  return counts;
}
