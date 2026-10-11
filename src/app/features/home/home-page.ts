import { Component } from '@angular/core';
import { GenreTiles } from './sections/genre-tiles';
import { HeroSection } from './sections/hero-section';
import { ListColumns } from './sections/list-columns';
import { NewsSection } from './sections/news-section';
import { PopularByGenre } from './sections/popular-by-genre';
import { PromoBanners } from './sections/promo-banners';
import { SpotlightSection } from './sections/spotlight-section';
import { TopSellersSection } from './sections/top-sellers-section';

// Página de inicio. Lo que está a la vista al entrar se crea enseguida; las
// secciones de más abajo van en @defer (on viewport): su código está en otro
// chunk y sus componentes (imágenes, peticiones perezosas como los géneros)
// recién se crean al acercarse a la pantalla. El id va en el contenedor de
// afuera para que los links del menú funcionen aunque la sección no exista
// todavía.
@Component({
  selector: 'app-home-page',
  imports: [
    HeroSection,
    GenreTiles,
    TopSellersSection,
    PromoBanners,
    PopularByGenre,
    SpotlightSection,
    ListColumns,
    NewsSection,
  ],
  template: `
    <app-hero-section />
    <app-genre-tiles />
    <app-top-sellers-section />
    <app-promo-banners />

    <section id="populares" class="mt-16 scroll-mt-24">
      @defer (on viewport) {
        <app-popular-by-genre />
      } @placeholder {
        <div class="h-[420px]"></div>
      }
    </section>

    <section id="destacado" class="mt-20 scroll-mt-20">
      @defer (on viewport) {
        <app-spotlight-section />
      } @placeholder {
        <div class="h-[520px]"></div>
      }
    </section>

    <section id="novedades" class="mt-20 scroll-mt-24">
      @defer (on viewport) {
        <app-list-columns />
      } @placeholder {
        <div class="h-[520px]"></div>
      }
    </section>

    <section id="noticias" class="mt-20 scroll-mt-24">
      @defer (on viewport) {
        <app-news-section />
      } @placeholder {
        <div class="h-[300px]"></div>
      }
    </section>
  `,
})
export class HomePage {}
