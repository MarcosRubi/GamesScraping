import { afterNextRender, Component, DestroyRef, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import type { Trailer } from '../../core/models/game';
import { Icon } from './icon/icon';

// Reproductor de tráilers de Steam (HLS). hls.js se descarga recién al
// abrir el primer tráiler (import dinámico → chunk aparte) y la instancia se
// destruye al cerrar: no queda descargando video en segundo plano.
// Safari reproduce HLS nativo y ni siquiera carga la librería.
@Component({
  selector: 'app-trailer-player',
  imports: [Icon],
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    <div class="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm animate-fade-in" (click)="closed.emit()"></div>
    <div
      class="fixed top-1/2 left-1/2 z-[310] w-[94vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 animate-fade-in"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="trailer().name"
    >
      <div class="mb-2 flex items-center justify-between gap-4 text-white">
        <p class="truncate text-sm">{{ trailer().name }}</p>
        <button type="button" class="rounded-full bg-white/10 p-2 transition hover:bg-white/20" aria-label="Cerrar" (click)="closed.emit()">
          <app-icon name="close" />
        </button>
      </div>
      <div class="relative aspect-video overflow-hidden rounded-xl bg-black">
        <video #video class="size-full" controls autoplay playsinline [poster]="trailer().thumbnail"></video>
        @if (error()) {
          <p class="absolute inset-0 grid place-items-center text-sm text-white/80">No se pudo cargar el tráiler.</p>
        }
      </div>
    </div>
  `,
})
export class TrailerPlayer {
  readonly trailer = input.required<Trailer>();
  readonly closed = output<void>();

  private readonly video = viewChild.required<ElementRef<HTMLVideoElement>>('video');
  protected readonly error = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    let destroyed = false;
    let cleanup: (() => void) | null = null;
    destroyRef.onDestroy(() => {
      destroyed = true;
      cleanup?.();
    });

    afterNextRender(async () => {
      const video = this.video().nativeElement;
      const src = this.trailer().hls;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        cleanup = () => video.removeAttribute('src');
        return;
      }

      const { default: Hls } = await import('hls.js');
      // El usuario pudo cerrar mientras se descargaba la librería.
      if (destroyed) return;
      if (!Hls.isSupported()) {
        this.error.set(true);
        return;
      }
      const hls = new Hls({ capLevelToPlayerSize: true });
      hls.on(Hls.Events.ERROR, (_event, data) => data.fatal && this.error.set(true));
      hls.loadSource(src);
      hls.attachMedia(video);
      cleanup = () => hls.destroy();
    });
  }
}
