import type { Game } from '../models/game';
import { priceToUsdValue } from './currency';

// Limpia sufijos de plataforma ("... - PC (Steam)") y símbolos de marca para
// que el nombre funcione como búsqueda en las 5 tiendas.
export function cleanGameName(name: string): string {
  return String(name || '')
    .split(' - ')[0]
    .replace(/\(.*?\)/g, '')
    .replace(/[®™©]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Clave para agrupar el mismo título entre tiendas: minúsculas y solo
// alfanuméricos, sin sufijos de plataforma.
export function normalizeName(name: string): string {
  return cleanGameName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// Ante un mismo título se queda con el de precio más bajo (comparado en USD
// con el tipo de cambio en vivo). Conserva el orden de llegada.
export function dedupeCheapest<T extends Game>(games: T[], eurUsdRate: number): T[] {
  const byName = new Map<string, T>();
  for (const game of games) {
    const key = normalizeName(game.name);
    const prev = byName.get(key);
    if (!prev || priceToUsdValue(game.price, eurUsdRate) < priceToUsdValue(prev.price, eurUsdRate)) {
      byName.set(key, game);
    }
  }
  return [...byName.values()];
}

// Intercala round-robin (a1, b1, c1, a2, b2...) para que ninguna tienda
// domine el principio de la lista.
export function interleave<T>(lists: T[][]): T[] {
  const out: T[] = [];
  const maxLen = Math.max(0, ...lists.map((list) => list.length));
  for (let i = 0; i < maxLen; i++) {
    for (const list of lists) {
      if (list[i]) out.push(list[i]);
    }
  }
  return out;
}

export function discountValue(discount: string): number {
  return parseInt(discount, 10);
}
