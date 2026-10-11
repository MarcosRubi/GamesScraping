import { Component, computed, input, output } from '@angular/core';
import { Icon } from '../../../shared/ui/icon/icon';

// Paginación numérica con elipsis: 1 … 4 5 [6] 7 8 … 20.
@Component({
  selector: 'app-pagination',
  imports: [Icon],
  template: `
    @if (pages() > 1) {
      <nav class="flex items-center justify-center gap-1.5" aria-label="Paginación">
        <button
          type="button"
          class="grid size-9 place-items-center rounded-md text-ink-2 transition hover:text-accent disabled:opacity-30"
          aria-label="Página anterior"
          [disabled]="page() <= 1"
          (click)="change.emit(page() - 1)"
        >
          <app-icon name="chevron-left" />
        </button>
        @for (item of items(); track $index) {
          @if (item === null) {
            <span class="px-1 text-ink-3">…</span>
          } @else {
            <button
              type="button"
              class="grid size-9 place-items-center rounded-md text-[14px] transition"
              [class]="item === page() ? 'bg-accent font-medium text-white' : 'text-ink-2 hover:bg-surface'"
              [attr.aria-current]="item === page() ? 'page' : null"
              (click)="change.emit(item)"
            >
              {{ item }}
            </button>
          }
        }
        <button
          type="button"
          class="grid size-9 place-items-center rounded-md text-ink-2 transition hover:text-accent disabled:opacity-30"
          aria-label="Página siguiente"
          [disabled]="page() >= pages()"
          (click)="change.emit(page() + 1)"
        >
          <app-icon name="chevron-right" />
        </button>
      </nav>
    }
  `,
})
export class Pagination {
  readonly page = input.required<number>();
  readonly pages = input.required<number>();
  readonly change = output<number>();

  // Siempre la primera, la última y dos alrededor de la actual.
  protected readonly items = computed<(number | null)[]>(() => {
    const total = this.pages();
    const current = this.page();
    const wanted = new Set([1, total, current - 2, current - 1, current, current + 1, current + 2]);
    const pages = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
    const out: (number | null)[] = [];
    pages.forEach((p, i) => {
      if (i > 0 && p - pages[i - 1] > 1) out.push(null);
      out.push(p);
    });
    return out;
  });
}
