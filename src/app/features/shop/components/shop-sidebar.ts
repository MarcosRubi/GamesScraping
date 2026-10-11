import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import type { CatalogEntry } from '../../../core/state/catalog.store';
import { STORE_KEYS, STORES } from '../../../core/stores';
import { Icon } from '../../../shared/ui/icon/icon';
import { FEATURE_OPTIONS, LIST_OPTIONS, type ShopFilters } from '../shop-filters.model';
import { facetCounts, matches } from '../shop-filtering';
import { PriceRange, type PriceRangeValue } from './price-range';

type MultiFacet = 'lists' | 'stores' | 'genres' | 'features';

// Lo que se edita en el panel antes de aplicar.
export type FilterDraft = Pick<ShopFilters, MultiFacet | 'min' | 'max'>;

const GENRES_COLLAPSED = 8;

function draftOf(f: ShopFilters): FilterDraft {
  return { lists: f.lists, stores: f.stores, genres: f.genres, features: f.features, min: f.min, max: f.max };
}

function sameDraft(a: FilterDraft, b: FilterDraft): boolean {
  const same = (x: string[], y: string[]) => x.length === y.length && x.every((v) => y.includes(v));
  return (
    same(a.lists, b.lists) &&
    same(a.stores, b.stores) &&
    same(a.genres, b.genres) &&
    same(a.features, b.features) &&
    a.min === b.min &&
    a.max === b.max
  );
}

// Panel de filtros (columna en escritorio, panel lateral en móvil).
//
// Se eligen varias opciones y se aplican juntas con "Aplicar filtros": una
// sola navegación y un solo recálculo de la grilla. El borrador es un
// linkedSignal de los filtros aplicados, así que se reinicia solo si cambian
// desde afuera (chip quitado, carrusel, atrás del navegador). Los contadores
// y el total del botón se calculan sobre el borrador: muestran cuántos
// resultados va a dar antes de aplicar.
@Component({
  selector: 'app-shop-sidebar',
  imports: [NgTemplateOutlet, Icon, PriceRange],
  template: `
    <div class="space-y-7">
      <section>
        <h3 class="mb-4 text-[15px] font-medium">Precio</h3>
        <app-price-range
          [value]="{ min: draft().min, max: draft().max }"
          [bound]="maxPrice()"
          [symbol]="currencySymbol()"
          (change)="setPrice($event)"
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

    <!-- Acciones: fijas abajo mientras se recorre el panel. -bottom-6 compensa
         el p-6 del contenedor con scroll (sticky se mide desde su padding). -->
    <div class="sticky -bottom-6 z-10 -mx-6 mt-6 -mb-6 border-t lg:rounded-b-card border-hairline bg-surface px-6 py-4">
      <button type="button" class="btn-primary w-full" [disabled]="!dirty()" [class.opacity-50]="!dirty()" (click)="applyDraft()">
        Aplicar filtros · {{ previewTotal() }}
      </button>
      <button
        type="button"
        class="mt-2 w-full py-1.5 text-[13px] font-medium text-ink-2 transition-colors hover:text-accent disabled:opacity-40"
        [disabled]="!hasAnything()"
        (click)="clear.emit()"
      >
        Limpiar filtros
      </button>
    </div>

    <!-- Una opción con checkbox y su contador -->
    <ng-template #row let-facet="facet" let-key="key" let-label="label">
      @let checked = isChecked(facet, key);
      @let count = countOf(facet, key);
      <label
        class="flex cursor-pointer items-center gap-2.5 py-1.5 text-[14px] transition-colors"
        [class]="checked ? 'text-ink' : count === 0 ? 'text-ink-3' : 'text-ink-2 hover:text-ink'"
      >
        <input type="checkbox" class="size-4 shrink-0 accent-[var(--gs-accent)]" [checked]="checked" (change)="toggle(facet, key)" />
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
  readonly entries = input.required<CatalogEntry[]>();
  readonly genreOptions = input.required<string[]>();
  readonly maxPrice = input.required<number>();
  readonly currencySymbol = input('US$');

  readonly apply = output<FilterDraft>();
  readonly clear = output<void>();

  protected readonly lists = LIST_OPTIONS;
  protected readonly features = FEATURE_OPTIONS;
  protected readonly stores = STORE_KEYS.map((key) => STORES[key]);
  protected readonly collapsedCount = GENRES_COLLAPSED;

  protected readonly draft = linkedSignal(() => draftOf(this.filters()));
  private readonly draftFilters = computed<ShopFilters>(() => ({ ...this.filters(), ...this.draft() }));

  protected readonly dirty = computed(() => !sameDraft(this.draft(), draftOf(this.filters())));
  protected readonly hasAnything = computed(() => {
    const d = this.draft();
    const applied = draftOf(this.filters());
    const any = (x: FilterDraft) =>
      x.lists.length + x.stores.length + x.genres.length + x.features.length > 0 || x.min !== null || x.max !== null;
    return any(d) || any(applied);
  });

  protected readonly previewTotal = computed(() => {
    const f = this.draftFilters();
    return this.entries().filter((e) => matches(e, f)).length;
  });

  private readonly counts = computed(() => {
    const entries = this.entries();
    const f = this.draftFilters();
    return {
      lists: facetCounts(entries, f, 'lists'),
      stores: facetCounts(entries, f, 'stores'),
      genres: facetCounts(entries, f, 'genres'),
      features: facetCounts(entries, f, 'features'),
    };
  });

  protected readonly genreQuery = signal('');
  protected readonly showAllGenres = signal(false);

  // Los géneros marcados siempre visibles, aunque estén fuera del corte.
  protected readonly visibleGenres = computed(() => {
    const query = this.genreQuery().trim().toLowerCase();
    const options = this.genreOptions();
    if (query) return options.filter((g) => g.toLowerCase().includes(query));
    if (this.showAllGenres()) return options;
    const top = options.slice(0, GENRES_COLLAPSED);
    const picked = this.draft().genres.filter((g) => !top.includes(g));
    return [...top, ...picked];
  });

  protected toggle(facet: MultiFacet, key: string): void {
    this.draft.update((d) => {
      const current = d[facet] as string[];
      const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
      return { ...d, [facet]: next };
    });
  }

  protected setPrice(range: PriceRangeValue): void {
    this.draft.update((d) => ({ ...d, ...range }));
  }

  protected applyDraft(): void {
    this.apply.emit(this.draft());
  }

  protected countOf(facet: MultiFacet, key: string): number {
    return this.counts()[facet].get(key) ?? 0;
  }

  protected isChecked(facet: MultiFacet, key: string): boolean {
    return (this.draft()[facet] as string[]).includes(key);
  }
}
