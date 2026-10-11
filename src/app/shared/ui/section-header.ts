import { Component, input } from '@angular/core';

// Título de sección + acciones a la derecha (contenido proyectado).
@Component({
  selector: 'app-section-header',
  host: { class: 'mb-5 flex flex-wrap items-center justify-between gap-3' },
  template: `
    <h2 class="text-[22px] text-ink sm:text-2xl">{{ title() }}</h2>
    <div class="flex flex-wrap items-center gap-2"><ng-content /></div>
  `,
})
export class SectionHeader {
  readonly title = input.required<string>();
}
