import { createContext, useEffect, useState } from "react";
import { FALLBACK_EUR_USD } from "../utils/currency";

export const MainContext = createContext();

const THEME_KEY = "gs-theme";
const CURRENCY_KEY = "gs-currency";
const FX_KEY = "gs-fx";
const FX_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12h: el tipo de cambio ECB es diario

const STORE_KEYS = ["steam", "gog", "instantGaming", "humble", "fanatical"];

const PLATFORM_PATHS = {
    steam: "steam",
    gog: "gog",
    instantGaming: "instant-gaming",
    humble: "humble",
    fanatical: "fanatical",
};

export function MainContextProvider(props) {
    const [gamesResult, setGameResult] = useState([]);
    const [nameGame, setNameGame] = useState(null);
    const [showLoading, setShowLoading] = useState(false);
    // Estado de carga POR TIENDA durante una búsqueda: cada key pasa a false
    // a medida que su fetch resuelve (para el checklist de loading).
    const [loadingStores, setLoadingStores] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Filtro multi-selección de tiendas: array vacío = "Todas". Vive acá
    // (no en HomeContext) porque también limita la búsqueda/comparación.
    const [platformFilter, setPlatformFilter] = useState([]);
    // Filtro multi-selección de categorías (solo filtra las secciones de la
    // home; la búsqueda de un juego puntual no se limita por categoría).
    const [categoryFilter, setCategoryFilter] = useState([]);
    // Tema: 'light' por defecto. Persiste en localStorage; respeta la
    // preferencia del SO solo si no hay valor guardado.
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === "light" || saved === "dark") return saved;
        return window.matchMedia?.("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    });
    // Moneda elegida para mostrar TODOS los precios. Persiste como el tema.
    const [currency, setCurrency] = useState(() =>
        localStorage.getItem(CURRENCY_KEY) === "EUR" ? "EUR" : "USD"
    );
    // Tipo de cambio EUR→USD en vivo. Arranca con el último valor cacheado
    // (o un fallback razonable) y se refresca abajo si está vencido.
    const [eurUsdRate, setEurUsdRate] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(FX_KEY));
            if (saved?.rate > 0) return saved.rate;
        } catch (err) { /* cache corrupta: usar fallback */ }
        return FALLBACK_EUR_USD;
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem(CURRENCY_KEY, currency);
    }, [currency]);

    // Refresca el tipo de cambio si el cacheado tiene más de 12h. API de
    // Frankfurter (datos del Banco Central Europeo): gratis, sin key, CORS
    // abierto. Sin DB: el valor vive en localStorage.
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(FX_KEY));
            if (saved?.rate > 0 && Date.now() - saved.ts < FX_MAX_AGE_MS) return;
        } catch (err) { /* sin cache válida: fetch directo */ }
        fetch("https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD")
            .then((res) => res.json())
            .then((data) => {
                const rate = data?.rates?.USD;
                if (rate > 0) {
                    setEurUsdRate(rate);
                    localStorage.setItem(FX_KEY, JSON.stringify({ rate, ts: Date.now() }));
                }
            })
            .catch(() => { /* sin red: se sigue con el último valor conocido */ });
    }, []);

    function toggleModal() {
        setIsModalOpen((open) => !open);
    }

    // Si una plataforma falla en la red (o el backend devuelve un error), no
    // debe tirar abajo la búsqueda entera ni dejar el spinner colgado -- cae
    // en la misma forma "no encontrado" que ya manejan las tarjetas.
    async function fetchPlatform(path, key) {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/${path}`);
            return await response.json();
        } catch (err) {
            return { [key]: "null" };
        } finally {
            // marca esta tienda como resuelta para el checklist de loading
            setLoadingStores((prev) => ({ ...prev, [key]: false }));
        }
    }

    // Busca solo en las tiendas del filtro activo (todas si no hay filtro):
    // si el usuario limitó a 2 tiendas, no tiene sentido scrapear las otras 3.
    async function getGames(term = nameGame) {
        const keys = platformFilter.length > 0 ? platformFilter : STORE_KEYS;
        setLoadingStores(Object.fromEntries(keys.map((key) => [key, true])));
        const results = await Promise.all(
            keys.map((key) => fetchPlatform(`${PLATFORM_PATHS[key]}/${term}`, key))
        );

        setGameResult(keys.map((key, index) => ({ [key]: results[index] })));
        setShowLoading(false);
        if (typeof umami !== 'undefined') {
            umami.track('search', { term, stores: keys.join(',') });
        }
    }

    return (
        <MainContext.Provider
            value={{
                toggleModal, isModalOpen, getGames, setNameGame, nameGame,
                gamesResult, setShowLoading, showLoading, loadingStores,
                theme, setTheme, currency, setCurrency, eurUsdRate,
                platformFilter, setPlatformFilter,
                categoryFilter, setCategoryFilter,
            }}
        >
            {props.children}
        </MainContext.Provider>
    );
}
