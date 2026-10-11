import { DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import type { Currency, Theme } from '../models/game';
import { readStorage, writeStorage } from '../browser/storage';

const THEME_KEY = 'gs-theme';
const CURRENCY_KEY = 'gs-currency';

function initialTheme(): Theme {
  const saved = readStorage(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Preferencias del usuario (tema y moneda). Son estado que la UI lee en
// muchos lugares → signals. Persistirlas y reflejar el tema en <html> es
// sincronizar con algo externo a Angular, que es justo el caso de uso de
// effect() (no se usa effect para derivar estado: para eso está computed).
@Injectable({ providedIn: 'root' })
export class PreferencesStore {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<Theme>(initialTheme());
  readonly currency = signal<Currency>(readStorage(CURRENCY_KEY) === 'EUR' ? 'EUR' : 'USD');

  constructor() {
    effect(() => {
      const theme = this.theme();
      this.document.documentElement.dataset['theme'] = theme;
      writeStorage(THEME_KEY, theme);
    });
    effect(() => writeStorage(CURRENCY_KEY, this.currency()));
  }
}
