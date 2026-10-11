import { Component, computed, inject } from '@angular/core';
import { HomeDataStore, type ListState } from '../../../core/state/home-data.store';
import { GameRow } from '../../../shared/ui/game-row';

// Cuatro columnas con listas cortas, cada una de una fuente distinta y sin
// repetir lo que ya apareció más arriba.
@Component({
  selector: 'app-list-columns',
  imports: [GameRow],
  template: `
    <div class="page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      @for (column of columns(); track column.title) {
        <div>
          <h2 class="mb-4 text-[19px]">{{ column.title }}</h2>
          <div class="space-y-1 rounded-card bg-surface p-3">
            @if (column.games === null) {
              @for (n of [0, 1, 2, 3, 4]; track n) {
                <div class="skeleton h-[84px] rounded-lg"></div>
              }
            } @else {
              @for (game of column.games; track game.url) {
                <app-game-row [game]="game" />
              } @empty {
                <p class="p-3 text-sm text-ink-3">Sin juegos por ahora.</p>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ListColumns {
  private readonly home = inject(HomeDataStore);

  protected readonly columns = computed<{ title: string; games: ListState }[]>(() => [
    { title: 'Novedades', games: this.home.newReleases() },
    { title: 'Próximamente', games: this.home.comingSoon() },
    { title: 'Mejor valorados', games: this.home.topRated() },
    { title: 'Más ofertas en Steam', games: this.home.steamDeals() },
  ]);
}
