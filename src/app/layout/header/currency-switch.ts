import { Component, inject } from '@angular/core';
import type { Currency } from '../../core/models/game';
import { PreferencesStore } from '../../core/state/preferences.store';

const OPTIONS: { key: Currency; label: string }[] = [
  { key: 'USD', label: 'US$' },
  { key: 'EUR', label: '€' },
];

// Selector de moneda (segmentado): las dos opciones siempre visibles.
@Component({
  selector: 'app-currency-switch',
  host: {
    // Pista translúcida + borde fino: se distingue sobre cualquier superficie (header, footer, menú).
    class: 'flex items-center rounded-full bg-ink/[0.06] p-1 ring-1 ring-inset ring-hairline',
    role: 'group',
    'aria-label': 'Moneda de los precios',
  },
  template: `
    @for (option of options; track option.key) {
      <button
        type="button"
        class="h-8 min-w-10 rounded-full px-3 text-[12.5px] font-medium transition-colors"
        [class]="preferences.currency() === option.key ? 'bg-bg text-ink shadow-sm' : 'text-ink-2 hover:text-ink'"
        [attr.aria-pressed]="preferences.currency() === option.key"
        (click)="preferences.currency.set(option.key)"
      >
        {{ option.label }}
      </button>
    }
  `,
})
export class CurrencySwitch {
  protected readonly preferences = inject(PreferencesStore);
  protected readonly options = OPTIONS;
}
