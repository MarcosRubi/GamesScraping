import { Component, computed, input } from '@angular/core';
import type { StoreKey } from '../../core/models/game';
import { STORES } from '../../core/stores';

// Clases completas (no interpoladas) para que Tailwind las detecte al compilar.
const STORE_BG: Record<StoreKey, string> = {
  steam: 'bg-steam',
  gog: 'bg-gog',
  instantGaming: 'bg-instant-gaming',
  humble: 'bg-humble',
  fanatical: 'bg-fanatical',
};

// Pill con el color de marca de la tienda. `compact`: en móvil muestra la
// etiqueta mínima ("IG") para no pisar otros badges en tarjetas angostas.
@Component({
  selector: 'app-store-tag',
  host: {
    class: 'inline-block rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[.02em] text-white uppercase',
    '[class]': 'bgClass()',
  },
  template: `
    @if (compact()) {
      <span class="sm:hidden" [attr.title]="info().label">{{ info().tinyLabel }}</span>
      <span class="hidden sm:inline">{{ info().label }}</span>
    } @else {
      {{ info().label }}
    }
  `,
})
export class StoreTag {
  readonly store = input.required<StoreKey>();
  readonly compact = input(false);
  protected readonly info = computed(() => STORES[this.store()]);
  protected readonly bgClass = computed(() => STORE_BG[this.store()]);
}
