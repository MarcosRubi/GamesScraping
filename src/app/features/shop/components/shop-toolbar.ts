import { Component, input, output } from '@angular/core';
import { Icon } from '../../../shared/ui/icon/icon';
import { PAGE_SIZES, SORT_OPTIONS, type PageSize, type SortKey, type ViewMode } from '../shop-filters.model';

// Barra superior de resultados: título, "Mostrar 9/12/18/24", vista
// (lista / 3 / 4 columnas) y orden.
@Component({
  selector: 'app-shop-toolbar',
  imports: [Icon],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <h1 class="text-2xl">{{ title() }}</h1>

      <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 text-[13px] font-medium lg:hidden"
          (click)="openFilters.emit()"
        >
          <app-icon name="funnel" /> Filtros
          @if (activeFilters() > 0) {
            <span class="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] text-white">{{ activeFilters() }}</span>
          }
        </button>

        <div class="hidden items-center gap-1.5 text-[13px] text-ink-2 sm:flex" role="group" aria-label="Juegos por página">
          <span class="font-medium text-ink">Mostrar:</span>
          @for (size of pageSizes; track size; let last = $last) {
            <button
              type="button"
              class="transition-colors"
              [class]="size === perPage() ? 'font-semibold text-ink' : 'hover:text-accent'"
              [attr.aria-pressed]="size === perPage()"
              (click)="perPageChange.emit(size)"
            >
              {{ size }}
            </button>
            @if (!last) {
              <span class="text-ink-3">/</span>
            }
          }
        </div>

        <div class="hidden items-center gap-1 md:flex" role="group" aria-label="Vista">
          @for (mode of views; track mode.key) {
            <button
              type="button"
              class="grid size-8 place-items-center rounded-md transition-colors"
              [class]="view() === mode.key ? 'text-ink' : 'text-ink-3 hover:text-ink'"
              [attr.aria-pressed]="view() === mode.key"
              [attr.aria-label]="mode.label"
              [title]="mode.label"
              (click)="viewChange.emit(mode.key)"
            >
              @if (mode.key === 'lista') {
                <app-icon name="menu" class="text-xl" />
              } @else {
                <!-- Cuadrícula de puntos 3x3 / 4x4, como en el diseño -->
                <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
                  @for (dot of mode.dots; track $index) {
                    <circle [attr.cx]="dot[0]" [attr.cy]="dot[1]" [attr.r]="mode.key === 'grilla-3' ? 1.6 : 1.25" />
                  }
                </svg>
              }
            </button>
          }
        </div>

        <label class="relative">
          <span class="sr-only">Ordenar</span>
          <select
            #sortSelect
            class="h-10 appearance-none rounded-full border border-hairline bg-bg pr-9 pl-4 text-[13px] text-ink outline-none focus:border-accent"
            [value]="sort()"
            (change)="sortChange.emit($any(sortSelect.value))"
          >
            @for (option of sortOptions; track option.key) {
              <option [value]="option.key">{{ option.label }}</option>
            }
          </select>
          <app-icon name="chevron-down" class="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[11px] text-ink-3" />
        </label>
      </div>
    </div>
  `,
})
export class ShopToolbar {
  readonly title = input.required<string>();
  readonly perPage = input.required<PageSize>();
  readonly view = input.required<ViewMode>();
  readonly sort = input.required<SortKey>();
  readonly activeFilters = input(0);

  readonly perPageChange = output<PageSize>();
  readonly viewChange = output<ViewMode>();
  readonly sortChange = output<SortKey>();
  readonly openFilters = output<void>();

  protected readonly pageSizes = PAGE_SIZES;
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly views: { key: ViewMode; label: string; dots: number[][] }[] = [
    { key: 'lista', label: 'Vista de lista', dots: [] },
    { key: 'grilla-3', label: 'Tres columnas', dots: grid(3) },
    { key: 'grilla-4', label: 'Cuatro columnas', dots: grid(4) },
  ];
}

// Coordenadas de una cuadrícula n×n de puntos dentro de un viewBox 16×16.
function grid(n: number): number[][] {
  const step = 16 / n;
  return Array.from({ length: n * n }, (_, i) => [step * (i % n) + step / 2, step * Math.floor(i / n) + step / 2]);
}
