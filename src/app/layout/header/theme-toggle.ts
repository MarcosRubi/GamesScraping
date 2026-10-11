import { Component, computed, inject } from '@angular/core';
import { PreferencesStore } from '../../core/state/preferences.store';
import { Icon } from '../../shared/ui/icon/icon';

// Botón redondo que alterna claro/oscuro.
@Component({
  selector: 'app-theme-toggle',
  imports: [Icon],
  template: `
    <button
      type="button"
      class="grid size-10 place-items-center rounded-full bg-surface text-[15px] text-ink transition-colors hover:text-accent"
      [attr.aria-label]="label()"
      [title]="label()"
      (click)="toggle()"
    >
      <app-icon [name]="dark() ? 'sun' : 'moon-stars'" />
    </button>
  `,
})
export class ThemeToggle {
  private readonly preferences = inject(PreferencesStore);
  protected readonly dark = computed(() => this.preferences.theme() === 'dark');
  protected readonly label = computed(() => (this.dark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'));

  protected toggle(): void {
    this.preferences.theme.set(this.dark() ? 'light' : 'dark');
  }
}
