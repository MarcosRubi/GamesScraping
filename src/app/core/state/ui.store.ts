import { Injectable, signal } from '@angular/core';
import type { Trailer } from '../models/game';

// Estado de UI compartido entre partes que no son padre/hijo: el header
// abre el buscador, cualquier sección puede reproducir un tráiler, y los
// mosaicos de género eligen la categoría de "Populares por categoría".
@Injectable({ providedIn: 'root' })
export class UiStore {
  readonly searchOpen = signal(false);
  readonly trailer = signal<Trailer | null>(null);
  // Juego abierto en el modal de "Comparar" (null = cerrado).
  readonly compare = signal<string | null>(null);
  readonly popularGenre = signal('action');
}
