import { Component, inject } from '@angular/core';
import type { NewsItem } from '../../../core/models/game';
import { HomeDataStore } from '../../../core/state/home-data.store';
import { wideArtUrl } from '../../../core/utils/steam-assets';
import { SectionHeader } from '../../../shared/ui/section-header';

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

// Últimas noticias oficiales de los juegos más vendidos (Steam).
@Component({
  selector: 'app-news-section',
  imports: [SectionHeader],
  template: `
    <div class="page">
      <app-section-header title="Últimas noticias" />
      <div class="grid gap-5 md:grid-cols-3">
        @if (home.news(); as news) {
          @for (item of news; track item.id) {
            <a [href]="item.url" target="_blank" rel="noreferrer" class="group relative flex min-h-[220px] items-end overflow-hidden rounded-card bg-black text-white">
              <img [src]="art(item)" alt="" loading="lazy" class="absolute inset-0 size-full object-cover opacity-80 transition duration-700 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>
              <span class="absolute top-4 left-4 rounded-md bg-bg px-2.5 py-1 text-center leading-tight text-ink">
                <span class="block text-lg font-medium">{{ day(item) }}</span>
                <span class="block text-[10px] text-ink-2">{{ month(item) }}</span>
              </span>
              <div class="relative w-full p-5 text-center">
                <span class="rounded bg-accent px-2 py-0.5 text-[10px] font-medium uppercase">{{ item.gameName }}</span>
                <h3 class="mt-3 line-clamp-2 text-[17px] leading-snug font-medium">{{ item.title }}</h3>
                <p class="mt-2 line-clamp-2 text-[12px] text-white/70">{{ item.excerpt }}</p>
              </div>
            </a>
          } @empty {
            <p class="text-sm text-ink-3">No hay noticias por ahora.</p>
          }
        } @else {
          @for (n of [0, 1, 2]; track n) {
            <div class="skeleton min-h-[220px] rounded-card"></div>
          }
        }
      </div>
    </div>
  `,
})
export class NewsSection {
  protected readonly home = inject(HomeDataStore);

  protected art(item: NewsItem): string | null {
    return item.imageUrl ?? wideArtUrl({ steamAppId: item.steamAppId, imgUrl: null });
  }
  protected day(item: NewsItem): string {
    return String(new Date(item.date * 1000).getDate()).padStart(2, '0');
  }
  protected month(item: NewsItem): string {
    return MONTHS[new Date(item.date * 1000).getMonth()];
  }
}
