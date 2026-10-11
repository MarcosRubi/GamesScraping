import { Component, input } from '@angular/core';
import { Icon } from '../icon/icon';

// Pill informativa: la etiqueta corta siempre visible (clave en móvil, donde
// no hay hover) y el texto completo (contenido proyectado) como tooltip al
// pasar el mouse o al enfocarla con teclado/tap. Solo CSS, sin listeners.
@Component({
  selector: 'app-info-note',
  imports: [Icon],
  styleUrl: './info-note.scss',
  template: `
    <button type="button" class="info-note">
      <app-icon name="info" />
      <span class="info-note__label">{{ label() }}</span>
      <span class="info-note__text" role="tooltip"><ng-content /></span>
    </button>
  `,
})
export class InfoNote {
  readonly label = input.required<string>();
}
