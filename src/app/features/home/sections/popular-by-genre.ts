import { Component, computed, inject } from '@angular/core';
import { GENRES } from '../../../core/genres';
import { HomeDataStore } from '../../../core/state/home-data.store';
import { UiStore } from '../../../core/state/ui.store';
import { GameCard } from '../../../shared/ui/game-card';
import { CardGridSkeleton } from '../ui/card-grid-skeleton';

// "Populares por género": lista de géneros a la izquierda y los cinco más
// populares de Steam del elegido. El género vive en UiStore porque también
// lo eligen los mosaicos, el menú y el footer.
@Component({
  selector: 'app-popular-by-genre',
  imports: [GameCard, CardGridSkeleton],
  template: `
    <div class="page grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <nav class="rounded-card bg-surface p-5" aria-label="Géneros">
        <h2 class="mb-3 text-[22px]">Populares por género</h2>
        <ul class="flex flex-wrap gap-x-4 gap-y-1 lg:block">
          @for (genre of genres; track genre.slug) {
            <li>
              <button
                type="button"
                class="py-1.5 text-[15px] transition-colors"
                [class]="ui.popularGenre() === genre.slug ? 'text-accent' : 'text-ink hover:text-accent'"
                [attr.aria-current]="ui.popularGenre() === genre.slug"
                (click)="ui.popularGenre.set(genre.slug)"
              >
                {{ genre.label }}
              </button>
            </li>
          }
        </ul>
      </nav>

      @if (games(); as list) {
        <div class="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
          @for (game of list; track game.url) {
            <app-game-card [game]="game" [showStore]="false" />
          } @empty {
            <p class="col-span-full self-center text-sm text-ink-3">No pudimos cargar este género ahora.</p>
          }
        </div>
      } @else {
        <app-card-grid-skeleton [count]="5" />
      }
    </div>
  `,
})
export class PopularByGenre {
  protected readonly ui = inject(UiStore);
  private readonly home = inject(HomeDataStore);
  protected readonly genres = GENRES;

  protected readonly games = computed(() => this.home.popularInGenre(this.ui.popularGenre()));
}
