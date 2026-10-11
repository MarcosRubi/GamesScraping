import { DOCUMENT, effect, inject, type Signal } from '@angular/core';

// Cierra un panel desplegable con click afuera o Escape.
//
// Los listeners de document SOLO existen mientras `isOpen()` es true: el
// effect los registra al abrir y su onCleanup los quita al cerrar (o al
// destruirse el componente). Con el panel cerrado no hay nada escuchando
// cada click de la página.
export function dismissOnOutside(
  isOpen: Signal<boolean>,
  inside: () => readonly (Element | undefined)[],
  close: () => void,
): void {
  const document = inject(DOCUMENT);

  effect((onCleanup) => {
    if (!isOpen()) return;

    const onPointerDown = (event: Event) => {
      const target = event.target as Node;
      if (!inside().some((el) => el?.contains(target))) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    onCleanup(() => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    });
  });
}
