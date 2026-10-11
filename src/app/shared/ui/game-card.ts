import { Component, computed, inject, input } from '@angular/core';
import type { StoreGame } from '../../core/models/game';
import { SearchNavigator } from '../../core/state/search-navigator';
import { StoreTag } from './store-tag';
import { GameCover } from './game-cover';
import { Icon } from './icon/icon';
import { Price } from './price';
import { Rating } from './rating';

// Tarjeta vertical del diseño: portada con badges, nombre + valoración y
// precio. Al pasar el mouse aparecen "Comprar" (link a la tienda) y
// "Comparar" (busca el juego en todas las tiendas).
@Component({
  selector: 'app-game-card',
  imports: [GameCover, Icon, Price, Rating, StoreTag],
  host: { class: 'group block min-w-0' },
  template: `
    @let g = game();
    <div class="relative">
      <app-game-cover [game]="g" class="aspect-[3/4] w-full" />

      <!-- Badges y tienda en una misma fila: nunca se pisan -->
      <div class="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-1.5">
        <div class="flex flex-col items-start gap-1.5">
          @for (badge of badges(); track badge) {
            <span class="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-black shadow-sm">{{ badge }}</span>
          }
        </div>
        @if (showStore()) {
          <app-store-tag class="shrink-0" [store]="g.store" [compact]="true" />
        }
      </div>

      <!-- Acciones al hover (siempre visibles en pantallas táctiles) -->
      <div
        class="absolute inset-x-2.5 bottom-2.5 flex gap-1.5 opacity-100 transition-opacity duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
      >
        <a [href]="g.url" target="_blank" rel="noreferrer" class="btn-primary min-w-0 flex-1 px-3! py-2! text-xs!">
          {{ buyLabel() }}
        </a>
        <!-- En tarjetas angostas (móvil, 2 columnas) "Comparar" queda solo con ícono -->
        <button
          type="button"
          class="grid shrink-0 place-items-center rounded-full bg-white/90 px-2.5 py-2 text-xs font-medium text-black backdrop-blur transition hover:bg-white sm:px-3"
          title="Buscar este juego en todas las tiendas"
          aria-label="Comparar precios"
          (click)="compare()"
        >
          <app-icon name="search" class="sm:hidden" />
          <span class="hidden sm:inline">Comparar</span>
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
