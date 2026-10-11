import { Location } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../../shared/ui/icon/icon';
import { PriceComparison } from './price-comparison';

// Página /buscar?q=... (búsquedas del buscador del header). El término llega
// como input desde la URL (withComponentInputBinding). "Volver" usa el
// historial: la tienda conserva filtros (en la URL) y scroll (lo restaura
// scrollTopOnPageChange).
@Component({
  selector: 'app-search-page',
  imports: [Icon, PriceComparison],
  templateUrl: './search-page.html',
})
export class SearchPage {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly q = input('');

  protected readonly term = computed(() => this.q().trim());

  // Página desde la que se llegó (null si se entró directo por URL).
  private readonly previousPath = computed(() => {
    const previous = this.router.lastSuccessfulNavigation()?.previousNavigation;
    if (!previous) return null;
    return previous.finalUrl?.root.children['primary']?.segments.map((s) => s.path).join('/') ?? '';
  });
  protected readonly backLabel = computed(() => {
    switch (this.previousPath()) {
      case 'juegos':
        return 'Volver a la tienda';
      case '':
        return 'Volver al inicio';
      default:
        return 'Volver';
    }
  });

  protected back(): void {
    if (this.previousPath() !== null) this.location.back();
    else void this.router.navigate(['/']);
  }
}
