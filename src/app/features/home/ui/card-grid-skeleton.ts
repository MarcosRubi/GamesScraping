import { Component, computed, input } from '@angular/core';

// Placeholder de una grilla de tarjetas verticales mientras carga.
@Component({
  selector: 'app-card-grid-skeleton',
  host: { class: 'grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3', '[class]': 'colsClass()', 'aria-hidden': 'true' },
  template: `
    @for (n of items(); track n) {
      <div>
        <div class="skeleton aspect-[3/4] rounded-card"></div>
        <div class="skeleton mt-3 h-4 w-3/4 rounded"></div>
        <div class="skeleton mt-2 h-4 w-1/3 rounded"></div>
      </div>
    }
  `,
})
export class CardGridSkeleton {
  readonly count = input(6);
  protected readonly items = computed(() => Array.from({ length: this.count() }, (_, i) => i));
  protected readonly colsClass = computed(() => (this.count() % 5 === 0 ? 'lg:grid-cols-5' : 'lg:grid-cols-6'));
}
