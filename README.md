# GameScraping

Compara el precio de un videojuego en Steam, GOG, Instant Gaming, Humble Store y Fanatical. Los datos vienen de la [API](https://github.com/MarcosRubi/API-gaming-scraping) (NestJS).

Sitio: [games-scraping.mrubi.dev](https://games-scraping.mrubi.dev)

## Tecnologías
- [Angular 22](https://angular.dev/): standalone, zoneless, signals, `httpResource`, router con carga diferida y `@defer`
- [Tailwind CSS 4](https://tailwindcss.com/) (tokens del diseño como variables CSS, tema claro/oscuro)
- [hls.js](https://github.com/video-dev/hls.js) para los tráilers de Steam (se descarga solo al reproducir)
- Vitest

## Entornos y scripts

Requiere Node ≥ 22.22 (o 24 LTS). Las variables viven en `.env.<entorno>` (no se versionan); la plantilla es [.env.example](.env.example). `scripts/generate-env.mjs` genera `src/environments/environment.ts` a partir de ese archivo antes de servir o compilar.

```bash
npm install
cp .env.example .env.development   # API_URL=http://localhost:3000
cp .env.example .env.qa            # API_URL del VPS + analítica

npm run start:dev    # ng serve con las variables de desarrollo
npm run start:qa     # ng serve con las variables de QA (VPS)
npm run build:qa     # build de producción con las variables de QA → dist/gamescraping/browser
npm test
```

Para que `start:qa` funcione desde tu PC, la API de QA tiene que aceptar `http://localhost:4200` en `ALLOWED_ORIGINS`.

## Estructura

```
src/app/
  app.ts  app.config.ts  app.routes.ts
  core/
    config/      URLs de la API y analítica (desde environment)
    models/      tipos (Game, StoreGame, NewsItem...)
    state/       stores con signals: preferencias, tipo de cambio, filtros, datos de la home, UI
    browser/     helpers del navegador que se limpian solos (media query, visibilidad, click afuera, scroll)
    utils/       precios, moneda, listas (dedupe/intercalado) e imágenes de Steam — con tests
  shared/ui/     componentes reutilizables: GameCard, GameRow, GameCover, Price, Rating, TrailerPlayer, Icon...
  layout/        header (mega menú, menú móvil, moneda, tema), buscador a pantalla completa, footer
  features/
    home/        página de inicio y sus secciones
    search/      página de resultados (/buscar?q=)
```

## Criterios

**Secciones sin repetir:** cada sección tiene su propia fuente (destacados de Steam, ofertas multi-tienda, más vendidos, ofertas de Steam, géneros, próximos, novedades, mejor valorados) y, además, un computed excluye los juegos que ya mostró una sección de más arriba.

**Signals**
- `signal` para estado que se pinta; `computed` para todo lo derivado (nunca un `effect` que escribe otra signal).
- `linkedSignal` para estado local que se reinicia con su origen (índice n/m de un resultado, imagen de respaldo de una portada).
- `effect` solo para sincronizar con el exterior: localStorage, `data-theme`, timers.
- `httpResource` para las peticiones: cancela la anterior si cambia el request, y los recursos de la página de búsqueda viven en ese componente (salir de la página cancela lo pendiente).
- Campos normales para valores que no se pintan.

**Nada corriendo de más**
- Rotación del hero: `effect` con `onCleanup`; se pausa con el mouse encima, con la pestaña oculta o con un tráiler abierto.
- Listeners de `document` (click afuera, Escape): solo mientras el panel está abierto.
- Buscador, menú móvil y reproductor existen solo mientras están abiertos; `hls.js` se destruye al cerrar.
- Secciones de abajo con `@defer (on viewport)` y géneros pedidos a demanda.

## Docker
```bash
docker build --build-arg API_URL=https://api.ejemplo.com -t gamescraping-web .
```

## Autor
- Portafolio - [Marcos Rubí](https://mrubi.vercel.app/)
