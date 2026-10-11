import { Component, computed, input, linkedSignal } from '@angular/core';
import type { Game, StoreKey } from '../../core/models/game';
import { GameCard } from '../../shared/game-card/game-card';
import { Icon } from '../../shared/icon/icon';

// Resultado de una tienda: muestra uno de sus juegos y permite pasar entre
// ellos (n/m). El índice es un linkedSignal: estado local editable que se
// reinicia solo a 0 cuando llega otra lista (nueva búsqueda), sin effect.
@Component({
  selector: 'app-store-result-card',
  imports: [GameCard, Icon],
  styleUrl: './store-result-card.scss',
  template: `
    <app-game-card [game]="current()" [store]="store()" [highlight]="highlight()">
      @if (games().length > 1) {
        <div class="result-nav">
          <button type="button" class="result-nav__arrow" aria-label="Resultado anterior" (click)="step(-1)">
            <app-icon name="chevron-left" />
          </button>
          <span class="result-nav__count">{{ index() + 1 }}/{{ games().length }}</span>
          <button type="button" class="result-nav__arrow" aria-label="Siguiente resultado" (click)="step(1)">
            <app-icon name="chevron-right" />
          </button>
        </div>
      }
    </app-game-card>
  `,
})
export class StoreResultCard {
  readonly games = input.required<Game[]>();
  readonly store = input.required<StoreKey>();
  readonly highlight = input(false);

  protected readonly index = linkedSignal({ source: this.games, computation: () => 0 });
  protected readonly current = computed(() => this.games()[this.index()]);

  protected step(dir: 1 | -1): void {
    const total = this.games().length;
    this.index.update((i) => (i + dir + total) % total);
  }
}
