import type { StoreKey } from './models/game';

export interface StoreInfo {
  key: StoreKey;
  // Nombre completo (tarjetas, botones de compra).
  label: string;
  // Nombre corto para el filtro.
  shortLabel: string;
  // Etiqueta mínima para tarjetas angostas (móvil).
  tinyLabel: string;
  // Segmento de la API: /steam/:juego, /top-sellers-instant-gaming...
  apiSlug: string;
}

export const STORE_KEYS: readonly StoreKey[] = ['steam', 'gog', 'instantGaming', 'humble', 'fanatical'];

export const STORES: Record<StoreKey, StoreInfo> = {
  steam: { key: 'steam', label: 'Steam', shortLabel: 'Steam', tinyLabel: 'Steam', apiSlug: 'steam' },
  gog: { key: 'gog', label: 'GOG', shortLabel: 'GOG', tinyLabel: 'GOG', apiSlug: 'gog' },
  instantGaming: {
    key: 'instantGaming',
    label: 'Instant Gaming',
    shortLabel: 'Instant Gaming',
    tinyLabel: 'IG',
    apiSlug: 'instant-gaming',
  },
  humble: { key: 'humble', label: 'Humble Store', shortLabel: 'Humble', tinyLabel: 'Humble', apiSlug: 'humble' },
  fanatical: { key: 'fanatical', label: 'Fanatical', shortLabel: 'Fanatical', tinyLabel: 'Fanatical', apiSlug: 'fanatical' },
};

// Tienda a partir del slug de la API / URL ("instant-gaming" → instantGaming).
export function storeFromSlug(slug: string): StoreKey | undefined {
  return STORE_KEYS.find((key) => STORES[key].apiSlug === slug);
}
