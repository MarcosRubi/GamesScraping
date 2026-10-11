import { Component, computed, inject, input } from '@angular/core';
import type { Game } from '../../core/models/game';
import { ExchangeRateStore } from '../../core/state/exchange-rate.store';
import { PreferencesStore } from '../../core/state/preferences.store';
import { priceDisplay } from '../../core/utils/price-display';

// Precio en la moneda elegida: viejo tachado + actual en violeta, como en el
// diseño. Si fue convertido, el original queda en el tooltip.
@Component({
  selector: 'app-price',
  host: { class: 'inline-flex items-baseline gap-1.5' },
  template: `
    @let p = price();
    @if (p.old) {
      <span class="text-[0.85em] text-ink-3 line-through">{{ p.old }}</span>
    }
    @switch (p.kind) {
      @case ('missing') {
        <span class="text-[0.85em] text-ink-3">Sin precio</span>
      }
      @case ('text') {
        <span class="text-[0.9em] font-medium text-ink-2">{{ p.now }}</span>
      }
      @default {
        <span class="font-medium text-accent" [attr.title]="p.converted ? 'Precio original: ' + p.original : null">
          {{ p.converted ? '≈ ' : '' }}{{ p.now }}
        </span>
      }
    }
  `,
})
export class Price {
  private readonly currency = inject(PreferencesStore).currency;
  private readonly rate = inject(ExchangeRateStore).eurUsdRate;

  readonly game = input.required<Game>();
  protected readonly price = computed(() => priceDisplay(this.game(), this.currency(), this.rate()));
}
