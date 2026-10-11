// Hace scroll a un elemento por id. Si todavía no está en el DOM (la página
// se está montando), reintenta unos frames antes de rendirse.
export function scrollToId(id: string, attempts = 30): void {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (attempts > 0) {
    requestAnimationFrame(() => scrollToId(id, attempts - 1));
  }
}
