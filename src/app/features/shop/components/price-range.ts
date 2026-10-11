import { Component, computed, input, output } from '@angular/core';

export interface PriceRangeValue {
  min: number | null;
  max: number | null;
}

// Slider de precio con dos manijas (controlado): muestra `value` y emite
// cada movimiento; quien lo usa decide cuándo aplicar. null = sin límite
// (manija en el extremo).
@Component({
  selector: 'app-price-range',
  styles: `
    .thumb {
      pointer-events: none;
      appearance: none;
      background: transparent;
    }
    .thumb::-webkit-slider-thumb {
      pointer-events: auto;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 9999px;
      background: var(--gs-accent);
      border: 2px solid var(--gs-bg);
      box-shadow: 0 0 0 1px var(--gs-accent);
      cursor: pointer;
    }
    .thumb::-moz-range-thumb {
      pointer-events: auto;
      width: 14px;
      height: 14px;
      border-radius: 9999px;
      background: var(--gs-accent);
      border: 2px solid var(--gs-bg);
      cursor: pointer;
    }
  `,
  template: `
    <div class="relative h-5">
      <div class="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-hairline"></div>
      <div class="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent" [style.left.%]="lowPct()" [style.right.%]="100 - highPct()"></div>
      <input
        #low
        type="range"
        class="thumb absolute inset-0 w-full"
        aria-label="Precio mínimo"
        [min]="0"
        [max]="bound()"
        [step]="1"
        [value]="low_()"
        (input)="setMin(low.valueAsNumber)"
      />
      <input
        #high
        type="range"
        class="thumb absolute inset-0 w-full"
        aria-label="Precio máximo"
        [min]="0"
        [max]="bound()"
        [step]="1"
        [value]="high_()"
        (input)="setMax(high.valueAsNumber)"
      />
    </div>
    <p class="mt-4 text-[13px] text-ink-2">
      Precio: <span class="font-medium text-ink">{{ symbol() }}{{ low_() }} — {{ symbol() }}{{ high_() }}</span>
    </p>
  `,
})
export class PriceRange {
  readonly value = input.required<PriceRangeValue>();
  readonly bound = input.required<number>();
  readonly symbol = input('US$');
  readonly change = output<PriceRangeValue>();

  protected readonly low_ = computed(() => Math.min(this.value().min ?? 0, this.bound()));
  protected readonly high_ = computed(() => Math.min(this.value().max ?? this.bound(), this.bound()));
  protected readonly lowPct = computed(() => (this.low_() / this.bound()) * 100);
  protected readonly highPct = computed(() => (this.high_() / this.bound()) * 100);

  protected setMin(v: number): void {
    this.emit(Math.min(v, this.high_()), this.high_());
  }

  protected setMax(v: number): void {
    this.emit(this.low_(), Math.max(v, this.low_()));
  }

  private emit(low: number, high: number): void {
    this.change.emit({ min: low > 0 ? low : null, max: high < this.bound() ? high : null });
  }
}
