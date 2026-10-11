import { Injectable, signal } from '@angular/core';

// Estado de UI compartido entre componentes que no son padre/hijo
// (el header abre el modal que vive en la raíz).
@Injectable({ providedIn: 'root' })
export class UiStore {
  readonly howItWorksOpen = signal(false);
}
