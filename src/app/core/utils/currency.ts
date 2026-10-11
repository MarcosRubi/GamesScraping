import type { Currency, PriceEntry } from '../models/game';

// Parseo y conversión de precios USD ↔ EUR. La API devuelve strings con la
// moneda embebida ("US$13.49", "EU€12.00", "Free"); acá se detecta la
// moneda de origen y se convierte a la elegida por el usuario con el tipo
// de cambio en vivo (EUR→USD).

export const FALLBACK_EUR_USD = 1.1;

export interface ParsedPrice {
  value: number;
  currency: Currency;
}

// Extrae { value, currency } de un string de precio. null si no hay número
// (Free / Gratis / vacío).
export function parsePrice(priceStr: string | undefined | null): ParsedPrice | null {
  const str = String(priceStr || '');
  const match = str.match(/\d+(?:[.,]\d+)?/);
  if (!match) return null;
  const value = parseFloat(match[0].replace(',', '.'));
  if (isNaN(value)) return null;
  return { value, currency: /€|eur/i.test(str) ? 'EUR' : 'USD' };
}

// Devuelve el precio en la moneda destino. Si ya está en esa moneda (o no
// es parseable, ej. "Free") devuelve el original intacto.
export function formatPrice(priceStr: string | undefined, target: Currency, eurUsdRate: number): string {
  const parsed = parsePrice(priceStr);
  if (!parsed || parsed.currency === target) return priceStr ?? '';
  const rate = eurUsdRate || FALLBACK_EUR_USD;
  const converted = target === 'USD' ? parsed.value * rate : parsed.value / rate;
  return target === 'USD' ? `US$${converted.toFixed(2)}` : `€${converted.toFixed(2)}`;
}

// Valor en USD para COMPARAR precios entre tiendas (no se muestra).
// Infinity cuando no hay precio parseable, así nunca gana una comparación.
export function priceToUsdValue(price: PriceEntry[] | undefined, eurUsdRate: number): number {
  const parsed = parsePrice(price?.[0]?.now);
  if (!parsed) return Infinity;
  const rate = eurUsdRate || FALLBACK_EUR_USD;
  return parsed.currency === 'EUR' ? parsed.value * rate : parsed.value;
}

// Gratis: "Free"/"Gratis" en el precio actual, o un precio que vale 0.
// (La versión React buscaba "0.00" como texto y marcaba US$10.00 como gratis.)
export function isFreePrice(price: PriceEntry[] | undefined): boolean {
  const now = price?.[0]?.now;
  return /free|gratis/i.test(String(now ?? '')) || parsePrice(now)?.value === 0;
}
