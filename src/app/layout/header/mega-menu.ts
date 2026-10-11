import { Component, computed, inject, output } from '@angular/core';
import { GENRES } from '../../core/genres';
import { FiltersStore } from '../../core/state/filters.store';
import { HomeDataStore } from '../../core/state/home-data.store';
import { UiStore } from '../../core/state/ui.store';
import { STORE_KEYS, STORES } from '../../core/stores';
import { heroUrl } from '../../core/utils/steam-assets';
import { Icon } from '../../shared/ui/icon/icon';
import { SECTION_LINKS } from './nav-links';

// Panel de "Explorar": secciones de la home, filtro de tiendas, géneros y
// una tarjeta con el juego destacado (como el menú "Games" del diseño).
@Component({
  selector: 'app-mega-menu',
  imports: [Icon],
  host: { class: 'block border-b border-hairline bg-header shadow-float animate-dd-in' },
  template: `
    <div class="page grid grid-cols-[1fr_1fr_1fr_1.6fr] gap-8 py-8">
      <div>
        <h3 class="mb-3 flex items-center gap-2 border-b border-hairline pb-2.5 text-[15px] font-medium">
          <app-icon name="grid" class="text-accent" /> Secciones
        </h3>
        <ul class="space-y-1">
          @for (link of sections; track link.id) {
            <li>
              <button type="button" class="py-1 text-[14px] text-ink-2 transition-colors hover:text-accent" (click)="navigate.emit(link.id)">
                {{ link.label }}
              </button>
            </li>
          }
        </ul>
      </div>

      <div>
        <h3 class="mb-3 flex items-center gap-2 border-b border-hairline pb-2.5 text-[15px] font-medium">
          <app-icon name="controller" class="text-accent" /> Por tienda
        </h3>
        <ul class="space-y-1">
          @for (store of stores; track store.key) {
            <li>
              <label class="flex cursor-pointer items-center gap-2.5 py-1 text-[14px] text-ink-2 hover:text-ink">
                <input
                  type="checkbox"
                  class="size-4 accent-[var(--gs-accent)]"
                  [checked]="filters.stores().includes(store.key)"
                  (change)="filters.toggleStore(store.key)"
                />
                {{ store.label }}
              </label>
            </li>
          }
        </ul>
        @if (filters.stores().length > 0) {
          <button type="button" class="mt-2 text-[13px] text-accent hover:underline" (click)="filters.stores.set([])">Ver todas</button>
        }
      </div>

      <div>
        <h3 class="mb-3 flex items-center gap-2 border-b border-hairline pb-2.5 text-[15px] font-medium">
          <app-icon name="tags" class="text-accent" /> Por género
        </h3>
        <ul class="grid grid-cols-2 gap-x-3 gap-y-1">
          @for (genre of genres; track genre.slug) {
            <li>
              <button type="button" class="py-1 text-[14px] text-ink-2 transition-colors hover:text-accent" (click)="pickGenre(genre.slug)">
                {{ genre.label }}
              </button>
            </li>
          }
        </ul>
      </div>

      @if (feature(); as game) {
        <div class="relative flex min-h-[220px] items-end overflow-hidden rounded-xl bg-black">
          <img [src]="featureImage()" alt="" class="absolute inset-0 size-full object-cover opacity-80" />
          <div class="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent"></div>
          <div class="relative max-w-sm p-6 text-white">
            <p class="text-[13px] text-white/75">{{ game.details?.comingSoon ? 'Muy pronto' : 'Destacado' }}</p>
            <h4 class="mt-1 text-xl font-medium">{{ game.name }}</h4>
            <p class="mt-2 line-clamp-2 text-[13px] text-white/80">{{ game.details?.description }}</p>
            <button type="button" class="btn-primary mt-4" (click)="navigate.emit('destacado')">Ver tráilers</button>
          </div>
        </div>
      }
    </div>
  `,
})
export class MegaMenu {
  protected readonly filters = inject(FiltersStore);
  private readonly ui = inject(UiStore);
  private readonly home = inject(HomeDataStore);

  readonly navigate = output<string>();

  protected readonly sections = SECTION_LINKS;
  protected readonly genres = GENRES;
  protected readonly stores = STORE_KEYS.map((key) => STORES[key]);
  protected readonly feature = this.home.feature;
  protected readonly featureImage = computed(() => {
    const game = this.feature();
    return game ? heroUrl(game) : null;
  });

  protected pickGenre(slug: string): void {
    this.ui.popularGenre.set(slug);
    this.navigate.emit('populares');
  }
}
