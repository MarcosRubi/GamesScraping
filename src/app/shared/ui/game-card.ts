import { Component, computed, inject, input } from '@angular/core';
import type { StoreGame } from '../../core/models/game';
import { SearchNavigator } from '../../core/state/search-navigator';
import { StoreTag } from './store-tag';
import { GameCover } from './game-cover';
import { Price } from './price';
import { Rating } from './rating';

// Tarjeta vertical del diseño: portada con badges, nombre + valoración y
// precio. Al pasar el mouse aparecen "Comprar" (link a la tienda) y
// "Comparar" (busca el juego en todas las tiendas).
@Component({
  selector: 'app-game-card',
  imports: [GameCover, Price, Rating, StoreTag],
  host: { class: 'group block min-w-0' },
  template: `
    @let g = game();
    <div class="relative">
      <app-game-cover [game]="g" class="aspect-[3/4] w-full" />

      <div class="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
        @for (badge of badges(); track badge) {
          <span class="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-black shadow-sm">{{ badge }}</span>
        }
      </div>
      @if (showStore()) {
        <app-store-tag class="absolute top-2.5 right-2.5" [store]="g.store" />
      }

      <!-- Acciones al hover (siempre visibles en pantallas táctiles) -->
      <div
        class="absolute inset-x-2.5 bottom-2.5 flex gap-1.5 opacity-100 transition-opacity duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
      >
        <a [href]="g.url" target="_blank" rel="noreferrer" class="btn-primary flex-1 px-3! py-2! text-xs!">
          {{ buyLabel() }}
        </a>
        <button
          type="button"
          class="rounded-full bg-white/90 px-3 py-2 text-xs font-medium text-black backdrop-blur transition hover:bg-white"
          title="Buscar este juego en todas las tiendas"
          (click)="compare()"
        >
          Comparar
        </button>
      </div>
    </div>

    <div class="mt-2.5 flex items-start justify-between gap-2">
      <h3 class="min-w-0 truncate text-[15px] text-ink" [title]="g.name">{{ g.name }}</h3>
      @if (g.rating) {
        <app-rating [value]="g.rating" class="shrink-0" />
      }
    </div>
    <app-price [game]="g" class="mt-0.5 text-[14px]" />
  `,
})
export class GameCard {
  private readonly search = inject(SearchNavigator);

  readonly game = input.required<StoreGame>();
  // Badges arriba a la izquierda ("Top", "Nuevo"); el descuento se agrega solo.
  readonly labels = input<string[]>([]);
  readonly showStore = input(true);

  protected readonly badges = computed(() => {
    const discount = this.game().discount;
    return discount ? [discount, ...this.labels()] : this.labels();
  });
  protected readonly buyLabel = computed(() => (this.game().price?.[0]?.now === 'Próximamente' ? 'Ver en la tienda' : 'Comprar'));

  protected compare(): void {
    this.search.compare(this.game().name);
  }
}
