import { httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { api } from '../config/api';
import type { CatalogGame, Currency } from '../models/game';
import { storeFromSlug } from '../stores';
import { FALLBACK_EUR_USD, isFreePrice, priceToUsdValue } from '../utils/currency';
import { discountValue } from '../utils/game-lists';
import { ExchangeRateStore } from './exchange-rate.store';
import { PreferencesStore } from './preferences.store';

// Juego del catálogo con los valores que usan filtros y orden ya calculados
// (una vez por cambio de datos o de moneda, no en cada filtrado).
export interface CatalogEntry {
  game: CatalogGame;
  // Precio en la moneda elegida; null si no se conoce (ej. "Próximamente").
  price: number | null;
  discount: number;
  free: boolean;
  genres: string[];
  searchName: string;
}

interface CatalogResponse {
  games: (Omit<CatalogGame, 'store'> & { store: string })[];
  updatedAt: string;
}

// Catálogo completo para la página "Juegos": una sola petición (la API ya
// junta y deduplica todas las listas). Se crea la primera vez que alguien
// lo inyecta, o sea al entrar a esa página.
@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly rate = inject(ExchangeRateStore).eurUsdRate;
  private readonly currency = inject(PreferencesStore).currency;
  private readonly resource = httpResource<CatalogResponse>(() => api.catalog());

  readonly loading = computed(() => this.resource.isLoading());
  readonly failed = computed(() => this.resource.status() === 'error');

  readonly entries = computed<CatalogEntry[] | null>(() => {
    if (!this.resource.hasValue()) return null;
    const rate = this.rate() || FALLBACK_EUR_USD;
    const currency = this.currency();
    return (this.resource.value()?.games ?? []).flatMap((raw) => {
      const store = storeFromSlug(raw.store);
      if (!store) return [];
      const game: CatalogGame = { ...raw, store };
      const free = isFreePrice(game.price) || (game.categories ?? []).includes('Free to Play');
      return [
        {
          game,
          price: free ? 0 : toCurrency(priceToUsdValue(game.price, rate), currency, rate),
          discount: game.discount ? Math.abs(discountValue(game.discount)) || 0 : 0,
          free,
          genres: game.categories ?? [],
          searchName: game.name.toLowerCase(),
        },
      ];
    });
  });

  // Tope del slider de precio (en la moneda elegida).
  readonly maxPrice = computed(() => {
    const prices = (this.entries() ?? []).map((e) => e.price ?? 0);
    return Math.max(10, Math.ceil(Math.max(0, ...prices) / 10) * 10);
  });
}

function toCurrency(usd: number, currency: Currency, rate: number): number | null {
  if (!Number.isFinite(usd)) return null;
  return currency === 'USD' ? usd : usd / rate;
}
