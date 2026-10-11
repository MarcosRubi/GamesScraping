// localStorage puede no existir o tirar (modo privado, cuota llena, cookies
// bloqueadas): la app debe funcionar igual, solo sin recordar preferencias.

export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // sin persistencia: no es crítico
  }
}
