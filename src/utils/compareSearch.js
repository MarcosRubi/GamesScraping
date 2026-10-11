// Limpia sufijos de plataforma ("... - PC (Steam)") y símbolos de marca para
// que el término funcione como búsqueda en las 5 tiendas.
export function cleanGameName(name) {
    return String(name || "")
        .split(" - ")[0]
        .replace(/\(.*?\)/g, "")
        .replace(/[®™©]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
