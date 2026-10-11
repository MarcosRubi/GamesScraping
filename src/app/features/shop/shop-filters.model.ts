import type { Params } from '@angular/router';
import type { CatalogList, StoreKey } from '../../core/models/game';
import { STORES, storeFromSlug } from '../../core/stores';

export type SortKey = 'popularidad' | 'valoracion' | 'precio-asc' | 'precio-desc' | 'descuento' | 'nombre';
export type ViewMode = 'lista' | 'grilla-3' | 'grilla-4';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'popularidad', label: 'Más populares' },
  { key: 'valoracion', label: 'Mejor valorados' },
  { key: 'precio-asc', label: 'Precio: menor a mayor' },
  { key: 'precio-desc', label: 'Precio: mayor a menor' },
  { key: 'descuento', label: 'Mayor descuento' },
  { key: 'nombre', label: 'Nombre (A-Z)' },
];

export const PAGE_SIZES = [9, 12, 18, 24] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export const LIST_OPTIONS: { key: CatalogList; label: string }[] = [
  { key: 'mas-vendidos', label: 'Más vendidos' },
  { key: 'ofertas', label: 'Ofertas' },
  { key: 'novedades', label: 'Novedades' },
  { key: 'proximamente', label: 'Próximamente' },
  { key: 'mejor-valorados', label: 'Mejor valorados' },
  { key: 'destacados', label: 'Destacados' },
];

export type Feature = 'oferta' | 'gratis' | 'valoracion';
export const FEATURE_OPTIONS: { key: Feature; label: string }[] = [
  { key: 'oferta', label: 'En oferta' },
  { key: 'gratis', label: 'Gratis' },
  { key: 'valoracion', label: 'Valoración 4+ ★' },
];

// Estado completo de la página. Vive en la URL (query params): se puede
// compartir, recargar y volver atrás, y los links "Ver todos" de la home
// llegan con sus filtros puestos.
export interface ShopFilters {
  lists: CatalogList[];
  stores: StoreKey[];
  genres: string[];
  features: Feature[];
  min: number | null;
  max: number | null;
  sort: SortKey;
  perPage: PageSize;
  view: ViewMode;
  page: number;
}

export const DEFAULT_FILTERS: ShopFilters = {
  lists: [],
  stores: [],
  genres: [],
  features: [],
  min: null,
  max: null,
  sort: 'popularidad',
  perPage: 12,
  view: 'grilla-4',
  page: 1,
};

const csv = (value: unknown): string[] =>
  typeof value === 'string' && value ? value.split(',').map((v) => v.trim()).filter(Boolean) : [];

const num = (value: unknown): number | null => {
  const n = typeof value === 'string' && value !== '' ? Number(value) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : null;
};

// URL → filtros (ignora valores inválidos en vez de romper).
export function parseFilters(params: Params): ShopFilters {
  const listKeys = LIST_OPTIONS.map((o) => o.key);
  const sort = SORT_OPTIONS.find((o) => o.key === params['orden'])?.key ?? DEFAULT_FILTERS.sort;
  const perPage = PAGE_SIZES.find((n) => String(n) === params['mostrar']) ?? DEFAULT_FILTERS.perPage;
  const view = (['lista', 'grilla-3', 'grilla-4'] as const).find((v) => v === params['vista']) ?? DEFAULT_FILTERS.view;
  return {
    lists: csv(params['lista']).filter((l): l is CatalogList => (listKeys as string[]).includes(l)),
    stores: csv(params['tienda'])
      .map(storeFromSlug)
      .filter((s): s is StoreKey => !!s),
    genres: csv(params['genero']),
    features: csv(params['caracteristica']).filter((f): f is Feature => FEATURE_OPTIONS.some((o) => o.key === f)),
    min: num(params['min']),
    max: num(params['max']),
    sort,
    perPage,
    view,
    page: Math.max(1, Math.floor(num(params['pagina']) ?? 1)),
  };
}

// Filtros → query params (omite los valores por defecto: URLs cortas).
export function toQueryParams(filters: ShopFilters): Params {
  const join = (values: string[]) => (values.length ? values.join(',') : null);
  return {
    lista: join(filters.lists),
    tienda: join(filters.stores.map((s) => STORES[s].apiSlug)),
    genero: join(filters.genres),
    caracteristica: join(filters.features),
    min: filters.min ?? null,
    max: filters.max ?? null,
    orden: filters.sort === DEFAULT_FILTERS.sort ? null : filters.sort,
    mostrar: filters.perPage === DEFAULT_FILTERS.perPage ? null : filters.perPage,
    vista: filters.view === DEFAULT_FILTERS.view ? null : filters.view,
    pagina: filters.page > 1 ? filters.page : null,
  };
}

// Query params para un link "Ver todos" de la home.
export function shopLink(partial: Partial<Pick<ShopFilters, 'lists' | 'stores' | 'genres' | 'features'>>): Params {
  const params = toQueryParams({ ...DEFAULT_FILTERS, ...partial });
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== null));
}
