import { Component, computed, input } from '@angular/core';
import { ICON_PATHS } from './icon-paths';

export type IconName = keyof typeof ICON_PATHS;

// Ícono decorativo: hereda tamaño (1em) y color del texto que lo rodea. El
// texto accesible lo pone el botón que lo contiene (aria-label).
@Component({
  selector: 'app-icon',
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor">
      @for (d of icon().paths; track $index) {
        <path [attr.d]="d" [attr.fill-rule]="icon().evenOdd ? 'evenodd' : null" />
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  protected readonly icon = computed<{ paths: readonly string[]; evenOdd?: boolean }>(() => ICON_PATHS[this.name()]);
}
