import { Component, computed, inject } from '@angular/core';
import { RouterLink, type Params } from '@angular/router';
import { shopLink } from '../../shop/shop-filters.model';
import { HomeDataStore, type ListState } from '../../../core/state/home-data.store';
import { GameRow } from '../../../shared/ui/game-row';

// Cuatro columnas con listas cortas, cada una de una fuente distinta y sin
// repetir lo que ya apareció más arriba.
@Component({
  selector: 'app-list-columns',
  imports: [RouterLink, GameRow],
  template: `
    <div class="page grid grid-cols-[minmax(0,1fr)] gap-6 sm:grid-cols-2 lg:grid-cols-4">
      @for (column of columns(); track column.title) {
        <div>
          <div class="mb-4 flex items-center justify-between gap-2">
            <h2 class="text-[19px]">{{ column.title }}</h2>
            <a routerLink="/juegos" [queryParams]="column.link" class="btn-soft px-3! py-1.5! text-[12px]!">Ver más</a>
          </div>
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

  protected readonly columns = computed<{ title: string; games: ListState; link: Params }[]>(() => [
    { title: 'Novedades', games: this.home.newReleases(), link: shopLink({ lists: ['novedades'] }) },
    { title: 'Próximamente', games: this.home.comingSoon(), link: shopLink({ lists: ['proximamente'] }) },
    { title: 'Mejor valorados', games: this.home.topRated(), link: shopLink({ lists: ['mejor-valorados'] }) },
    {
      title: 'Más ofertas en Steam',
      games: this.home.steamDeals(),
      link: shopLink({ lists: ['ofertas'], stores: ['steam'] }),
    },
  ]);
}
