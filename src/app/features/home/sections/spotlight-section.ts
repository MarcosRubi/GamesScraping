import { Component, computed, inject } from '@angular/core';
import { HomeDataStore } from '../../../core/state/home-data.store';
import { SearchNavigator } from '../../../core/state/search-navigator';
import { UiStore } from '../../../core/state/ui.store';
import { heroUrl } from '../../../core/utils/steam-assets';
import { Icon } from '../../../shared/ui/icon/icon';
import { Price } from '../../../shared/ui/price';

// Juego destacado a lo ancho: arte grande a la izquierda y, a la derecha,
// logo, descripción y dos tráilers que se abren en el reproductor.
@Component({
  selector: 'app-spotlight-section',
  imports: [Icon, Price],
  template: `
    @if (home.feature(); as game) {
      <div class="mx-auto grid max-w-[1440px] overflow-hidden bg-surface lg:grid-cols-2 lg:rounded-card">
        <div class="relative min-h-[280px] lg:min-h-[520px]">
          <img [src]="image()" [alt]="game.name" loading="lazy" class="absolute inset-0 size-full object-cover" />
        </div>

        <div class="flex flex-col items-center justify-center px-6 py-12 text-center sm:px-12">
          @if (game.details?.logoUrl; as logo) {
            <img [src]="logo" [alt]="game.name" loading="lazy" class="max-h-24 max-w-[260px] object-contain dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]" />
          }
          <p class="mt-4 text-[13px] font-medium tracking-wide text-accent uppercase">
            {{ game.details?.comingSoon ? 'Próximo lanzamiento' : 'Destacado de la semana' }}
          </p>
          <h2 class="mt-1 text-3xl font-medium">{{ game.name }}</h2>
          <p class="mt-3 max-w-lg text-[14px] leading-relaxed text-ink-2">{{ game.details?.description }}</p>

          <div class="mt-7 grid w-full max-w-xl grid-cols-2 gap-4">
            @for (trailer of trailers(); track trailer.hls) {
              <button
                type="button"
                class="group relative aspect-video overflow-hidden rounded-lg bg-black"
                [attr.aria-label]="'Reproducir ' + trailer.name"
                (click)="ui.trailer.set(trailer)"
              >
                <img [src]="trailer.thumbnail" alt="" loading="lazy" class="size-full object-cover opacity-85 transition duration-500 group-hover:scale-105" />
                <span class="absolute inset-0 grid place-items-center">
                  <span class="grid size-12 place-items-center rounded-full border border-white/70 bg-black/30 text-lg text-white backdrop-blur transition group-hover:bg-accent">
                    <app-icon name="play" />
                  </span>
                </span>
              </button>
            }
          </div>

          <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button type="button" class="btn-primary px-7!" (click)="navigator.compare(game.name)">Comparar precios</button>
            <span class="text-[14px] text-ink-2">
              @if (game.details?.comingSoon) {
                Sale: {{ game.details?.releaseDate }}
              } @else {
                <app-price [game]="game" />
              }
            </span>
          </div>
        </div>
      </div>
    } @else {
      <div class="skeleton mx-auto h-[520px] max-w-[1440px] lg:rounded-card"></div>
    }
  `,
})
export class SpotlightSection {
  protected readonly home = inject(HomeDataStore);
  protected readonly navigator = inject(SearchNavigator);
  protected readonly ui = inject(UiStore);

  protected readonly image = computed(() => {
    const game = this.home.feature();
    return game ? heroUrl(game) : null;
  });
  protected readonly trailers = computed(() => this.home.feature()?.details?.trailers.slice(0, 2) ?? []);
}
