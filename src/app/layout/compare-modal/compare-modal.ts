import { afterNextRender, Component, DestroyRef, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { PriceComparison } from '../../features/search/price-comparison';
import { Icon } from '../../shared/ui/icon/icon';

// "Comparar" desde una tarjeta: la comparación a pantalla completa encima de
// la página actual, sin navegar. Al cerrarlo (X, Escape o al navegar) la
// página sigue exactamente donde estaba: scroll, filtros y carruseles.
// Mientras está abierto bloquea el scroll de la página de fondo.
@Component({
  selector: 'app-compare-modal',
  imports: [Icon, PriceComparison],
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    <div
      #dialog
      tabindex="-1"
      class="fixed inset-0 z-[160] overflow-y-auto overscroll-contain bg-bg outline-none animate-fade-in"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="'Comparar precios de ' + term()"
    >
      <div class="sticky top-0 z-10 border-b border-hairline bg-header/95 backdrop-blur">
        <div class="page flex h-16 items-center gap-4">
          <button
            type="button"
            class="inline-flex shrink-0 items-center gap-2 rounded-full bg-surface px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:text-accent"
            (click)="closed.emit()"
          >
            <app-icon name="arrow-left" /> Volver
          </button>
          <p class="hidden text-[13px] font-medium tracking-wide text-accent uppercase sm:block">Comparación de precios</p>
          <button type="button" class="ml-auto rounded-full bg-surface p-2.5 text-ink transition hover:text-accent" aria-label="Cerrar" (click)="closed.emit()">
            <app-icon name="close" />
          </button>
        </div>
      </div>

      <section class="page pt-8 pb-20">
        <p class="text-[12px] font-medium tracking-wide text-accent uppercase sm:hidden">Comparación de precios</p>
        <h1 class="mt-1 text-[26px] leading-tight break-words sm:mt-0 sm:text-4xl">{{ term() }}</h1>
        <app-price-comparison [term]="term()" />
      </section>
    </div>
  `,
})
export class CompareModal {
  readonly term = input.required<string>();
  readonly closed = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLElement>>('dialog');

  constructor() {
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    inject(DestroyRef).onDestroy(() => (root.style.overflow = previousOverflow));

    // Atrás del navegador o un link: se cierra en vez de quedar encima.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closed.emit());

    // El foco va al diálogo (no a un botón): Escape y el teclado funcionan
    // sin dejar un anillo de foco dibujado en "Volver".
    afterNextRender(() => this.dialog().nativeElement.focus({ preventScroll: true }));
  }
}
