// Parseo y conversión de precios USD ↔ EUR. Los scrapers devuelven strings
// con la moneda embebida ("US$13.49", "EU€12.00", "Free"); acá se detecta
// la moneda de origen y se convierte a la elegida por el usuario con el
// tipo de cambio en vivo (EUR→USD) que mantiene MainContext.

export const FALLBACK_EUR_USD = 1.1;

// Extrae { value, currency } de un string de precio. Devuelve null si no
// hay número (Free / Gratis / vacío).
export function parsePrice(priceStr) {
    const str = String(priceStr || "");
    const match = str.match(/\d+(?:[.,]\d+)?/);
    if (!match) return null;
    const value = parseFloat(match[0].replace(",", "."));
    if (isNaN(value)) return null;
    const isEur = /€|eur/i.test(str);
    return { value, currency: isEur ? "EUR" : "USD" };
}

// Devuelve el string de precio en la moneda destino. Si ya está en esa
// moneda (o no es parseable, ej. "Free") devuelve el original intacto.
export function formatPrice(priceStr, targetCurrency, eurUsdRate) {
    const parsed = parsePrice(priceStr);
    if (!parsed || parsed.currency === targetCurrency) return priceStr;
    const rate = eurUsdRate || FALLBACK_EUR_USD;
    const converted =
        targetCurrency === "USD" ? parsed.value * rate : parsed.value / rate;
    return targetCurrency === "USD"
        ? `US$${converted.toFixed(2)}`
        : `€${converted.toFixed(2)}`;
}

// Valor numérico en USD para COMPARAR precios entre tiendas (no se muestra).
// Infinity cuando no hay precio parseable, así nunca gana un dedupe.
export function priceToUsdValue(priceArr, eurUsdRate) {
    if (!Array.isArray(priceArr) || !priceArr[0]) return Infinity;
    const parsed = parsePrice(priceArr[0].now);
    if (!parsed) return Infinity;
    const rate = eurUsdRate || FALLBACK_EUR_USD;
    return parsed.currency === "EUR" ? parsed.value * rate : parsed.value;
}
