import { DestroyRef, inject, signal, type Signal } from '@angular/core';

// Helpers que convierten eventos del navegador en signals. Deben llamarse en
// un contexto de inyección (constructor / inicializador de campo): registran
// la limpieza del listener en el DestroyRef del componente que los usa, así
// el listener muere con el componente y no queda escuchando de fondo.

// true mientras la media query coincide (ej. "(max-width: 1199px)").
export function mediaQuery(query: string): Signal<boolean> {
  const mql = window.matchMedia(query);
  const matches = signal(mql.matches);
  const onChange = (event: MediaQueryListEvent) => matches.set(event.matches);
  mql.addEventListener('change', onChange);
  inject(DestroyRef).onDestroy(() => mql.removeEventListener('change', onChange));
  return matches.asReadonly();
}

// true mientras la pestaña está visible. Sirve para pausar timers (auto
// rotación, slideshows) cuando nadie está mirando.
export function pageVisible(): Signal<boolean> {
  const visible = signal(document.visibilityState === 'visible');
  const onChange = () => visible.set(document.visibilityState === 'visible');
  document.addEventListener('visibilitychange', onChange);
  inject(DestroyRef).onDestroy(() => document.removeEventListener('visibilitychange', onChange));
  return visible.asReadonly();
}
