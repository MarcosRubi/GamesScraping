import type { IconName } from '../../shared/ui/icon/icon';

// Secciones de la home a las que se puede saltar desde el menú (ids de las
// secciones en la página de inicio).
export const SECTION_LINKS: { id: string; label: string; icon: IconName }[] = [
  { id: 'ofertas', label: 'Ofertas', icon: 'percent' },
  { id: 'mas-vendidos', label: 'Más vendidos', icon: 'fire' },
  { id: 'populares', label: 'Populares por género', icon: 'tags' },
  { id: 'novedades', label: 'Novedades y próximos', icon: 'calendar' },
  { id: 'noticias', label: 'Noticias', icon: 'news' },
];
