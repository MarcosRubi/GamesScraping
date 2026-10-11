import { Component, computed, inject, input } from '@angular/core';
import type { StoreKey } from '../../core/models/game';
import { HomeDataStore } from '../../core/state/home-data.store';
import { SearchStore } from '../../core/state/search.store';
import { STORES } from '../../core/stores';
import { Carousel } from '../../shared/carousel/carousel';
import { GameCard } from '../../shared/game-card/game-card';

// "Los más vendidos de {tienda}" en carrusel. El padre la envuelve en
// @defer (on viewport): las tarjetas, imágenes y el carrusel recién se crean
// cuando la sección se acerca a la pantalla.
@Component({
  selector: 'app-store-section',
  imports: [Carousel, GameCard],
  styleUrl: './sections.scss',
  template: `
    <section class="section page">
      <h2 class="section-title">Los más vendidos de {{ label() }}</h2>
      @let list = games();
      @if (list === null) {
        <div class="flex gap-12 overflow-hidden py-4">
          @for (n of [0, 1, 2, 3]; track n) {
            <div class="skeleton skeleton-card carousel-card"></div>
          }
        </div>
      } @else {
        <app-carousel>
          @for (game of list; track game.url) {
            <app-game-card
              class="carousel-card"
              [game]="game"
              [store]="store()"
              [showCompare]="true"
              (compare)="search.compare($event)"
            />
          }
        </app-carousel>
      }
    </section>
  `,
})
export class StoreSection {
  protected readonly search = inject(SearchStore);
  private readonly homeData = inject(HomeDataStore);

  readonly store = input.required<StoreKey>();

  protected readonly label = computed(() => STORES[this.store()].label);
  protected readonly games = computed(() => this.homeData.topSellers[this.store()]());
}
