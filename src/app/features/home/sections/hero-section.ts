import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { shopLink } from '../../shop/shop-filters.model';
import { pageVisible } from '../../../core/browser/browser-signals';
import { HomeDataStore } from '../../../core/state/home-data.store';
import { SearchNavigator } from '../../../core/state/search-navigator';
import { UiStore } from '../../../core/state/ui.store';
import { heroUrl } from '../../../core/utils/steam-assets';
import { GameRow } from '../../../shared/ui/game-row';
import { Icon } from '../../../shared/ui/icon/icon';
import { Price } from '../../../shared/ui/price';
import { StoreTag } from '../../../shared/ui/store-tag';

const ROTATE_MS = 7000;

// Slider principal (destacados de Steam con arte, logo, descripción y
// tráiler) + "Juegos en oferta" de todas las tiendas al costado.
@Component({
  selector: 'app-hero-section',
  imports: [RouterLink, GameRow, Icon, Price, StoreTag],
  template: `
    <section class="page mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      @let slides = home.hero();
      <!-- Se desliza con el dedo (o arrastrando con el mouse); pan-y deja
           scrollear la página en vertical sobre el banner. -->
      <div
        class="relative min-h-[380px] touch-pan-y overflow-hidden rounded-card bg-black select-none sm:min-h-[440px]"
        (mouseenter)="paused.set(true)"
        (mouseleave)="paused.set(false)"
        (pointerdown)="dragStart($event)"
        (pointerup)="dragEnd($event)"
        (pointercancel)="dragOrigin = null"
      >
        @if (active(); as game) {
          <!-- track por índice: el slide se monta de nuevo y entra con fade -->
          @for (i of [index()]; track i) {
            <div class="absolute inset-0 animate-fade-in">
              <img [src]="image()" alt="" draggable="false" class="absolute inset-0 size-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent"></div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:hidden"></div>

              <div class="relative flex h-full max-w-lg flex-col justify-center gap-4 p-6 pb-14 text-white sm:p-10">
                @if (game.details?.logoUrl; as logo) {
                  <img [src]="logo" [alt]="game.name" draggable="false" class="max-h-24 max-w-[260px] object-contain object-left drop-shadow-lg" />
                } @else {
                  <h2 class="text-3xl font-semibold sm:text-4xl">{{ game.name }}</h2>
                }
                <p class="flex flex-wrap items-center gap-2 text-[14px] font-medium">
                  Disponible en: <app-store-tag [store]="game.store" />
                  @for (genre of (game.details?.genres ?? []).slice(0, 2); track genre) {
                    <span class="rounded-full border border-white/70 px-2.5 py-0.5 text-[11px] uppercase">{{ genre }}</span>
                  }
                </p>
                <p class="line-clamp-3 text-[14px] leading-relaxed text-white/85">{{ game.details?.description }}</p>
                <div class="flex flex-wrap items-center gap-3">
                  <button type="button" class="btn-primary" (click)="navigator.compare(game.name)">Comparar precios</button>
                  @if (game.details?.trailers?.length) {
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-full border border-white/70 px-4 py-2.5 text-[13px] font-medium transition hover:bg-white hover:text-black"
                      (click)="ui.trailer.set(game.details!.trailers[0])"
                    >
                      <app-icon name="play" /> Ver tráiler
                    </button>
                  }
                  <span class="text-[14px]">Desde <app-price [game]="game" class="font-semibold [&_.text-accent]:text-white" /></span>
                </div>
              </div>
            </div>
          }

          <div class="absolute right-4 bottom-4 flex gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5">
            @for (slide of slides; track slide.url) {
              <button
                type="button"
                class="size-2 rounded-full transition"
                [class]="$index === index() ? 'bg-black' : 'bg-black/25 hover:bg-black/50'"
                [attr.aria-label]="'Ver ' + slide.name"
                [attr.aria-current]="$index === index()"
                (click)="index.set($index)"
              ></button>
            }
          </div>
        } @else {
          <div class="skeleton absolute inset-0 rounded-none!"></div>
        }
      </div>

      <aside id="ofertas" class="scroll-mt-24">
        <div class="mb-4 flex items-center justify-between gap-2">
          <h2 class="flex items-center gap-2.5 text-[18px]">
            <span class="grid size-7 place-items-center rounded-full border border-accent text-[12px] text-accent"><app-icon name="percent" /></span>
            Juegos en oferta
          </h2>
          <a routerLink="/juegos" [queryParams]="offersLink" class="text-[13px] font-medium text-accent hover:underline">Ver todas</a>
        </div>
        <div class="space-y-1 rounded-card bg-surface p-3">
          @if (home.discounted(); as games) {
            @for (game of games; track game.url) {
              <app-game-row [game]="game" />
            } @empty {
              <p class="p-3 text-sm text-ink-3">No hay ofertas con tu filtro de tiendas.</p>
            }
          } @else {
            @for (n of [0, 1, 2, 3, 4]; track n) {
              <div class="skeleton h-[84px] rounded-lg"></div>
            }
          }
        </div>
      </aside>
    </section>
  `,
})
export class HeroSection {
  protected readonly home = inject(HomeDataStore);
  protected readonly navigator = inject(SearchNavigator);
  protected readonly ui = inject(UiStore);

  protected readonly offersLink = shopLink({ lists: ['ofertas'] });
  private readonly visible = pageVisible();
  protected readonly paused = signal(false);
  protected readonly index = signal(0);

  private readonly total = computed(() => this.home.hero()?.length ?? 0);
  protected readonly active = computed(() => this.home.hero()?.[this.index() % Math.max(1, this.total())] ?? null);
  protected readonly image = computed(() => {
    const game = this.active();
    return game ? heroUrl(game) : null;
  });

  // Punto donde empezó el arrastre (null = no hay arrastre en curso).
  protected dragOrigin: { x: number; y: number } | null = null;

  protected dragStart(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    this.dragOrigin = { x: event.clientX, y: event.clientY };
  }

  // Un gesto horizontal de más de 50px cambia de slide; si fue más vertical
  // que horizontal era un scroll de la página y se ignora.
  protected dragEnd(event: PointerEvent): void {
    const start = this.dragOrigin;
    this.dragOrigin = null;
    const total = this.total();
    if (!start || total < 2) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    this.index.update((i) => (i + (dx < 0 ? 1 : -1) + total) % total);
  }

  constructor() {
    // El intervalo existe solo con varios slides, sin el mouse encima, con
    // la pestaña visible y sin un tráiler abierto; onCleanup lo corta.
    effect((onCleanup) => {
      const total = this.total();
      this.index(); // un cambio manual (puntos o arrastre) reinicia la cuenta
      if (total < 2 || this.paused() || !this.visible() || this.ui.trailer()) return;
      const timer = setInterval(() => this.index.update((i) => (i + 1) % total), ROTATE_MS);
      onCleanup(() => clearInterval(timer));
    });
  }
}
