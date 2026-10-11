import type { Game } from '../models/game';
import { formatPrice, isFreePrice, parsePrice, priceToUsdValue } from './currency';
import { cleanGameName, dedupeCheapest, interleave } from './game-lists';

const game = (name: string, now: string): Game => ({
  name,
  imgUrl: null,
  price: [{ now }],
  discount: '',
  url: `https://x/${name}`,
});

describe('currency', () => {
  it('detecta la moneda del precio', () => {
    expect(parsePrice('US$13.49')).toEqual({ value: 13.49, currency: 'USD' });
    expect(parsePrice('EU€12,50')).toEqual({ value: 12.5, currency: 'EUR' });
    expect(parsePrice('Free')).toBeNull();
  });

  it('convierte solo cuando la moneda difiere', () => {
    expect(formatPrice('EU€10.00', 'USD', 1.2)).toBe('US$12.00');
    expect(formatPrice('US$12.00', 'EUR', 1.2)).toBe('€10.00');
    expect(formatPrice('US$5.00', 'USD', 1.2)).toBe('US$5.00');
  });

  it('compara en USD y manda los no parseables al final', () => {
    expect(priceToUsdValue([{ now: 'EU€10' }], 1.5)).toBe(15);
    expect(priceToUsdValue([{ now: 'Gratis' }], 1.5)).toBe(Infinity);
  });

  it('reconoce juegos gratis', () => {
    expect(isFreePrice([{ now: 'Free To Play' }])).toBe(true);
    expect(isFreePrice([{ now: 'US$0.00' }])).toBe(true);
    expect(isFreePrice([{ now: 'US$10.00' }])).toBe(false);
    expect(isFreePrice([{ now: 'EU€20,00' }])).toBe(false);
  });
});

describe('game-lists', () => {
  it('limpia sufijos de plataforma y marcas', () => {
    expect(cleanGameName('Hollow Knight™ - PC (Steam)')).toBe('Hollow Knight');
  });

  it('deduplica quedándose con el más barato, en orden de llegada', () => {
    const result = dedupeCheapest(
      [game('Hades', 'US$20'), game('Celeste', 'US$5'), game('HADES - PC', 'EU€10')],
      1.1,
    );
    expect(result.map((g) => g.price[0].now)).toEqual(['EU€10', 'US$5']);
  });

  it('intercala round-robin', () => {
    expect(interleave([['a1', 'a2', 'a3'], ['b1'], ['c1', 'c2']])).toEqual(['a1', 'b1', 'c1', 'a2', 'c2', 'a3']);
  });
});
