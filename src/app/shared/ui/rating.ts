import { Component, computed, input } from '@angular/core';
import { Icon, type IconName } from './icon/icon';

// Valoración 0-5 (de las reseñas de Steam).
// - compact: "4.5 ★" (tarjetas verticales)
// - stars: cinco estrellas con medias (listas)
@Component({
  selector: 'app-rating',
  imports: [Icon],
  host: { class: 'inline-flex items-center gap-1 text-[13px]' },
  template: `
    @if (mode() === 'compact') {
      <span class="text-ink-3">{{ value().toFixed(1) }}</span>
      <app-icon name="star-fill" class="text-star" />
    } @else {
      <span class="flex gap-0.5 text-star" [attr.aria-label]="value().toFixed(1) + ' de 5'">
        @for (icon of stars(); track $index) {
          <app-icon [name]="icon" />
        }
      </span>
    }
  `,
})
export class Rating {
  readonly value = input.required<number>();
  readonly mode = input<'compact' | 'stars'>('compact');

  protected readonly stars = computed<IconName[]>(() => {
    const v = Math.round(this.value() * 2) / 2;
    return [1, 2, 3, 4, 5].map((i) => (v >= i ? 'star-fill' : v >= i - 0.5 ? 'star-half' : 'star'));
  });
}
