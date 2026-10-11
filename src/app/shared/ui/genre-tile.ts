import { Component, computed, inject, input, output } from '@angular/core';
import type { Genre } from '../../core/genres';
import { HomeDataStore } from '../../core/state/home-data.store';
import { GameCover } from './game-cover';

// Mosaico de un género: nombre + collage inclinado de portadas (del género
// en Steam, pedido a demanda). `onSurface` lo aclara para fondos grises;
// `active` lo marca como filtro aplicado.
@Component({
  selector: 'app-genre-tile',
  imports: [GameCover],
  styles: `
    .collage {
      transform: rotate(-14deg) translate(8%, -14%);
    }
  `,
  template: `
    <button
      type="button"
      class="group relative block h-[118px] w-full overflow-hidden rounded-card text-left transition-shadow hover:shadow-float"
      [class]="onSurface() ? 'bg-bg' : 'bg-surface'"
      [class.ring-2]="active()"
      [class.ring-accent]="active()"
      [attr.aria-pressed]="active()"
      (click)="picked.emit(genre().slug)"
    >
      <div class="collage absolute -top-2 right-[-18%] grid w-[78%] grid-cols-3 gap-1.5 transition-transform duration-500 group-hover:scale-105">
        @for (game of covers(); track game.url) {
          <app-game-cover [game]="game" class="aspect-[3/4] w-full rounded-md! shadow-md" />
        }
      </div>
      <div class="absolute inset-0 bg-gradient-to-r to-transparent" [class]="onSurface() ? 'from-bg via-bg/70' : 'from-surface via-surface/70'"></div>
      <span class="absolute bottom-3 left-4 text-[16px] font-medium" [class]="active() ? 'text-accent' : 'text-ink'">{{ genre().label }}</span>
    </button>
  `,
})
export class GenreTile {
  private readonly home = inject(HomeDataStore);
  readonly genre = input.required<Genre>();
  readonly onSurface = input(false);
  readonly active = input(false);
  readonly picked = output<string>();

  protected readonly covers = computed(() => (this.home.genre(this.genre().slug)() ?? []).slice(0, 6));
}
