import { Component, computed, inject, input } from '@angular/core';
import type { CatalogGame } from '../../../core/models/game';
import { SearchNavigator } from '../../../core/state/search-navigator';
import { GameCover } from '../../../shared/ui/game-cover';
import { Price } from '../../../shared/ui/price';
import { Rating } from '../../../shared/ui/rating';
import { StoreTag } from '../../../shared/ui/store-tag';
import { LIST_OPTIONS } from '../shop-filters.model';

// Juego en la vista de lista: portada + datos + acciones en una fila.
@Component({
  selector: 'app-shop-list-item',
  imports: [GameCover, Price, Rating, StoreTag],
  host: { class: 'group flex gap-5 rounded-card bg-surface p-3 sm:p-4' },
  template: `
    @let g = game();
    <app-game-cover [game]="g" class="aspect-[3/4] w-24 shrink-0 sm:w-32" />
    <div class="flex min-w-0 flex-1 flex-col gap-2 py-1">
      <div class="flex flex-wrap items-center gap-2">
        <app-store-tag [store]="g.store" />
        @for (label of listLabels(); track label) {
          <span class="rounded-full bg-bg px-2.5 py-0.5 text-[11px] text-ink-2">{{ label }}</span>
        }
      </div>
      <h3 class="text-[17px] leading-snug text-ink">{{ g.name }}</h3>
      <div class="flex flex-wrap items-center gap-3 text-[13px] text-ink-2">
        @if (g.rating) {
          <app-rating [value]="g.rating" mode="stars" />
          @if (g.ratingCount) {
            <span>({{ g.ratingCount.toLocaleString('es') }} reseñas)</span>
          }
        }
        @for (category of (g.categories ?? []).slice(0, 3); track category) {
          <span class="text-ink-3">· {{ category }}</span>
        }
      </div>
      <div class="mt-auto flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          @if (g.discount) {
            <span class="rounded-full bg-black px-2 py-0.5 text-[11px] font-medium text-white">{{ g.discount }}</span>
          }
          <app-price [game]="g" class="text-[16px]" />
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn-soft" (click)="search.compare(g.name)">Comparar</button>
          <a [href]="g.url" target="_blank" rel="noreferrer" class="btn-primary">Ver en la tienda</a>
        </div>
      </div>
    </div>
  `,
})
export class ShopListItem {
  protected readonly search = inject(SearchNavigator);
  readonly game = input.required<CatalogGame>();

  protected readonly listLabels = computed(() =>
    this.game()
      .lists.map((key) => LIST_OPTIONS.find((o) => o.key === key)?.label)
      .filter((label): label is string => !!label),
  );
}
