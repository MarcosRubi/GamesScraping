import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { shopLink } from '../../features/shop/shop-filters.model';
import { dismissOnOutside } from '../../core/browser/dismiss';
import { FiltersStore } from '../../core/state/filters.store';
import { SectionNavigator } from '../../core/state/section-navigator';
import { PreferencesStore } from '../../core/state/preferences.store';
import { UiStore } from '../../core/state/ui.store';
import { Icon } from '../../shared/ui/icon/icon';
import { CurrencySwitch } from './currency-switch';
import { HowItWorks } from './how-it-works';
import { MegaMenu } from './mega-menu';
import { MobileMenu } from './mobile-menu';
import { ThemeToggle } from './theme-toggle';

// Header sticky: logo, "Explorar" (mega menú con secciones, tiendas y
// géneros), buscador, moneda y tema. Bajo 1024px todo pasa a un menú lateral.
@Component({
  selector: 'app-header',
  imports: [RouterLink, Icon, MegaMenu, MobileMenu, CurrencySwitch, ThemeToggle, HowItWorks],
  templateUrl: './header.html',
})
export class Header {
  private readonly sections = inject(SectionNavigator);
  protected readonly ui = inject(UiStore);
  protected readonly filters = inject(FiltersStore);
  protected readonly preferences = inject(PreferencesStore);

  // Estado local del header: solo él lo usa.
  protected readonly offersLink = shopLink({ lists: ['ofertas'] });
  protected readonly megaOpen = signal(false);
  protected readonly howOpen = signal(false);
  protected readonly mobileOpen = signal(false);

  private readonly megaPanel = viewChild<ElementRef<HTMLElement>>('megaPanel');
  private readonly megaTrigger = viewChild<ElementRef<HTMLElement>>('megaTrigger');
  private readonly howPanel = viewChild<ElementRef<HTMLElement>>('howPanel');
  private readonly howTrigger = viewChild<ElementRef<HTMLElement>>('howTrigger');

  constructor() {
    dismissOnOutside(
      this.megaOpen,
      () => [this.megaPanel()?.nativeElement, this.megaTrigger()?.nativeElement],
      () => this.megaOpen.set(false),
    );
    dismissOnOutside(
      this.howOpen,
      () => [this.howPanel()?.nativeElement, this.howTrigger()?.nativeElement],
      () => this.howOpen.set(false),
    );
  }

  protected closePanels(): void {
    this.megaOpen.set(false);
    this.howOpen.set(false);
  }

  // Un solo panel abierto a la vez.
  protected toggleMega(): void {
    this.howOpen.set(false);
    this.megaOpen.update((open) => !open);
  }

  protected toggleHow(): void {
    this.megaOpen.set(false);
    this.howOpen.update((open) => !open);
  }

  // Ir a una sección de la home (desde cualquier página).
  protected goToSection(id: string): void {
    this.megaOpen.set(false);
    this.howOpen.set(false);
    this.mobileOpen.set(false);
    this.sections.goTo(id);
  }

  protected goHome(event: Event): void {
    event.preventDefault();
    this.sections.goHome();
  }
}
