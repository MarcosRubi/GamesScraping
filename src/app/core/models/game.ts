export type StoreKey = 'steam' | 'gog' | 'instantGaming' | 'humble' | 'fanatical';

export type Currency = 'USD' | 'EUR';
export type Theme = 'light' | 'dark';

export interface PriceEntry {
  now?: string;
  old?: string;
}

export interface Trailer {
  name: string;
  thumbnail: string;
  // Stream HLS (Steam no publica MP4).
  hls: string;
}

// URLs reales de los assets de Steam (con hash en la ruta).
export interface GameArt {
  portrait: string | null;
  hero: string | null;
  header: string | null;
}

export interface GameDetails {
  description: string;
  heroUrl: string | null;
  logoUrl: string | null;
  background: string | null;
  trailers: Trailer[];
  screenshots: string[];
  releaseDate: string | null;
  comingSoon: boolean;
  genres: string[];
}

// Juego tal como lo devuelve la API.
export interface Game {
  name: string;
  imgUrl: string | null;
  price: PriceEntry[];
  discount: string;
  url: string;
  categories?: string[];
  reviews?: string;
  screenshots?: string[];
  appId?: string;
  // App de Steam equivalente (portada vertical, valoración).
  steamAppId?: string;
  rating?: number;
  ratingCount?: number;
  art?: GameArt;
  details?: GameDetails;
}

// Juego de una lista: lleva la tienda de origen para su tag, el link de
// compra y los filtros.
export interface StoreGame extends Game {
  store: StoreKey;
}

// Listas temáticas del catálogo (mismos slugs que la API y que la URL).
export type CatalogList = 'destacados' | 'mas-vendidos' | 'ofertas' | 'novedades' | 'proximamente' | 'mejor-valorados';

// Juego del catálogo completo (página "Juegos").
export interface CatalogGame extends StoreGame {
  lists: CatalogList[];
  // Menor = más popular.
  rank: number;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  date: number;
  feed: string;
  gameName: string;
  steamAppId: string;
  imageUrl: string | null;
}

// Una búsqueda devuelve juegos o la forma "no encontrado" ({ steam: "null" }).
export type SearchResponse = Game[] | Record<string, 'null'>;
