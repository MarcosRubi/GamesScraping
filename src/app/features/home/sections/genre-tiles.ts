import { Component, inject } from '@angular/core';
import { TILE_GENRES } from '../../../core/genres';
import { UiStore } from '../../../core/state/ui.store';
import { scrollToId } from '../../../core/browser/scroll';
import { GenreTile } from '../../../shared/ui/genre-tile';

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
