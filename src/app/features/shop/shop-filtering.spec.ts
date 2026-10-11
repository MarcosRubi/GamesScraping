import type { CatalogGame } from '../../core/models/game';
import type { CatalogEntry } from '../../core/state/catalog.store';
import { DEFAULT_FILTERS, parseFilters, shopLink, toQueryParams, type ShopFilters } from './shop-filters.model';
import { facetCounts, matches, sortEntries } from './shop-filtering';

type EntryOverrides = Partial<Omit<CatalogEntry, 'game'>> & { game?: Partial<CatalogGame> };

function entry(name: string, over: EntryOverrides = {}): CatalogEntry {
  const game: CatalogGame = {
    name,
    imgUrl: null,
    price: [{ now: 'US$10' }],
    discount: '',
    url: `https://x/${name}`,
    store: 'steam',
    lists: [],
    rank: 0,
    ...over.game,
  };
  return { price: 10, discount: 0, free: false, genres: [], searchName: name.toLowerCase(), ...over, game };
}

const filters = (over: Partial<ShopFilters>): ShopFilters => ({ ...DEFAULT_FILTERS, ...over });

describe('shop filtering', () => {
  const catalog = [
    entry('A', { price: 5, genres: ['Acción'], game: { store: 'steam', lists: ['ofertas'], rank: 2, rating: 4.5 } }),
    entry('B', { price: 30, genres: ['RPG'], discount: 50, game: { store: 'gog', lists: ['mas-vendidos'], rank: 1 } }),
    entry('C', { price: null, genres: ['Acción', 'RPG'], game: { store: 'steam', lists: ['proximamente'], rank: 3 } }),
    entry('D', { price: 0, free: true, genres: ['Casual'], game: { store: 'humble', lists: [], rank: 0, rating: 3 } }),
  ];
  const names = (f: ShopFilters) => catalog.filter((e) => matches(e, f)).map((e) => e.game.name);

  it('combina facetas con Y, y opciones de una faceta con O', () => {
    expect(names(filters({ stores: ['steam'], genres: ['Acción', 'RPG'] }))).toEqual(['A', 'C']);
    expect(names(filters({ stores: ['steam'], lists: ['ofertas'] }))).toEqual(['A']);
  });

  it('rango de precio excluye los que no tienen precio', () => {
    expect(names(filters({ min: 1, max: 20 }))).toEqual(['A']);
    expect(names(filters({ max: 0 }))).toEqual(['D']);
  });

  it('características', () => {
    expect(names(filters({ features: ['oferta'] }))).toEqual(['B']);
    expect(names(filters({ features: ['gratis'] }))).toEqual(['D']);
    expect(names(filters({ features: ['valoracion'] }))).toEqual(['A']);
  });

  it('ordena con los sin precio al final', () => {
    const order = (sort: ShopFilters['sort']) => sortEntries(catalog, sort).map((e) => e.game.name);
    expect(order('popularidad')).toEqual(['D', 'B', 'A', 'C']);
    expect(order('precio-asc')).toEqual(['D', 'A', 'B', 'C']);
    expect(order('precio-desc')).toEqual(['B', 'A', 'D', 'C']);
  });

  it('cuenta cada faceta ignorando su propio filtro', () => {
    const counts = facetCounts(catalog, filters({ stores: ['steam'] }), 'stores');
    expect(counts.get('steam')).toBe(2);
    expect(counts.get('gog')).toBe(1);
    const genres = facetCounts(catalog, filters({ stores: ['steam'] }), 'genres');
    expect(genres.get('Acción')).toBe(2);
    expect(genres.get('Casual')).toBeUndefined();
  });
});

describe('filtros en la URL', () => {
  it('ida y vuelta sin perder nada', () => {
    const f = filters({ lists: ['novedades'], stores: ['instantGaming'], genres: ['Acción'], min: 5, sort: 'nombre', page: 3 });
    const params = Object.fromEntries(Object.entries(toQueryParams(f)).filter(([, v]) => v !== null).map(([k, v]) => [k, String(v)]));
    expect(params).toEqual({ lista: 'novedades', tienda: 'instant-gaming', genero: 'Acción', min: '5', orden: 'nombre', pagina: '3' });
    expect(parseFilters(params)).toEqual(f);
  });

  it('ignora valores inválidos', () => {
    expect(parseFilters({ lista: 'nada', tienda: 'epic', mostrar: '7', pagina: '-2' })).toEqual(DEFAULT_FILTERS);
  });

  it('links de "Ver todos"', () => {
    expect(shopLink({ lists: ['ofertas'], stores: ['steam'] })).toEqual({ lista: 'ofertas', tienda: 'steam' });
  });
});
