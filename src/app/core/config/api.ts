import { environment } from '../../../environments/environment';

// Rutas de la API en un solo lugar.
export const api = {
  listing: (key: string) => `${environment.apiUrl}/listings/${key}`,
  search: (storeSlug: string, term: string) => `${environment.apiUrl}/search/${storeSlug}/${encodeURIComponent(term)}`,
  news: () => `${environment.apiUrl}/news`,
  catalog: () => `${environment.apiUrl}/catalog`,
};
