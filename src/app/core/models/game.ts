export type StoreKey = 'steam' | 'gog' | 'instantGaming' | 'humble' | 'fanatical';

export type Currency = 'USD' | 'EUR';
export type Theme = 'light' | 'dark';

export interface PriceEntry {
  now?: string;
  old?: string;
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
}

// Juego de una lista de la home: lleva estampada la tienda de origen para
// mostrar su tag y poder filtrar.
export interface StoreGame extends Game {
  store: StoreKey;
}

// Una búsqueda devuelve juegos o la forma "no encontrado" ({ steam: "null" }).
export type SearchResponse = Game[] | Record<string, 'null'>;
