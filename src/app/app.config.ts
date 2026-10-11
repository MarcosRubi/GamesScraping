import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    // withComponentInputBinding: ?q= llega como input de la página.
    // anchorScrolling: /#populares baja hasta la sección al llegar a la home.
    // La vuelta arriba al cambiar de página la maneja scrollTopOnPageChange
    // (App), para que cambiar filtros (query params) no salte al principio.
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'disabled', anchorScrolling: 'enabled' }),
    ),
  ],
};
