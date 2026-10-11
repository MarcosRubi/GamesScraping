import { Component, inject } from '@angular/core';
import { HomeDataStore } from '../../../core/state/home-data.store';
import { SearchNavigator } from '../../../core/state/search-navigator';
import { wideArtUrl } from '../../../core/utils/steam-assets';
import { Price } from '../../../shared/ui/price';

// Dos banners grandes con las ofertas de Steam de mayor descuento.
@Component({
  selector: 'app-promo-banners',
  imports: [Price],
  template: `
    <section class="page mt-16 grid gap-5 md:grid-cols-2" aria-label="Ofertas destacadas">
      @if (home.promos(); as promos) {
        @for (game of promos; track game.url) {
          <article class="group relative flex min-h-[240px] items-end overflow-hidden rounded-card bg-black sm:min-h-[260px]">
            <img
              [src]="art(game)"
              alt=""
              loading="lazy"
              class="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
              (error)="$any($event.target).src = game.imgUrl"
            />
            <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            <div class="relative max-w-sm p-7 text-white">
              <p class="text-[13px] text-white/80">Oferta {{ game.discount }} en Steam</p>
              <h3 class="mt-1 text-[22px] leading-tight font-medium sm:text-2xl">{{ game.name }}</h3>
              <p class="mt-2 text-[14px]">Ahora <app-price [game]="game" class="font-semibold [&_.text-accent]:text-white" /></p>
              <div class="mt-4 flex gap-2">
                <a [href]="game.url" target="_blank" rel="noreferrer" class="btn-primary">Ver oferta</a>
                <button
                  type="button"
                  class="rounded-full bg-white/15 px-4 py-2.5 text-[13px] font-medium backdrop-blur transition hover:bg-white hover:text-black"
                  (click)="navigator.compare(game.name)"
                >
                  Comparar
                </button>
              </div>
            </div>
          </article>
        }
      } @else {
        <div class="skeleton min-h-[260px] rounded-card"></div>
        <div class="skeleton min-h-[260px] rounded-card"></div>
      }
    </section>
  `,
})
export class PromoBanners {
  protected readonly home = inject(HomeDataStore);
  protected readonly navigator = inject(SearchNavigator);
  protected readonly art = wideArtUrl;
}
