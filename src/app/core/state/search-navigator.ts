import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { trackEvent } from '../config/analytics';
import { cleanGameName } from '../utils/game-lists';
import { UiStore } from './ui.store';

// La búsqueda del buscador vive en la URL (/buscar?q=...): se puede
// compartir, recargar y volver atrás. "Comparar" en cambio abre un modal
// encima de la página actual, para que al cerrarlo quede donde estaba. Este
// servicio no pide datos: lo hace PriceComparison (y los cancela al cerrar).
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
    const term = cleanGameName(gameName).trim();
    if (!term) return;
    this.ui.searchOpen.set(false);
    trackEvent('compare', { term });
    this.ui.compare.set(term);
  }
}
