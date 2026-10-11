import { Component, inject } from '@angular/core';
import { SearchStore } from './core/state/search.store';
import { UiStore } from './core/state/ui.store';
import { FeaturedCarousel } from './features/featured/featured-carousel';
import { HomeSection } from './features/home/home-section';
import { StoreSection } from './features/home/store-section';
import { HowItWorksModal } from './features/how-it-works/how-it-works-modal';
import { SearchResults } from './features/search/search-results';
import { HomeDataStore } from './core/state/home-data.store';
import { Header } from './layout/header/header';

@Component({
  selector: 'app-root',
  imports: [Header, FeaturedCarousel, SearchResults, HomeSection, StoreSection, HowItWorksModal],
  template: `
    <app-header />
    <main>
      <app-featured-carousel />

      @if (search.hasSearched()) {
        <app-search-results />
      }

      <app-home-section title="Mejores ofertas" [games]="homeData.topOffers()" />
      <app-home-section title="Nuevos lanzamientos" [games]="homeData.newReleases()" />
      <app-home-section title="Más vendidos" [games]="homeData.topSellersAggregated()" />

      <!--
        Carruseles por tienda, debajo del pliegue: @defer no crea sus
        componentes (ni descarga su código, que va en un chunk aparte) hasta
        que el placeholder entra en pantalla. Reemplaza al IntersectionObserver
        manual de la versión React, que nunca se desconectaba.
      -->
      @for (store of storeSections; track store) {
        @defer (on viewport) {
          <app-store-section [store]="store" />
        } @placeholder {
          <div class="page my-18 h-[340px]" aria-hidden="true"></div>
        }
      }
    </main>

    @if (ui.howItWorksOpen()) {
      <app-how-it-works-modal />
    }
  `,
})
export class App {
  protected readonly search = inject(SearchStore);
  protected readonly homeData = inject(HomeDataStore);
  protected readonly ui = inject(UiStore);

  protected readonly storeSections = ['steam', 'instantGaming', 'gog', 'humble', 'fanatical'] as const;
}
