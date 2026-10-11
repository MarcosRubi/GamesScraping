import { Component, computed, inject, input } from '@angular/core';
import type { ListState } from '../../core/state/home-data.store';
import { FiltersStore } from '../../core/state/filters.store';
import { SearchStore } from '../../core/state/search.store';
import { GameCard } from '../../shared/game-card/game-card';

const SKELETONS = Array.from({ length: 8 }, (_, i) => i);

// Sección agregada de la home (Mejores ofertas / Nuevos lanzamientos / Más
// vendidos): grilla filtrable por tienda y categoría.
@Component({
  selector: 'app-home-section',
  imports: [GameCard],
  styleUrl: './sections.scss',
  template: `
    @let list = filtered();
    @if (list === null) {
      <!-- Skeletons con la forma de la card: la página no salta al llegar los datos. -->
      <section class="section page" aria-busy="true">
        <h2 class="section-title">{{ title() }}</h2>
        <div class="game-grid">
          @for (n of skeletons; track n) {
            <div class="skeleton skeleton-card"></div>
          }
        </div>
      </section>
    } @else if (list.length > 0) {
      <section class="section page">
        <h2 class="section-title">{{ title() }}</h2>
        <div class="game-grid">
          @for (game of list; track game.url) {
            <app-game-card
              [game]="game"
              [store]="game.store"
              [showCompare]="canCompare()"
              (compare)="search.compare($event)"
            />
          }
        </div>
      </section>
    }
  `,
})
export class HomeSection {
  protected readonly search = inject(SearchStore);
  private readonly filters = inject(FiltersStore);

  readonly title = input.required<string>();
  readonly games = input.required<ListState>();

  protected readonly skeletons = SKELETONS;

  protected readonly filtered = computed(() => {
    const games = this.games();
    // matches() lee las signals del filtro: el computed queda suscrito a
    // ellas y se recalcula solo cuando cambian.
    return games === null ? null : games.filter((game) => this.filters.matches(game));
  });

  // Con una sola tienda filtrada, "Comparar precios" buscaría solo en esa.
  protected readonly canCompare = computed(() => this.filters.stores().length !== 1);
}
