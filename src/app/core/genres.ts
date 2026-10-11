// Géneros de la home (los mismos slugs que la API: /listings/genre-<slug>).
export interface Genre {
  slug: string;
  label: string;
}

export const GENRES: readonly Genre[] = [
  { slug: 'action', label: 'Acción' },
  { slug: 'adventure', label: 'Aventura' },
  { slug: 'casual', label: 'Casual' },
  { slug: 'horror', label: 'Terror' },
  { slug: 'indie', label: 'Indie' },
  { slug: 'racing', label: 'Carreras' },
  { slug: 'rpg', label: 'RPG' },
  { slug: 'simulation', label: 'Simulación' },
];

// Los seis que aparecen como mosaicos debajo del hero.
export const TILE_GENRES = GENRES.slice(0, 6);
