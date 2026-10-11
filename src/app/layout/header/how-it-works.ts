import { Component, input } from '@angular/core';
import { STORE_KEYS } from '../../core/stores';
import { Icon, type IconName } from '../../shared/ui/icon/icon';
import { StoreTag } from '../../shared/ui/store-tag';

const BLOCKS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'search',
    title: 'Comparás en un solo lugar',
    text: 'Buscás un juego una vez y ves su precio en las cinco tiendas, convertido a tu moneda, con el más barato resaltado.',
  },
  {
    icon: 'bolt',
    title: 'Precios públicos, cada hora',
    text: 'Usamos web scraping sobre los precios que cada tienda publica y las APIs públicas de Steam para portadas, tráilers, reseñas y noticias. Las listas se renuevan cada hora; las búsquedas consultan las tiendas en el momento.',
  },
  {
    icon: 'tags',
    title: 'Sin comisiones',
    text: 'No somos intermediarios: cada botón te lleva directo a la tienda, que define el precio final (puede variar por región o impuestos).',
  },
  {
    icon: 'info',
    title: '¿Es legal?',
    text: 'Sí. Recopilar datos públicos, como los precios de los juegos, es legal; solo sería un problema acceder a datos privados, cosa que no hacemos.',
  },
];

// Explicación de "¿Cómo funciona?": la usan el panel del header y el menú
// móvil. `compact` la apila en una columna.
@Component({
  selector: 'app-how-it-works',
  imports: [Icon, StoreTag],
  template: `
    <div class="grid gap-6" [class]="compact() ? '' : 'sm:grid-cols-2 lg:grid-cols-4'">
      @for (block of blocks; track block.title) {
        <div>
          <h3 class="flex items-center gap-2 text-[15px] font-medium">
            <span class="grid size-7 shrink-0 place-items-center rounded-full bg-accent/10 text-[13px] text-accent">
              <app-icon [name]="block.icon" />
            </span>
            {{ block.title }}
          </h3>
          <p class="mt-2 text-[13.5px] leading-relaxed text-ink-2">{{ block.text }}</p>
        </div>
      }
    </div>
    <div class="mt-6 flex flex-wrap items-center gap-2 border-t border-hairline pt-5">
      <span class="mr-1 text-[13px] text-ink-2">Tiendas que comparamos:</span>
      @for (key of storeKeys; track key) {
        <app-store-tag [store]="key" />
      }
    </div>
  `,
})
export class HowItWorks {
  readonly compact = input(false);
  protected readonly blocks = BLOCKS;
  protected readonly storeKeys = STORE_KEYS;
}
