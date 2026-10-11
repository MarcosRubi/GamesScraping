import { Component, computed, input, linkedSignal } from '@angular/core';
import type { Game, StoreGame, StoreKey } from '../../core/models/game';
import { STORES } from '../../core/stores';
import { GameCover } from '../../shared/ui/game-cover';
import { Icon } from '../../shared/ui/icon/icon';
import { Price } from '../../shared/ui/price';
import { StoreTag } from '../../shared/ui/store-tag';

// Resultado de una tienda: uno de sus juegos con navegación n/m. El índice
// es un linkedSignal: estado local que vuelve solo a 0 con otra búsqueda.
@Component({
  selector: 'app-store-result-card',
  imports: [GameCover, Icon, Price, StoreTag],
  host: { class: 'group block min-w-0' },
  template: `
    @let g = current();
    <div class="relative rounded-card" [class]="best() ? 'ring-2 ring-accent ring-offset-4 ring-offset-bg' : ''">
      <app-game-cover [game]="g" class="aspect-[3/4] w-full" />
      <app-store-tag class="absolute top-2.5 left-2.5" [store]="store()" />
      @if (best()) {
        <span class="absolute top-2.5 right-2.5 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-white">Mejor precio</span>
      }
      @if (games().length > 1) {
        <div class="absolute inset-x-0 bottom-2.5 flex justify-center">
          <div class="flex items-center gap-1 rounded-full bg-white/95 px-1.5 py-1 text-[12px] font-medium text-black shadow">
            <button type="button" class="rounded-full p-1 hover:bg-black/10" aria-label="Resultado anterior" (click)="step(-1)">
              <app-icon name="chevron-left" />
            </button>
            {{ index() + 1 }}/{{ games().length }}
            <button type="button" class="rounded-full p-1 hover:bg-black/10" aria-label="Siguiente resultado" (click)="step(1)">
              <app-icon name="chevron-right" />
            </button>
          </div>
        </div>
      }
    </div>
    <h3 class="mt-3 line-clamp-2 text-[15px] leading-snug text-ink" [title]="g.name">{{ g.name }}</h3>
    <app-price [game]="g" class="mt-1 text-[15px]" />
    <a [href]="g.url" target="_blank" rel="noreferrer" class="btn-primary mt-3 w-full">Comprar en {{ storeLabel() }}</a>
  `,
})
export class StoreResultCard {
  readonly games = input.required<Game[]>();
  readonly store = input.required<StoreKey>();
  readonly best = input(false);

  protected readonly index = linkedSignal({ source: this.games, computation: () => 0 });
  protected readonly current = computed<StoreGame>(() => ({ ...this.games()[this.index()], store: this.store() }));
  protected readonly storeLabel = computed(() => STORES[this.store()].label);

  protected step(dir: 1 | -1): void {
    const total = this.games().length;
    this.index.update((i) => (i + dir + total) % total);
  }
}
