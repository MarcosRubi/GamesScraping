import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { GENRES } from '../../../core/genres';
import { GenreTile } from '../../../shared/ui/genre-tile';
import { Icon } from '../../../shared/ui/icon/icon';

// Carrusel de géneros del encabezado: scroll nativo con snap (se arrastra
// con el dedo en móvil) y flechas que avanzan de a una "página". El estado
// de las flechas sale del evento scroll del propio contenedor (listener del
// template: se va con el componente).
@Component({
  selector: 'app-genre-carousel',
  imports: [GenreTile, Icon],
  styles: `
    .track {
      scrollbar-width: none;
    }
    .track::-webkit-scrollbar {
      display: none;
    }
  `,
  template: `
    <div class="relative">
      <button
        type="button"
        class="absolute top-1/2 -left-3 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-bg text-ink shadow-float transition hover:text-accent disabled:opacity-0 sm:grid xl:-left-12 xl:bg-transparent xl:shadow-none"
        aria-label="Géneros anteriores"
        [disabled]="atStart()"
        (click)="scrollPage(-1)"
      >
        <app-icon name="chevron-left" />
      </button>

      <div #track class="track flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth" (scroll)="updateArrows()">
        @for (genre of genres; track genre.slug) {
          <app-genre-tile
            class="w-[calc((100%-1rem)/2)] shrink-0 snap-start sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-5rem)/6)]"
            [genre]="genre"
            [onSurface]="true"
            [active]="selected().includes(genre.label)"
            (picked)="toggle.emit(genre.label)"
          />
        }
      </div>

      <button
        type="button"
        class="absolute top-1/2 -right-3 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-bg text-ink shadow-float transition hover:text-accent disabled:opacity-0 sm:grid xl:-right-12 xl:bg-transparent xl:shadow-none"
        aria-label="Más géneros"
        [disabled]="atEnd()"
        (click)="scrollPage(1)"
      >
        <app-icon name="chevron-right" />
      </button>
    </div>
  `,
})
export class GenreCarousel {
  readonly selected = input<string[]>([]);
  readonly toggle = output<string>();

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  protected readonly genres = GENRES;
  protected readonly atStart = signal(true);
  protected readonly atEnd = signal(false);

  protected scrollPage(dir: 1 | -1): void {
    const el = this.track().nativeElement;
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  }

  protected updateArrows(): void {
    const el = this.track().nativeElement;
    this.atStart.set(el.scrollLeft <= 2);
    this.atEnd.set(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }
}
