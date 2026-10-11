import { Component, input, model, output } from '@angular/core';
import { Icon } from '../../shared/icon/icon';

export interface FilterOption {
  key: string;
  label: string;
}

// Dropdown de filtro estilo Steam: trigger pill con contador y panel con
// opciones multi-selección. `selected` es un model(): el padre puede
// enlazarlo con [(selected)] directamente a una signal del store.
// Si está abierto lo decide el padre, para que solo haya uno abierto a la vez.
@Component({
  selector: 'app-filter-dropdown',
  imports: [Icon],
  styleUrl: './filter-dropdown.scss',
  host: { '[class.open]': 'open()' },
  template: `
    <button
      type="button"
      class="trigger"
      [class.trigger--active]="selected().length > 0"
      [attr.aria-expanded]="open()"
      (click)="toggle.emit()"
    >
      {{ label() }}
      <span class="count" [class.count--zero]="selected().length === 0">{{ selected().length }}</span>
      <app-icon name="chevron-down" class="caret" />
    </button>

    @if (open()) {
      <div class="menu">
        <button type="button" class="option option--all" [class.option--active]="selected().length === 0" (click)="selected.set([])">
          <span class="check" aria-hidden="true"></span>
          Todas
        </button>
        <div class="grid">
          @for (option of options(); track option.key) {
            <button
              type="button"
              class="option"
              [class.option--active]="selected().includes(option.key)"
              [attr.aria-pressed]="selected().includes(option.key)"
              (click)="toggleOption(option.key)"
            >
              <span class="check" aria-hidden="true"></span>
              {{ option.label }}
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class FilterDropdown {
  readonly label = input.required<string>();
  readonly options = input.required<readonly FilterOption[]>();
  readonly open = input(false);
  readonly selected = model.required<string[]>();
  readonly toggle = output<void>();

  protected toggleOption(key: string): void {
    this.selected.update((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
    );
  }
}
