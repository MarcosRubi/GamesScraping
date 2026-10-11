import { Component, computed, effect, input, signal } from '@angular/core';
import { pageVisible } from '../../core/browser/browser-signals';
import type { Game } from '../../core/models/game';

const IMAGE_ROTATE_MS = 3500;
const SWIPE_MIN_PX = 40;

// SOLO pantallas < 1200px: la imagen del slide activo es un mini slideshow
// (portada + screenshots) que rota sola y se cambia deslizando. El padre lo
// recrea en cada cambio de juego, así arranca siempre en la portada.
@Component({
  selector: 'app-slide-image',
  host: {
    class: 'featured__img featured__img--swipe',
    '(pointerdown)': 'dragStartX = $event.clientX',
    '(pointerup)': 'endDrag($event.clientX)',
    '(pointercancel)': 'dragStartX = null',
  },
  template: `
    <!-- track por src: cada imagen nueva se monta de cero y entra con fade -->
    @for (src of [currentSrc()]; track src) {
      <img class="featured__img-bg" [src]="src" alt="" aria-hidden="true" />
      <img class="featured__img-main" [src]="src" [alt]="game().name" />
    }
  `,
})
export class SlideImage {
  readonly game = input.required<Game>();

  private readonly visible = pageVisible();
  private readonly index = signal(0);
  // Inicio del gesto: no se pinta, así que es un campo normal.
  protected dragStartX: number | null = null;

  private readonly images = computed(() =>
    [this.game().imgUrl, ...(this.game().screenshots ?? [])].filter((src): src is string => !!src),
  );
  protected readonly currentSrc = computed(() => this.images()[this.index() % this.images().length]);

  constructor() {
    // El timer existe solo si hay más de una imagen y la pestaña está a la
    // vista; onCleanup lo corta al cambiar esas condiciones o al destruirse.
    effect((onCleanup) => {
      const count = this.images().length;
      if (count < 2 || !this.visible()) return;
      const timer = setInterval(() => this.index.update((i) => (i + 1) % count), IMAGE_ROTATE_MS);
      onCleanup(() => clearInterval(timer));
    });
  }

  protected endDrag(clientX: number): void {
    if (this.dragStartX === null) return;
    const dx = clientX - this.dragStartX;
    this.dragStartX = null;
    const count = this.images().length;
    if (Math.abs(dx) < SWIPE_MIN_PX || count < 2) return;
    this.index.update((i) => (i + (dx < 0 ? 1 : -1) + count) % count);
  }
}
