import { Component, computed, input, linkedSignal } from '@angular/core';
import type { Game } from '../../core/models/game';
import { portraitUrl } from '../../core/utils/steam-assets';

// Portada vertical con cadena de respaldo:
//   1. arte 600x900 de Steam (si el juego tiene app equivalente)
//   2. imagen de la tienda (horizontal): recortada para llenar la caja
//      (fit="cover", miniaturas) o entera sobre un fondo desenfocado
//   3. placeholder con el nombre, si ninguna carga
// `failures` es un linkedSignal: vuelve a 0 solo cuando cambia el juego.
@Component({
  selector: 'app-game-cover',
  host: { class: 'relative block overflow-hidden rounded-card bg-surface-2' },
  template: `
    @switch (stage()) {
      @case ('portrait') {
        <img
          [src]="portrait()"
          [alt]="game().name"
          loading="lazy"
          class="size-full object-cover transition duration-500 group-hover:scale-105"
          (error)="failures.set(1)"
        />
      }
      @case ('store') {
        @if (fit() === 'cover') {
          <img [src]="game().imgUrl" [alt]="game().name" loading="lazy" class="size-full object-cover" (error)="failures.set(2)" />
        } @else {
          <img [src]="game().imgUrl" alt="" aria-hidden="true" class="absolute inset-0 size-full scale-125 object-cover opacity-70 blur-xl" />
          <img [src]="game().imgUrl" [alt]="game().name" loading="lazy" class="relative size-full object-contain" (error)="failures.set(2)" />
        }
      }
      @default {
        <span class="grid size-full place-items-center p-2 text-center text-[12px] text-ink-3">{{ game().name }}</span>
      }
    }
  `,
})
export class GameCover {
  readonly game = input.required<Game>();
  readonly fit = input<'contain' | 'cover'>('contain');

  protected readonly failures = linkedSignal({ source: this.game, computation: () => 0 });
  protected readonly portrait = computed(() => portraitUrl(this.game()));

  protected readonly stage = computed<'portrait' | 'store' | 'none'>(() => {
    const failures = this.failures();
    if (failures === 0 && this.portrait()) return 'portrait';
    if (failures <= 1 && this.game().imgUrl) return 'store';
    return 'none';
  });
}
