import { Component, computed, effect, inject, signal } from '@angular/core';
import { mediaQuery, pageVisible } from '../../core/browser/browser-signals';
import { ExchangeRateStore } from '../../core/state/exchange-rate.store';
import { HomeDataStore } from '../../core/state/home-data.store';
import { PreferencesStore } from '../../core/state/preferences.store';
import { SearchStore } from '../../core/state/search.store';
import { STORES } from '../../core/stores';
import { formatPrice, isFreePrice, parsePrice } from '../../core/utils/currency';
import { Icon } from '../../shared/icon/icon';
import { StoreTag } from '../../shared/store-tag/store-tag';
import { SlideImage } from './slide-image';

const AUTO_ROTATE_MS = 6000;

// Banner "Los mejor valorados": slide central con info + laterales con el
// juego anterior/siguiente. Bajo 1200px pasa a layout compacto (imagen 16:9
// con slideshow arriba e info abajo).
@Component({
  selector: 'app-featured-carousel',
  imports: [Icon, StoreTag, SlideImage],
  templateUrl: './featured-carousel.html',
  styleUrl: './featured-carousel.scss',
})
export class FeaturedCarousel {
  private readonly homeData = inject(HomeDataStore);
  private readonly search = inject(SearchStore);
  private readonly preferences = inject(PreferencesStore);
  private readonly rate = inject(ExchangeRateStore).eurUsdRate;

  protected readonly isMobile = mediaQuery('(max-width: 1199px)');
  private readonly visible = pageVisible();

  protected readonly games = this.homeData.featured;
  private readonly total = computed(() => this.games()?.length ?? 0);

  private readonly index = signal(0);
  // Dirección del último cambio: decide desde qué lado entra el slide.
  protected readonly direction = signal<1 | -1>(1);
  private readonly paused = signal(false);
  // Escritorio: la screenshot bajo el cursor sustituye la imagen grande.
  protected readonly hoveredScreenshot = signal<string | null>(null);

  // La lista crece a medida que llegan las tiendas: el índice se normaliza
  // con módulo para no apuntar nunca fuera del array.
  protected readonly safeIndex = computed(() => (this.total() ? this.index() % this.total() : 0));
  protected readonly active = computed(() => this.games()?.[this.safeIndex()] ?? null);
  protected readonly prev = computed(() => this.games()?.[(this.safeIndex() - 1 + this.total()) % this.total()]);
  protected readonly next = computed(() => this.games()?.[(this.safeIndex() + 1) % this.total()]);

  protected readonly storeLabel = computed(() => {
    const game = this.active();
    return game ? STORES[game.store].label : '';
  });
  protected readonly displayImage = computed(() => this.hoveredScreenshot() ?? this.active()?.imgUrl ?? '');
  private readonly rawNow = computed(() => this.active()?.price?.[0]?.now);
  protected readonly priceKnown = computed(() => parsePrice(this.rawNow()) !== null);
  protected readonly free = computed(() => this.priceKnown() && isFreePrice(this.active()?.price));
  protected readonly priceNow = computed(() =>
    formatPrice(this.rawNow(), this.preferences.currency(), this.rate()),
  );
  protected readonly priceOld = computed(() => {
    const old = this.active()?.price?.[1]?.old;
    return old ? formatPrice(old, this.preferences.currency(), this.rate()) : null;
  });

  protected readonly skeletonLines = ['w-20 h-[22px]', 'w-3/4 h-7 rounded-lg', 'w-[45%] h-3.5'];

  constructor() {
    // Auto-rotación: el intervalo vive solo mientras hay más de un juego, el
    // usuario no está con el mouse encima y la pestaña está visible. Depende
    // de `total` (un número) y no de la lista, para no reiniciarse cada vez
    // que llega una tienda nueva con la misma cantidad de juegos.
    effect((onCleanup) => {
      const total = this.total();
      if (total < 2 || this.paused() || !this.visible()) return;
      const timer = setInterval(() => {
        this.direction.set(1);
        this.index.update((i) => (i + 1) % total);
      }, AUTO_ROTATE_MS);
      onCleanup(() => clearInterval(timer));
    });
  }

  protected go(dir: 1 | -1): void {
    this.direction.set(dir);
    this.index.set((this.safeIndex() + dir + this.total()) % this.total());
  }

  protected goTo(target: number): void {
    this.direction.set(target > this.safeIndex() ? 1 : -1);
    this.index.set(target);
  }

  protected setPaused(paused: boolean): void {
    this.paused.set(paused);
    if (!paused) this.hoveredScreenshot.set(null);
  }

  protected compare(name: string): void {
    this.search.compare(name);
  }
}
