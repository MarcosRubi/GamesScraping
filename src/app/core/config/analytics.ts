import { environment } from '../../../environments/environment';

// Inyecta el script de Umami solo si el entorno lo configura: la URL y el id
// del sitio vienen de las variables de entorno, no del HTML.
export function loadAnalytics(): void {
  const { scriptUrl, websiteId } = environment.analytics;
  if (!scriptUrl || !websiteId) return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = scriptUrl;
  script.dataset['websiteId'] = websiteId;
  document.head.appendChild(script);
}

declare const umami: { track: (event: string, data?: Record<string, string>) => void } | undefined;

export function trackEvent(event: string, data?: Record<string, string>): void {
  if (typeof umami !== 'undefined') umami.track(event, data);
}
