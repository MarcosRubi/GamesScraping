import { Component, computed, input, linkedSignal, output } from '@angular/core';

export interface PriceRangeValue {
  min: number | null;
  max: number | null;
}

// Slider de precio con dos manijas. Mientras se arrastra solo cambia el
// borrador local (linkedSignal: se reinicia si cambian los filtros
// aplicados o el tope); el filtro se aplica con "Filtrar", como en el diseño,
// para no recalcular la grilla en cada píxel.
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
        [value]="draftMin()"
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
        [value]="draftMax()"
        (input)="setMax(high.valueAsNumber)"
      />
    </div>
    <div class="mt-4 flex items-center justify-between gap-3">
      <p class="text-[13px] text-ink-2">
        Precio: <span class="font-medium text-ink">{{ symbol() }}{{ draftMin() }} — {{ symbol() }}{{ draftMax() }}</span>
      </p>
      <button type="button" class="rounded-full bg-accent/10 px-4 py-1.5 text-[12px] font-medium text-accent transition hover:bg-accent hover:text-white" (click)="submit()">
        Filtrar
      </button>
    </div>
  `,
})
export class PriceRange {
  readonly value = input.required<PriceRangeValue>();
  readonly bound = input.required<number>();
  readonly symbol = input('US$');
  readonly apply = output<PriceRangeValue>();

  protected readonly draftMin = linkedSignal(() => Math.min(this.value().min ?? 0, this.bound()));
  protected readonly draftMax = linkedSignal(() => Math.min(this.value().max ?? this.bound(), this.bound()));

  protected readonly lowPct = computed(() => (this.draftMin() / this.bound()) * 100);
  protected readonly highPct = computed(() => (this.draftMax() / this.bound()) * 100);

  protected setMin(v: number): void {
    this.draftMin.set(Math.min(v, this.draftMax()));
  }

  protected setMax(v: number): void {
    this.draftMax.set(Math.max(v, this.draftMin()));
  }

  // Los extremos del slider equivalen a "sin límite".
  protected submit(): void {
    this.apply.emit({
      min: this.draftMin() > 0 ? this.draftMin() : null,
      max: this.draftMax() < this.bound() ? this.draftMax() : null,
    });
  }
}
