import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Renderer2,
  signal,
  viewChild,
} from '@angular/core';
import { Icon } from '../icon/icon';

const CARD_GAP = 48;
// Movimiento mínimo (px) para considerar el gesto un arrastre y no un click.
const DRAG_THRESHOLD = 8;

interface DragState {
  startX: number;
  startOffset: number;
  moved: boolean;
}

// Fila horizontal de tarjetas con flechas y arrastre (mouse o touch). Se
// desplaza con transform (no scroll nativo): el viewport solo recorta en X,
// así el halo blur de las tarjetas sobresale por arriba y abajo.
//
// Recursos que se limpian solos:
// - ResizeObserver: se desconecta al destruir el componente.
// - pointermove/pointerup en window: SOLO existen mientras dura un arrastre.
@Component({
  selector: 'app-carousel',
  imports: [Icon],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class Carousel {
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  private readonly offset = signal(0);
  private readonly maxOffset = signal(0);
  protected readonly dragging = signal(false);

  // Derivado, no corregido con un effect: si el contenido se achica (resize),
  // el desplazamiento visible nunca queda pasado del final.
  protected readonly visibleOffset = computed(() => Math.min(this.offset(), this.maxOffset()));
  protected readonly canPrev = computed(() => this.visibleOffset() > 0);
  protected readonly canNext = computed(() => this.visibleOffset() < this.maxOffset() - 1);

  // Estado del arrastre en curso: cambia en cada pointermove pero no se
  // pinta por sí mismo, así que es un campo normal y no una signal.
  private drag: DragState | null = null;
  private removeDragListeners: (() => void) | null = null;

  constructor() {
    afterNextRender(() => {
      const viewport = this.viewport().nativeElement;
      const observer = new ResizeObserver(() => this.measure());
      observer.observe(viewport);
      observer.observe(this.track().nativeElement);

      // Fase de captura (no se puede declarar en el template): tras un
      // arrastre real, el click al soltar no debe abrir el link de la card.
      const onClickCapture = (event: MouseEvent) => {
        if (this.drag?.moved) {
          event.preventDefault();
          event.stopPropagation();
        }
        this.drag = null;
      };
      viewport.addEventListener('click', onClickCapture, true);

      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        viewport.removeEventListener('click', onClickCapture, true);
      });
    });
    this.destroyRef.onDestroy(() => this.removeDragListeners?.());
  }

  protected move(direction: 1 | -1): void {
    this.offset.set(this.clamp(this.visibleOffset() + direction * this.stepSize()));
  }

  protected startDrag(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    this.drag = { startX: event.clientX, startOffset: this.visibleOffset(), moved: false };
    this.dragging.set(true);

    const onMove = (e: PointerEvent) => {
      if (!this.drag) return;
      const dx = e.clientX - this.drag.startX;
      if (Math.abs(dx) > DRAG_THRESHOLD) this.drag.moved = true;
      this.offset.set(this.clamp(this.drag.startOffset - dx));
    };
    const onUp = () => this.endDrag();
    const unlisten = [
      this.renderer.listen('window', 'pointermove', onMove),
      this.renderer.listen('window', 'pointerup', onUp),
      this.renderer.listen('window', 'pointercancel', onUp),
    ];
    this.removeDragListeners = () => unlisten.forEach((off) => off());
  }

  private endDrag(): void {
    this.removeDragListeners?.();
    this.removeDragListeners = null;
    this.dragging.set(false);
    // Si no llegó a moverse, el click que sigue es legítimo.
    if (this.drag && !this.drag.moved) this.drag = null;
  }

  private measure(): void {
    const viewport = this.viewport().nativeElement;
    const track = this.track().nativeElement;
    this.maxOffset.set(Math.max(0, track.scrollWidth - viewport.clientWidth));
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(this.maxOffset(), value));
  }

  // Avanza tantas tarjetas como entren visibles (mínimo 1). El ancho se mide
  // del DOM porque cambia por media query.
  private stepSize(): number {
    const viewportWidth = this.viewport().nativeElement.clientWidth;
    const firstCard = this.track().nativeElement.firstElementChild;
    const perCard = (firstCard?.getBoundingClientRect().width ?? 360) + CARD_GAP;
    return Math.max(1, Math.floor(viewportWidth / perCard)) * perCard;
  }
}
