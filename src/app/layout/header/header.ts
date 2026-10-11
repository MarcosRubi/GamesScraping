import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { dismissOnOutside } from '../../core/browser/dismiss';
import { scrollToId } from '../../core/browser/scroll';
import { FiltersStore } from '../../core/state/filters.store';
import { PreferencesStore } from '../../core/state/preferences.store';
import { UiStore } from '../../core/state/ui.store';
import { Icon } from '../../shared/ui/icon/icon';
import { CurrencySwitch } from './currency-switch';
import { MegaMenu } from './mega-menu';
import { MobileMenu } from './mobile-menu';
import { ThemeToggle } from './theme-toggle';

// Header sticky: logo, "Explorar" (mega menú con secciones, tiendas y
// géneros), buscador, moneda y tema. Bajo 1024px todo pasa a un menú lateral.
@Component({
  selector: 'app-header',
  imports: [Icon, MegaMenu, MobileMenu, CurrencySwitch, ThemeToggle],
  templateUrl: './header.html',
})
export class Header {
  private readonly router = inject(Router);
  protected readonly ui = inject(UiStore);
  protected readonly filters = inject(FiltersStore);
  protected readonly preferences = inject(PreferencesStore);

  // Estado local del header: solo él lo usa.
  protected readonly megaOpen = signal(false);
  protected readonly mobileOpen = signal(false);

  private readonly megaPanel = viewChild<ElementRef<HTMLElement>>('megaPanel');
  private readonly megaTrigger = viewChild<ElementRef<HTMLElement>>('megaTrigger');

  constructor() {
    dismissOnOutside(
      this.megaOpen,
      () => [this.megaPanel()?.nativeElement, this.megaTrigger()?.nativeElement],
      () => this.megaOpen.set(false),
    );
  }

  // Ir a una sección de la home (desde cualquier página).
  protected goToSection(id: string): void {
    this.megaOpen.set(false);
    this.mobileOpen.set(false);
    void this.router.navigate(['/']).then(() => scrollToId(id));
  }

  protected goHome(event: Event): void {
    event.preventDefault();
    void this.router.navigate(['/']).then(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}
