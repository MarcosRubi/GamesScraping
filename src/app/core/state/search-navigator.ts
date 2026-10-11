import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { trackEvent } from '../config/analytics';
import { cleanGameName } from '../utils/game-lists';
import { UiStore } from './ui.store';

// La búsqueda vive en la URL (/buscar?q=...): se puede compartir, recargar
// y volver atrás. Este servicio solo navega; la página de resultados es la
// que pide los datos (y los cancela si el usuario se va).
@Injectable({ providedIn: 'root' })
export class SearchNavigator {
  private readonly router = inject(Router);
  private readonly ui = inject(UiStore);

  search(rawTerm: string): void {
    const term = rawTerm.trim();
    if (!term) return;
    this.ui.searchOpen.set(false);
    trackEvent('search', { term });
    void this.router.navigate(['/buscar'], { queryParams: { q: term } });
  }

  // "Comparar" desde una tarjeta: busca ese juego en todas las tiendas.
  compare(gameName: string): void {
    this.search(cleanGameName(gameName));
  }
}
