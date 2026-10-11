import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

// Vuelve arriba solo cuando cambia la página (el path), no cuando cambian
// los query params: filtrar en /juegos no debe saltar al principio. Los
// links con fragmento (/#populares) los resuelve el anchorScrolling del
// router. Llamar en un contexto de inyección; se desuscribe con su DestroyRef.
export function scrollTopOnPageChange(): void {
  const router = inject(Router);
  let previousPath: string | null = null;

  router.events
    .pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(inject(DestroyRef)),
    )
    .subscribe((event) => {
      const url = router.parseUrl(event.urlAfterRedirects);
      const path = url.root.children['primary']?.segments.map((s) => s.path).join('/') ?? '';
      if (previousPath !== null && path !== previousPath && !url.fragment) {
        window.scrollTo({ top: 0 });
      }
      previousPath = path;
    });
}
