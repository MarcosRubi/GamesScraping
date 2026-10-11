import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

// Vuelve arriba solo cuando cambia la página (el path), no cuando cambian
// los query params: filtrar en /juegos no debe saltar al principio. Los
// links con fragmento (/#populares) los resuelve el anchorScrolling del
// router. Con atrás/adelante (popstate) recupera el scroll que tenía esa
// entrada del historial, así la tienda vuelve tal cual estaba. Llamar en un
// contexto de inyección; se desuscribe con su DestroyRef.
export function scrollTopOnPageChange(): void {
  const router = inject(Router);
  // Scroll por entrada del historial (el navigationId que guarda el router).
  const positions = new Map<number, number>();
  let currentKey = 0;
  let pendingKey = 0;
  let restoreTo: number | null = null;
  let previousPath: string | null = null;

  router.events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((event) => {
    if (event instanceof NavigationStart) {
      positions.set(currentKey, window.scrollY);
      const restored = event.navigationTrigger === 'popstate' ? event.restoredState : null;
      pendingKey = restored?.navigationId ?? event.id;
      restoreTo = restored ? (positions.get(restored.navigationId) ?? null) : null;
      return;
    }
    if (!(event instanceof NavigationEnd)) return;

    currentKey = pendingKey;
    const url = router.parseUrl(event.urlAfterRedirects);
    const path = url.root.children['primary']?.segments.map((s) => s.path).join('/') ?? '';
    if (restoreTo !== null) {
      restoreScroll(restoreTo);
    } else if (previousPath !== null && path !== previousPath && !url.fragment) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    previousPath = path;
  });
}

// La página recién montada puede tardar unos frames en tener su alto
// final (imágenes, @defer): reintenta hasta llegar o hasta ~1 s.
function restoreScroll(top: number, tries = 60): void {
  requestAnimationFrame(() => {
    window.scrollTo({ top, behavior: 'instant' });
    if (Math.abs(window.scrollY - top) > 2 && tries > 0) restoreScroll(top, tries - 1);
  });
}
