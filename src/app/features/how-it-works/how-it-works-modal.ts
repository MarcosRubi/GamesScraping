import { afterNextRender, Component, ElementRef, inject, viewChild } from '@angular/core';
import { UiStore } from '../../core/state/ui.store';
import { Icon } from '../../shared/icon/icon';

// Modal "¿Cómo funciona?". El padre lo renderiza con @if, así que el
// listener de Escape (host binding a document) existe solo mientras el
// modal está abierto y se quita solo al cerrarlo.
@Component({
  selector: 'app-how-it-works-modal',
  imports: [Icon],
  styleUrl: './how-it-works-modal.scss',
  host: { '(document:keydown.escape)': 'close()' },
  template: `
    <div class="backdrop" (click)="close()"></div>
    <div #dialog class="modal" role="dialog" aria-modal="true" aria-labelledby="how-title" tabindex="-1">
      <div class="modal__head">
        <h2 id="how-title" class="modal__title">¿Cómo funciona?</h2>
        <button type="button" class="modal__close" aria-label="Cerrar" (click)="close()">
          <app-icon name="close" />
        </button>
      </div>
      <p>
        <strong>GameScraping</strong> compara el precio de tu videojuego favorito entre las principales tiendas
        digitales:
      </p>
      <ul class="modal__stores">
        @for (store of stores; track store) {
          <li class="modal__store">{{ store }}</li>
        }
      </ul>
      <p>
        Usamos <strong>Web Scraping</strong>: recopilamos los precios públicos que cada tienda muestra en su web y te
        los presentamos juntos para que sepas dónde conviene comprar. Sin intermediarios, sin comisiones — el link te
        lleva directo a la tienda.
      </p>
      <h3>¿Es legal el Web Scraping?</h3>
      <p>
        Sí. Mientras los datos sean públicos (como los precios de los videojuegos), el scraping es totalmente legal.
        Solo sería problemático si se accediera a datos privados o protegidos, lo cual no hacemos. Podés usar este
        sitio sin problema.
      </p>
    </div>
  `,
})
export class HowItWorksModal {
  private readonly ui = inject(UiStore);
  private readonly dialog = viewChild.required<ElementRef<HTMLElement>>('dialog');

  protected readonly stores = ['Steam', 'GOG', 'Instant Gaming', 'Humble Store', 'Fanatical'];

  constructor() {
    // Foco al modal al abrir, para lectores de pantalla y teclado.
    afterNextRender(() => this.dialog().nativeElement.focus());
  }

  protected close(): void {
    this.ui.howItWorksOpen.set(false);
  }
}
