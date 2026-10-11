import { Component, inject, output, signal } from '@angular/core';
import { GENRES } from '../../core/genres';
import { FiltersStore } from '../../core/state/filters.store';
import { UiStore } from '../../core/state/ui.store';
import { STORE_KEYS, STORES } from '../../core/stores';
import { Icon } from '../../shared/ui/icon/icon';
import { CurrencySwitch } from './currency-switch';
import { HowItWorks } from './how-it-works';
import { SECTION_LINKS } from './nav-links';
import { ThemeToggle } from './theme-toggle';

// Menú lateral para pantallas chicas. Existe solo mientras está abierto, así
// que el listener de Escape vive lo mismo que el panel.
@Component({
  selector: 'app-mobile-menu',
  imports: [Icon, CurrencySwitch, ThemeToggle, HowItWorks],
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    <div class="fixed inset-0 z-[200] bg-black/50 animate-fade-in" (click)="closed.emit()"></div>
    <aside
      class="fixed inset-y-0 left-0 z-[210] flex w-[86vw] max-w-sm flex-col overflow-y-auto bg-header p-5 shadow-float animate-dd-in"
      aria-label="Menú"
    >
      <div class="mb-6 flex items-center justify-between">
        <span class="text-lg font-semibold">GameScraping<span class="text-accent">.</span></span>
        <button type="button" class="rounded-full bg-surface p-2.5" aria-label="Cerrar menú" (click)="closed.emit()">
          <app-icon name="close" />
        </button>
      </div>

      <button type="button" class="mb-6 flex h-11 items-center justify-between rounded-full border border-hairline pr-1 pl-4 text-sm text-ink-3" (click)="openSearch()">
        Buscar juegos...
        <span class="grid size-9 place-items-center rounded-full bg-accent text-white"><app-icon name="search" /></span>
      </button>

      <h3 class="mb-2 text-xs font-medium tracking-wide text-ink-3 uppercase">Secciones</h3>
      <ul class="mb-6">
        @for (link of sections; track link.id) {
          <li>
            <button type="button" class="flex w-full items-center gap-3 py-2.5 text-[15px]" (click)="navigate.emit(link.id)">
              <app-icon [name]="link.icon" class="text-accent" /> {{ link.label }}
            </button>
          </li>
        }
        <li>
          <button
            type="button"
            class="flex w-full items-center gap-3 py-2.5 text-[15px]"
            [attr.aria-expanded]="howOpen()"
            (click)="howOpen.set(!howOpen())"
          >
            <app-icon name="info" class="text-accent" /> ¿Cómo funciona?
            <app-icon name="chevron-down" class="ml-auto text-[11px] transition-transform" [class.rotate-180]="howOpen()" />
          </button>
          @if (howOpen()) {
            <div class="mt-1 mb-3 rounded-card bg-surface p-4 animate-dd-in">
              <app-how-it-works [compact]="true" />
            </div>
          }
        </li>
      </ul>

      <h3 class="mb-2 text-xs font-medium tracking-wide text-ink-3 uppercase">Tiendas</h3>
      <div class="mb-6 flex flex-wrap gap-2">
        @for (store of stores; track store.key) {
          <button
            type="button"
            class="rounded-full border px-3.5 py-1.5 text-[13px] transition-colors"
            [class]="filters.stores().includes(store.key) ? 'border-accent bg-accent text-white' : 'border-hairline text-ink-2'"
            [attr.aria-pressed]="filters.stores().includes(store.key)"
            (click)="filters.toggleStore(store.key)"
          >
            {{ store.shortLabel }}
          </button>
        }
      </div>

      <h3 class="mb-2 text-xs font-medium tracking-wide text-ink-3 uppercase">Géneros</h3>
      <div class="mb-6 flex flex-wrap gap-2">
        @for (genre of genres; track genre.slug) {
          <button type="button" class="rounded-full bg-surface px-3.5 py-1.5 text-[13px] text-ink-2" (click)="pickGenre(genre.slug)">
            {{ genre.label }}
          </button>
        }
      </div>

      <div class="mt-auto flex items-center justify-between border-t border-hairline pt-5">
        <app-currency-switch />
        <app-theme-toggle />
      </div>
    </aside>
  `,
})
export class MobileMenu {
  protected readonly filters = inject(FiltersStore);
  private readonly ui = inject(UiStore);

  readonly closed = output<void>();
  readonly navigate = output<string>();

  protected readonly sections = SECTION_LINKS;
  protected readonly genres = GENRES;
  protected readonly stores = STORE_KEYS.map((key) => STORES[key]);
  protected readonly howOpen = signal(false);

  protected openSearch(): void {
    this.closed.emit();
    this.ui.searchOpen.set(true);
  }

  protected pickGenre(slug: string): void {
    this.ui.popularGenre.set(slug);
    this.navigate.emit('populares');
  }
}
