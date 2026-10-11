import { Component, input } from '@angular/core';
import type { StoreGame } from '../../core/models/game';
import { GameCover } from './game-cover';
import { Price } from './price';
import { Rating } from './rating';

// Fila horizontal (listas del costado del hero, columnas, buscador):
// miniatura vertical + nombre + estrellas + precio. Toda la fila es el link
// a la tienda.
@Component({
  selector: 'app-game-row',
  imports: [GameCover, Price, Rating],
  host: { class: 'block' },
  template: `
    @let g = game();
    <a [href]="g.url" target="_blank" rel="noreferrer" class="group flex items-center gap-3.5 rounded-lg p-1 transition-colors hover:bg-surface-2">
      <app-game-cover [game]="g" class="h-[76px] w-[57px] shrink-0 rounded-md!" />
      <div class="min-w-0">
        <p class="truncate text-[14px] text-ink group-hover:text-accent" [title]="g.name">{{ g.name }}</p>
        @if (g.rating) {
          <app-rating [value]="g.rating" mode="stars" class="mt-0.5 text-[12px]" />
        }
        <app-price [game]="g" class="mt-0.5 text-[13px]" />
      </div>
    </a>
  `,
})
export class GameRow {
  readonly game = input.required<StoreGame>();
}
