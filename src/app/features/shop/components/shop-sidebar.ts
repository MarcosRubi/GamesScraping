import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { STORE_KEYS, STORES } from '../../../core/stores';
import { Icon } from '../../../shared/ui/icon/icon';
import { FEATURE_OPTIONS, LIST_OPTIONS, type ShopFilters } from '../shop-filters.model';
import { PriceRange, type PriceRangeValue } from './price-range';

export interface FacetCounts {
  lists: Map<string, number>;
  stores: Map<string, number>;
  genres: Map<string, number>;
  features: Map<string, number>;
}

type MultiFacet = 'lists' | 'stores' | 'genres' | 'features';

const GENRES_COLLAPSED = 8;

// Panel de filtros (columna izquierda en escritorio, panel lateral en
// móvil). No guarda filtros propios: recibe los aplicados y emite cambios;
// la página los pasa a la URL. Lo único local es la búsqueda de géneros.
@Component({
  selector: 'app-shop-sidebar',
  imports: [NgTemplateOutlet, Icon, PriceRange],
  template: `
    <div class="space-y-7">
      <section>
        <h3 class="mb-4 text-[15px] font-medium">Precio</h3>
        <app-price-range
          [value]="{ min: filters().min, max: filters().max }"
          [bound]="maxPrice()"
          [symbol]="currencySymbol()"
          (apply)="price.emit($event)"
        />
      </section>

      <section class="border-t border-hairline pt-6">
        <h3 class="mb-3 text-[15px] font-medium">Lista</h3>
        @for (option of lists; track option.key) {
          <ng-container *ngTemplateOutlet="row; context: { facet: 'lists', key: option.key, label: option.label }" />
        }
      </section>

      <section class="border-t border-hairline pt-6">
        <h3 class="mb-3 text-[15px] font-medium">Tienda</h3>
        @for (store of stores; track store.key) {
          <ng-container *ngTemplateOutlet="row; context: { facet: 'stores', key: store.key, label: store.label }" />
        }
      </section>

      <section class="border-t border-hairline pt-6">
        <h3 class="mb-3 text-[15px] font-medium">Género</h3>
        <label class="mb-3 flex h-10 items-center rounded-full border border-hairline bg-bg pr-3 pl-4 focus-within:border-accent">
          <input
            #search
            type="search"
            class="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-ink-3"
            placeholder="Buscar un género"
            aria-label="Buscar un género"
            (input)="genreQuery.set(search.value)"
          />
          <app-icon name="search" class="text-ink-3" />
        </label>
        <div class="max-h-[264px] overflow-y-auto pr-1">
          @for (genre of visibleGenres(); track genre) {
            <ng-container *ngTemplateOutlet="row; context: { facet: 'genres', key: genre, label: genre }" />
          } @empty {
            <p class="py-1 text-[13px] text-ink-3">Sin coincidencias.</p>
          }
        </div>
        @if (!genreQuery() && genreOptions().length > collapsedCount) {
          <button type="button" class="mt-2 text-[13px] text-accent hover:underline" (click)="showAllGenres.set(!showAllGenres())">
            {{ showAllGenres() ? 'Ver menos' : 'Ver todos (' + genreOptions().length + ')' }}
          </button>
        }
      </section>

      <section class="border-t border-hairline pt-6">
        <h3 class="mb-3 text-[15px] font-medium">Características</h3>
        @for (option of features; track option.key) {
          <ng-container *ngTemplateOutlet="row; context: { facet: 'features', key: option.key, label: option.label }" />
        }
      </section>
    </div>

    <!-- Una opción con checkbox y su contador -->
    <ng-template #row let-facet="facet" let-key="key" let-label="label">
      @let checked = isChecked(facet, key);
      @let count = countOf(facet, key);
      <label
        class="flex cursor-pointer items-center gap-2.5 py-1.5 text-[14px] transition-colors"
        [class]="checked ? 'text-ink' : count === 0 ? 'text-ink-3' : 'text-ink-2 hover:text-ink'"
      >
        <input type="checkbox" class="size-4 shrink-0 accent-[var(--gs-accent)]" [checked]="checked" (change)="toggle.emit({ facet, key })" />
        <span class="min-w-0 flex-1 truncate">{{ label }}</span>
        <span
          class="grid h-5 min-w-7 place-items-center rounded-full border px-1.5 text-[11px]"
          [class]="checked ? 'border-accent bg-accent text-white' : 'border-hairline text-ink-3'"
        >
          {{ count }}
        </span>
      </label>
    </ng-template>
  `,
})
export class ShopSidebar {
  readonly filters = input.required<ShopFilters>();
  readonly counts = input.required<FacetCounts>();
  readonly genreOptions = input.required<string[]>();
  readonly maxPrice = input.required<number>();
  readonly currencySymbol = input('US$');

  readonly toggle = output<{ facet: MultiFacet; key: string }>();
  readonly price = output<PriceRangeValue>();

  protected readonly lists = LIST_OPTIONS;
  protected readonly features = FEATURE_OPTIONS;
  protected readonly stores = STORE_KEYS.map((key) => STORES[key]);
  protected readonly collapsedCount = GENRES_COLLAPSED;

  protected readonly genreQuery = signal('');
  protected readonly showAllGenres = signal(false);

  // Los géneros elegidos siempre visibles, aunque estén fuera del corte.
  protected readonly visibleGenres = computed(() => {
    const query = this.genreQuery().trim().toLowerCase();
    const options = this.genreOptions();
    if (query) return options.filter((g) => g.toLowerCase().includes(query));
    if (this.showAllGenres()) return options;
    const top = options.slice(0, GENRES_COLLAPSED);
    const picked = this.filters().genres.filter((g) => !top.includes(g));
    return [...top, ...picked];
  });

  protected countOf(facet: MultiFacet, key: string): number {
    return this.counts()[facet].get(key) ?? 0;
  }

  protected isChecked(facet: MultiFacet, key: string): boolean {
    return (this.filters()[facet] as string[]).includes(key);
  }
}
