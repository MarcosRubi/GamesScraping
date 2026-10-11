import { Component, signal } from '@angular/core';

// "¿Cómo funciona?": el texto que antes estaba en un modal, como el bloque
// de texto con "Leer más" del final del diseño.
@Component({
  selector: 'app-about-section',
  template: `
    <div class="page">
      <div class="relative overflow-hidden transition-[max-height] duration-500" [class]="expanded() ? 'max-h-[900px]' : 'max-h-[260px]'">
        <h2 class="text-[19px]">¿Cómo funciona GameScraping?</h2>
        <p class="mt-3 text-[14px] leading-relaxed text-ink-2">
          GameScraping compara el precio de tu videojuego en las principales tiendas digitales: Steam, GOG, Instant Gaming,
          Humble Store y Fanatical. Buscás un juego una vez y ves dónde está más barato, con el precio convertido a tu moneda.
        </p>
        <h3 class="mt-6 text-[17px]">Precios públicos, actualizados cada hora</h3>
        <p class="mt-3 text-[14px] leading-relaxed text-ink-2">
          Usamos web scraping: recopilamos los precios públicos que cada tienda muestra en su web y los APIs públicos de
          Steam para portadas, tráilers, reseñas y noticias. Las listas de la página se renuevan automáticamente cada hora;
          las búsquedas consultan las tiendas en el momento.
        </p>
        <p class="mt-3 text-[14px] leading-relaxed text-ink-2">
          No somos intermediarios ni cobramos comisiones: cada botón de compra te lleva directo a la tienda, que es la que
          define el precio final (puede variar por región o impuestos).
        </p>
        <h3 class="mt-6 text-[17px]">¿Es legal el web scraping?</h3>
        <p class="mt-3 text-[14px] leading-relaxed text-ink-2">
          Sí. Mientras los datos sean públicos, como los precios de los videojuegos, recopilarlos es legal. Solo sería un
          problema acceder a datos privados o protegidos, cosa que no hacemos.
        </p>
        @if (!expanded()) {
          <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent"></div>
        }
      </div>
      <button type="button" class="mt-3 text-[14px] font-medium text-ink underline underline-offset-4 hover:text-accent" (click)="expanded.set(!expanded())">
        {{ expanded() ? 'Leer menos' : 'Leer más' }}
      </button>
    </div>
  `,
})
export class AboutSection {
  protected readonly expanded = signal(false);
}
