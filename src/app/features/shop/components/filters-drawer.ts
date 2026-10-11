import { Component, output } from '@angular/core';
import { Icon } from '../../../shared/ui/icon/icon';

// Panel lateral de filtros en móvil. Solo existe mientras está abierto: el
// listener de Escape vive lo mismo que el panel.
@Component({
  selector: 'app-filters-drawer',
  imports: [Icon],
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    <div class="fixed inset-0 z-[200] bg-black/50 animate-fade-in" (click)="closed.emit()"></div>
    <aside class="fixed inset-y-0 left-0 z-[210] flex w-[88vw] max-w-sm flex-col bg-header shadow-float animate-dd-in" aria-label="Filtros">
      <div class="flex items-center justify-between border-b border-hairline p-5">
        <h2 class="text-lg">Filtros</h2>
        <button type="button" class="rounded-full bg-surface p-2.5" aria-label="Cerrar filtros" (click)="closed.emit()">
          <app-icon name="close" />
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-5"><ng-content /></div>
      <div class="border-t border-hairline p-4">
        <button type="button" class="btn-primary w-full" (click)="closed.emit()">Ver resultados</button>
      </div>
    </aside>
  `,
})
export class FiltersDrawer {
  readonly closed = output<void>();
}
