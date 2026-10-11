import { Component, computed, inject, input, output } from '@angular/core';
import { TILE_GENRES, type Genre } from '../../../core/genres';
import { HomeDataStore } from '../../../core/state/home-data.store';
import { UiStore } from '../../../core/state/ui.store';
import { scrollToId } from '../../../core/browser/scroll';
import { GameCover } from '../../../shared/ui/game-cover';

// Un mosaico: nombre del género + collage inclinado de portadas.
@Component({
  selector: 'app-genre-tile',
  imports: [GameCover],
  styles: `
    .collage {
      transform: rotate(-14deg) translate(8%, -14%);
    }
  `,
  template: `
    <button
      type="button"
      class="group relative block h-[118px] w-full overflow-hidden rounded-card bg-surface text-left transition-shadow hover:shadow-float"
      (click)="picked.emit(genre().slug)"
    >
      <div class="collage absolute -top-2 right-[-18%] grid w-[78%] grid-cols-3 gap-1.5 transition-transform duration-500 group-hover:scale-105">
        @for (game of covers(); track game.url) {
          <app-game-cover [game]="game" class="aspect-[3/4] w-full rounded-md! shadow-md" />
        }
      </div>
      <div class="absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-transparent"></div>
      <span class="absolute bottom-3 left-4 text-[16px] font-medium text-ink">{{ genre().label }}</span>
    </button>
  `,
})
export class GenreTile {
  private readonly home = inject(HomeDataStore);
  readonly genre = input.required<Genre>();
  readonly picked = output<string>();

  protected readonly covers = computed(() => (this.home.genre(this.genre().slug)() ?? []).slice(0, 6));
}

// Fila de seis géneros debajo del hero. Elegir uno abre "Populares por
// género" con esa categoría.
@Component({
  selector: 'app-genre-tiles',
  imports: [GenreTile],
  template: `
    <section class="page mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6" aria-label="Géneros">
      @for (genre of genres; track genre.slug) {
        <app-genre-tile [genre]="genre" (picked)="pick($event)" />
      }
    </section>
  `,
})
export class GenreTiles {
  private readonly ui = inject(UiStore);
  protected readonly genres = TILE_GENRES;

  protected pick(slug: string): void {
    this.ui.popularGenre.set(slug);
    scrollToId('populares');
  }
}
