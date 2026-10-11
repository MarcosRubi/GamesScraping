import { afterNextRender, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { HomeDataStore, type ListState } from '../../core/state/home-data.store';
import { SearchNavigator } from '../../core/state/search-navigator';
import { UiStore } from '../../core/state/ui.store';
import { GameRow } from '../../shared/ui/game-row';
import { Icon } from '../../shared/ui/icon/icon';

// Buscador a pantalla completa (como el diseño): campo grande, búsquedas
// populares y cuatro listas para explorar. Solo existe mientras está
// abierto: el listener de Escape y el foco viven y mueren con él.
@Component({
  selector: 'app-search-overlay',
  imports: [Icon, GameRow],
  host: { '(document:keydown.escape)': 'close()' },
  template: `
    <div class="fixed inset-0 z-[150] overflow-y-auto bg-bg/97 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-label="Buscar juegos">
      <button type="button" class="fixed top-5 right-5 rounded-full bg-surface p-3 text-lg text-ink transition hover:text-accent" aria-label="Cerrar buscador" (click)="close()">
        <app-icon name="close" />
      </button>

      <div class="page py-20 sm:py-28">
        <form class="flex h-14 overflow-hidden rounded-full border border-hairline bg-bg shadow-float focus-within:border-accent" role="search" (submit)="submit($event)">
          <input
            #input
            type="search"
            class="min-w-0 flex-1 bg-transparent px-6 text-base text-ink outline-none placeholder:text-ink-3"
            placeholder="Buscá un juego para comparar su precio..."
            aria-label="Nombre del juego"
            [value]="term()"
            (input)="term.set(input.value)"
          />
          <button type="submit" class="grid w-16 place-items-center bg-accent text-xl text-white transition hover:bg-accent-hover" aria-label="Buscar">
            <app-icon name="search" />
          </button>
        </form>

        @if (home.popularSearches().length > 0) {
          <p class="mt-6 text-[13px] font-medium tracking-wide text-ink uppercase">Búsquedas populares</p>
          <div class="mt-3 flex flex-wrap gap-2">
            @for (name of home.popularSearches(); track name) {
              <button type="button" class="rounded-md bg-surface px-3 py-1.5 text-[12px] font-medium text-ink-2 uppercase transition hover:bg-accent hover:text-white" (click)="navigator.search(name)">
                {{ name }}
              </button>
            }
          </div>
        }

        <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (column of columns(); track column.title) {
            <div>
              <h3 class="mb-3 text-[17px]">{{ column.title }}</h3>
              <div class="space-y-1 rounded-xl bg-surface p-3">
                @if (column.games === null) {
                  @for (n of [0, 1, 2]; track n) {
                    <div class="skeleton h-[84px] rounded-lg"></div>
                  }
                } @else {
                  @for (game of column.games.slice(0, 3); track game.url) {
                    <app-game-row [game]="game" />
                  } @empty {
                    <p class="p-2 text-sm text-ink-3">Sin juegos por ahora.</p>
                  }
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class SearchOverlay {
  protected readonly home = inject(HomeDataStore);
  protected readonly navigator = inject(SearchNavigator);
  private readonly ui = inject(UiStore);
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  protected readonly term = signal('');

  protected readonly columns = computed<{ title: string; games: ListState }[]>(() => [
    { title: 'Novedades', games: this.home.newReleases() },
    { title: 'Próximamente', games: this.home.comingSoon() },
    { title: 'Mejor valorados', games: this.home.topRated() },
    { title: 'Ofertas de Steam', games: this.home.steamDeals() },
  ]);

  constructor() {
    afterNextRender(() => this.input().nativeElement.focus());
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.navigator.search(this.term());
  }

  protected close(): void {
    this.ui.searchOpen.set(false);
  }
}
