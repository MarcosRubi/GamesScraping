import type { Routes } from '@angular/router';

// Cada página es un chunk aparte que se descarga al navegar a ella.
export const routes: Routes = [
  {
    path: '',
    title: 'GameScraping — Compara precios de videojuegos',
    loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'buscar',
    title: 'Buscar — GameScraping',
    loadComponent: () => import('./features/search/search-page').then((m) => m.SearchPage),
  },
  { path: '**', redirectTo: '' },
];
