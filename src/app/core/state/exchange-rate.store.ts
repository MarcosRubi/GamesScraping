import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { readStorage, writeStorage } from '../browser/storage';
import { FALLBACK_EUR_USD } from '../utils/currency';

const FX_KEY = 'gs-fx';
const FX_MAX_AGE_MS = 12 * 60 * 60 * 1000; // el tipo de cambio del BCE es diario
const FX_URL = 'https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD';

interface CachedRate {
  rate: number;
  ts: number;
}

function readCachedRate(): CachedRate | null {
  try {
    const saved = JSON.parse(readStorage(FX_KEY) ?? 'null') as CachedRate | null;
    return saved && saved.rate > 0 ? saved : null;
  } catch {
    return null;
  }
}

// Tipo de cambio EUR→USD en vivo (API de Frankfurter: datos del BCE, gratis,
// sin key). Arranca con el último valor cacheado y, si tiene más de 12h, lo
// refresca UNA vez. No hay polling: un HttpClient.get emite y completa, así
// que la suscripción se cierra sola y no queda nada corriendo.
@Injectable({ providedIn: 'root' })
export class ExchangeRateStore {
  private readonly http = inject(HttpClient);
  private readonly cached = readCachedRate();

  readonly eurUsdRate = signal(this.cached?.rate ?? FALLBACK_EUR_USD);

  constructor() {
    if (this.cached && Date.now() - this.cached.ts < FX_MAX_AGE_MS) return;
    this.http.get<{ rates?: { USD?: number } }>(FX_URL).subscribe({
      next: (data) => {
        const rate = data.rates?.USD;
        if (rate && rate > 0) {
          this.eurUsdRate.set(rate);
          writeStorage(FX_KEY, JSON.stringify({ rate, ts: Date.now() }));
        }
      },
      // Sin red: se sigue con el último valor conocido.
      error: () => {},
    });
  }
}
