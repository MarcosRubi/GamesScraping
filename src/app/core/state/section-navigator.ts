import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { scrollToId } from '../browser/scroll';

// Lleva a una sección de la home desde el header, el footer o el menú.
// - Ya en la home: solo scroll (navegar a la misma URL no hace nada y el
//   router podría devolver la página arriba).
// - Desde otra página: navega con fragmento (/#populares); el router salta
//   al ancla apenas pinta la home, y un segundo scroll corrige la posición
//   cuando las secciones de arriba terminan de cargar (cambian de alto).
@Injectable({ providedIn: 'root' })
export class SectionNavigator {
  private readonly router = inject(Router);

  goTo(id: string): void {
    const onHome = this.router.parseUrl(this.router.url).root.children['primary'] === undefined;
    if (onHome) {
      scrollToId(id);
    } else {
      void this.router.navigate(['/'], { fragment: id }).then(() => setTimeout(() => scrollToId(id), 500));
    }
  }

  goHome(): void {
    void this.router.navigate(['/']).then(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}
