import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiStore } from './core/state/ui.store';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';
import { SearchOverlay } from './layout/search-overlay/search-overlay';
import { TrailerPlayer } from './shared/ui/trailer-player';

// Esqueleto de la app. El buscador y el reproductor existen solo mientras
// están abiertos (@if): sus listeners y el video mueren al cerrarlos.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, SearchOverlay, TrailerPlayer],
  template: `
    <app-header />
    <main>
      <router-outlet />
    </main>
    <app-footer />

    @if (ui.searchOpen()) {
      <app-search-overlay />
    }
    @if (ui.trailer(); as trailer) {
      <app-trailer-player [trailer]="trailer" (closed)="ui.trailer.set(null)" />
    }
  `,
})
export class App {
  protected readonly ui = inject(UiStore);
}
