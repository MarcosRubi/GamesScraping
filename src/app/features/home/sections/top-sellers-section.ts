import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../shared/ui/icon/icon';
import { shopLink } from '../../shop/shop-filters.model';
import type { StoreKey } from '../../../core/models/game';
import { HomeDataStore } from '../../../core/state/home-data.store';
import { STORE_KEYS, STORES } from '../../../core/stores';
import { GameCard } from '../../../shared/ui/game-card';
import { SectionHeader } from '../../../shared/ui/section-header';
import { CardGridSkeleton } from '../ui/card-grid-skeleton';

type Tab = 'all' | StoreKey;

// Más vendidos con pestañas: todas las tiendas juntas (sin repetir lo que ya
// está arriba) o los de una tienda en particular.
@Component({
  selector: 'app-top-sellers-section',
  imports: [RouterLink, Icon, GameCard, SectionHeader, CardGridSkeleton],
  template: `
    <section id="mas-vendidos" class="page mt-16 scroll-mt-24">
      <app-section-header title="Más vendidos">
        @for (t of tabs; track t.key) {
          <button
            type="button"
            class="rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors"
            [class]="tab() === t.key ? 'bg-accent text-white' : 'bg-surface text-ink-2 hover:text-ink'"
            [attr.aria-pressed]="tab() === t.key"
            (click)="tab.set(t.key)"
          >
            {{ t.label }}
          </button>
        }
        <a routerLink="/juegos" [queryParams]="viewAll()" class="btn-soft ml-1">Ver todos <app-icon name="chevron-right" class="text-[11px]" /></a>
      </app-section-header>

      @if (games(); as list) {
        <div class="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
          @for (game of list; track game.url) {
            <app-game-card [game]="game" [labels]="['Top']" [showStore]="tab() === 'all'" />
          } @empty {
            <p class="col-span-full text-sm text-ink-3">No pudimos cargar esta lista ahora.</p>
          }
        </div>
      } @else {
        <app-card-grid-skeleton [count]="6" />
      }
    </section>
  `,
})
export class TopSellersSection {
  private readonly home = inject(HomeDataStore);

  protected readonly tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'Todas' },
    ...STORE_KEYS.map((key) => ({ key, label: STORES[key].shortLabel })),
  ];
  // Pestaña elegida: estado local de la sección.
  protected readonly tab = signal<Tab>('all');

  // "Ver todos" lleva a Juegos con la lista y, si hay pestaña, la tienda.
  protected readonly viewAll = computed(() => {
    const tab = this.tab();
    return shopLink({ lists: ['mas-vendidos'], stores: tab === 'all' ? [] : [tab] });
  });

  protected readonly games = computed(() => {
    const tab = this.tab();
    const list = tab === 'all' ? this.home.topSellers() : this.home.topSellersByStore[tab]();
    return list?.slice(0, 6) ?? null;
  });
}
