import type { Currency, Game } from '../models/game';
import { formatPrice, isFreePrice, parsePrice } from './currency';

export interface PriceDisplay {
  // Texto principal: precio convertido, "Gratis" o un texto de la tienda
  // ("Próximamente").
  now: string;
  old: string | null;
  kind: 'price' | 'free' | 'text' | 'missing';
  // El precio mostrado viene convertido desde otra moneda.
  converted: boolean;
  original: string;
}

// Cómo mostrar el precio de un juego en la moneda elegida.
export function priceDisplay(game: Game, currency: Currency, rate: number): PriceDisplay {
  const raw = game.price?.[0]?.now ?? '';
  const parsed = parsePrice(raw);
  const freeToPlay = !parsed && (game.categories ?? []).includes('Free to Play');

  if (isFreePrice(game.price) || freeToPlay) {
    return { now: 'Gratis', old: null, kind: 'free', converted: false, original: raw };
  }
  if (!parsed) {
    const text = raw && !/no encontrado/i.test(raw) ? raw : '';
    return { now: text, old: null, kind: text ? 'text' : 'missing', converted: false, original: raw };
  }
  const old = game.price?.[1]?.old;
  return {
    now: formatPrice(raw, currency, rate),
    old: old ? formatPrice(old, currency, rate) : null,
    kind: 'price',
    converted: parsed.currency !== currency,
    original: raw,
  };
}
