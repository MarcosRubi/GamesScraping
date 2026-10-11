import { Component, inject } from '@angular/core';
import { GENRES } from '../../core/genres';
import { SectionNavigator } from '../../core/state/section-navigator';
import { UiStore } from '../../core/state/ui.store';
import { STORE_KEYS, STORES } from '../../core/stores';
import { CurrencySwitch } from '../header/currency-switch';
import { SECTION_LINKS } from '../header/nav-links';
import { Icon } from '../../shared/ui/icon/icon';
import { StoreTag } from '../../shared/ui/store-tag';

const STORE_HOMEPAGES: Record<string, string> = {
  steam: 'https://store.steampowered.com/',
  gog: 'https://www.gog.com/',
  instantGaming: 'https://www.instant-gaming.com/',
  humble: 'https://www.humblebundle.com/store',
  fanatical: 'https://www.fanatical.com/',
};

@Component({
  selector: 'app-footer',
  imports: [Icon, StoreTag, CurrencySwitch],
  host: { class: 'mt-24 block bg-surface' },
  template: `
    <div class="border-b border-hairline">
      <div class="page flex flex-wrap items-center justify-between gap-4 py-5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="mr-1 text-[14px] font-medium">Tiendas que comparamos:</span>
          @for (key of storeKeys; track key) {
            <app-store-tag [store]="key" />
          }
        </div>
        <app-currency-switch />
      </div>
    </div>

    <div class="page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
      <div>
        <p class="flex items-center gap-2 text-2xl font-semibold">
          <span class="grid size-9 place-items-center rounded-lg bg-accent text-lg text-white"><app-icon name="controller" /></span>
          GameScraping<span class="-ml-2 text-accent">.</span>
        </p>
        <p class="mt-4 max-w-xs text-[14px] leading-relaxed text-ink-2">
          Comparamos el precio de tus juegos en las principales tiendas digitales para que sepas dónde conviene comprar. Sin
          comisiones: cada link te lleva directo a la tienda.
        </p>
      </div>

      <nav aria-label="Secciones">
        <h3 class="mb-4 text-[17px]">Secciones</h3>
        <ul class="space-y-2.5 text-[14px] text-ink-2">
          @for (link of sections; track link.id) {
            <li><button type="button" class="hover:text-accent" (click)="goTo(link.id)">{{ link.label }}</button></li>
          }
        </ul>
      </nav>

      <nav aria-label="Tiendas">
        <h3 class="mb-4 text-[17px]">Tiendas</h3>
        <ul class="space-y-2.5 text-[14px] text-ink-2">
          @for (key of storeKeys; track key) {
            <li>
              <a [href]="homepages[key]" target="_blank" rel="noreferrer" class="inline-flex items-center gap-1 hover:text-accent">
                {{ stores[key].label }} <app-icon name="arrow-up-right" class="text-[11px]" />
              </a>
            </li>
          }
        </ul>
      </nav>

      <nav aria-label="Géneros">
        <h3 class="mb-4 text-[17px]">Géneros</h3>
        <ul class="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[14px] text-ink-2">
          @for (genre of genres; track genre.slug) {
            <li><button type="button" class="hover:text-accent" (click)="pickGenre(genre.slug)">{{ genre.label }}</button></li>
          }
        </ul>
      </nav>
    </div>

    <div class="border-t border-hairline">
      <div class="page flex flex-wrap justify-between gap-3 py-5 text-[13px] text-ink-3">
        <p>© {{ year }} GameScraping. Precios públicos de cada tienda, actualizados cada hora.</p>
        <p>Los precios finales los define cada tienda.</p>
      </div>
    </div>
  `,
})
export class Footer {
  private readonly sectionNav = inject(SectionNavigator);
  private readonly ui = inject(UiStore);

  protected readonly year = new Date().getFullYear();
  protected readonly storeKeys = STORE_KEYS;
  protected readonly stores = STORES;
  protected readonly homepages = STORE_HOMEPAGES;
  protected readonly sections = SECTION_LINKS;
  protected readonly genres = GENRES;

  protected goTo(id: string): void {
    this.sectionNav.goTo(id);
  }

  protected pickGenre(slug: string): void {
    this.ui.popularGenre.set(slug);
    this.goTo('populares');
  }
}
