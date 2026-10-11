import { Component, computed, inject, input, output, signal } from '@angular/core';
import type { Game, StoreKey } from '../../core/models/game';
import { ExchangeRateStore } from '../../core/state/exchange-rate.store';
import { PreferencesStore } from '../../core/state/preferences.store';
import { STORES } from '../../core/stores';
import { formatPrice, isFreePrice, parsePrice } from '../../core/utils/currency';
import { InfoNote } from '../info-note/info-note';
import { StoreTag } from '../store-tag/store-tag';

// Ratio a partir del cual una imagen es "banner ancho" (capsules de Steam,
// 231×87 ≈ 2.66): con cover se les corta el texto, así que van en contain
// sobre el fondo desenfocado.
const WIDE_RATIO = 2;

// La tarjeta de juego de toda la app: imagen a sangre con overlay degradado
// abajo (tienda, título, precios, comprar). El contenido proyectado
// (<ng-content>) es el hueco para la navegación n/m de los resultados.
//
// Todo lo que se muestra es computed a partir de las inputs y de las
// preferencias: no hay estado duplicado que sincronizar a mano.
@Component({
  selector: 'app-game-card',
  imports: [InfoNote, StoreTag],
  templateUrl: './game-card.html',
  styleUrl: './game-card.scss',
  host: {
    class: 'game-card',
    '[class.game-card--best]': 'highlight()',
  },
})
export class GameCard {
  private readonly preferences = inject(PreferencesStore);
  private readonly rate = inject(ExchangeRateStore).eurUsdRate;

  readonly game = input.required<Game>();
  readonly store = input.required<StoreKey>();
  readonly highlight = input(false);
  // Muestra "Comparar precios" (una output no sabe si alguien la escucha).
  readonly showCompare = input(false);
  readonly compare = output<string>();

  // Estado local de la imagen: solo le importa a esta tarjeta.
  protected readonly wideImage = signal(false);

  protected readonly storeLabel = computed(() => STORES[this.store()].label);
  private readonly rawNow = computed(() => this.game().price?.[0]?.now);
  protected readonly priceKnown = computed(() => parsePrice(this.rawNow()) !== null);

  // Gratis por el precio, o free-to-play sin precio en la tienda.
  protected readonly free = computed(
    () =>
      isFreePrice(this.game().price) ||
      (!this.priceKnown() && (this.game().categories ?? []).includes('Free to Play')),
  );

  protected readonly priceNow = computed(() =>
    formatPrice(this.rawNow(), this.preferences.currency(), this.rate()),
  );
  protected readonly priceOld = computed(() => {
    const old = this.game().price?.[1]?.old;
    return this.priceKnown() && old ? formatPrice(old, this.preferences.currency(), this.rate()) : null;
  });

  // Nota: precio convertido de otra moneda, o precio regional en GOG.
  protected readonly note = computed<'converted' | 'regional' | null>(() => {
    if (!this.priceKnown()) return null;
    const parsed = parsePrice(this.rawNow());
    if (parsed && parsed.currency !== this.preferences.currency()) return 'converted';
    return this.store() === 'gog' ? 'regional' : null;
  });
  protected readonly originalPrice = this.rawNow;

  protected readonly categories = computed(() => (this.game().categories ?? []).slice(0, 3));

  protected onImageLoad(img: HTMLImageElement): void {
    this.wideImage.set(img.naturalWidth > 0 && img.naturalWidth / img.naturalHeight >= WIDE_RATIO);
  }
}
