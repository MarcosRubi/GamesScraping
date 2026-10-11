import type { Game } from '../models/game';

const ASSETS = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps';

// Imágenes de Steam del juego. La API manda las URLs reales en `art` (las
// rutas llevan hash); si no vinieron, se prueba la ruta clásica por appid y
// los componentes caen a imgUrl si falla.

export function portraitUrl(game: Game): string | null {
  if (game.art?.portrait) return game.art.portrait;
  return game.steamAppId ? `${ASSETS}/${game.steamAppId}/library_600x900.jpg` : null;
}

// Arte ancho (1920x620); si no hay, la cápsula de la tienda.
export function wideArtUrl(game: Pick<Game, 'steamAppId' | 'imgUrl' | 'art'>): string | null {
  if (game.art?.hero) return game.art.hero;
  return game.steamAppId ? `${ASSETS}/${game.steamAppId}/library_hero.jpg` : game.imgUrl;
}

// Fondo del hero / destacado: arte hero, fondo de la página o una captura.
export function heroUrl(game: Game): string | null {
  return (
    game.details?.heroUrl ??
    game.art?.hero ??
    game.details?.background ??
    game.details?.screenshots[0] ??
    game.imgUrl
  );
}
