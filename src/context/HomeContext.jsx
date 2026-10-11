import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { MainContext } from "./MainContext";
import { priceToUsdValue } from "../utils/currency";

export const HomeContext = createContext();

const STORE_KEYS = ["steam", "gog", "instantGaming", "humble", "fanatical"];

const TOP_SELLERS_PATHS = {
    steam: "top-sellers-steam",
    gog: "top-sellers-gog",
    instantGaming: "top-sellers-instant-gaming",
    humble: "top-sellers-humble",
    fanatical: "top-sellers-fanatical",
};

// Normaliza el nombre del juego para agrupar el mismo título entre tiendas:
// lowercase, sin símbolos de marca, sin sufijos de plataforma, sin espacios extra.
function normalizeName(name) {
    return String(name || "")
        .split(" - ")[0]
        .replace(/\(.*?\)/g, "")
        .replace(/[®™©]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();
}

// Dedupe: ante un mismo nombre normalizado se queda con la tarjeta del
// precio más bajo (comparados en USD con el tipo de cambio en vivo).
// Devuelve array en el orden original de llegada.
function dedupeCheapest(games, eurUsdRate) {
    const map = new Map();
    for (const game of games) {
        const key = normalizeName(game.name);
        const prev = map.get(key);
        if (
            !prev ||
            priceToUsdValue(game.price, eurUsdRate) <
                priceToUsdValue(prev.price, eurUsdRate)
        ) {
            map.set(key, game);
        }
    }
    return Array.from(map.values());
}

export function HomeContextProvider(props) {
    const { eurUsdRate } = useContext(MainContext);
    const [topSellers, setTopSellers] = useState({
        steam: null,
        gog: null,
        instantGaming: null,
        humble: null,
        fanatical: null,
    });
    const [topOffers, setTopOffers] = useState(null);
    const [newReleases, setNewReleases] = useState(null);
    const [topSellersAggregated, setTopSellersAggregated] = useState(null);
    // Fuentes del banner "mejor valorados": una lista propia por tienda.
    const [bestRated, setBestRated] = useState({
        steam: null,
        gog: null,
        instantGaming: null,
    });

    // Una tienda caída no mata la sección: devuelve [] y el resto sigue.
    // Se estampa `store` en cada juego para que GameCard muestre su tag.
    async function fetchList(path, store) {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/${path}`);
            const data = await response.json();
            return Array.isArray(data) ? data.map((game) => ({ ...game, store })) : [];
        } catch (err) {
            return [];
        }
    }

    useEffect(() => {
        // Más vendidos por tienda: cada uno resuelve independiente, las
        // secciones aparecen a medida que llegan.
        STORE_KEYS.forEach(async (key) => {
            const games = await fetchList(TOP_SELLERS_PATHS[key], key);
            setTopSellers((prev) => ({ ...prev, [key]: games }));
        });

        // Mejores ofertas: mezcla de tiendas + dedupe por nombre (queda el
        // más barato), ordenado por descuento. GOG no tiene top-offers.
        (async () => {
            const lists = await Promise.all([
                fetchList("top-offers-steam", "steam"),
                fetchList("top-offers-humble", "humble"),
                fetchList("top-offers-fanatical", "fanatical"),
                fetchList("top-offers-instant-gaming", "instantGaming"),
            ]);
            const merged = lists
                .flat()
                .filter((game) => game.discount && !isNaN(parseInt(game.discount)))
                .sort((a, b) => parseInt(b.discount) - parseInt(a.discount));
            setTopOffers(dedupeCheapest(merged, eurUsdRate).slice(0, 12));
        })();

        // Nuevos lanzamientos: intercalado round-robin + dedupe.
        // Instant Gaming no tiene endpoint de lanzamientos.
        (async () => {
            const lists = await Promise.all([
                fetchList("new-releases-steam", "steam"),
                fetchList("new-releases-gog", "gog"),
                fetchList("new-releases-humble", "humble"),
                fetchList("new-releases-fanatical", "fanatical"),
            ]);
            const interleaved = [];
            const maxLen = Math.max(...lists.map((l) => l.length), 0);
            for (let i = 0; i < maxLen; i++) {
                lists.forEach((list) => {
                    if (list[i]) interleaved.push(list[i]);
                });
            }
            setNewReleases(dedupeCheapest(interleaved, eurUsdRate).slice(0, 12));
        })();

        // Mejor valorados por tienda para el banner: Steam (reseñas
        // extremadamente positivas), GOG (catálogo por rating) e Instant
        // Gaming (90%+ de reseñas). Cada uno resuelve independiente.
        (async () => {
            const games = await fetchList("overwhelmingly-positive-steam", "steam");
            setBestRated((prev) => ({ ...prev, steam: games.slice(0, 10) }));
        })();
        (async () => {
            const games = await fetchList("best-rated-gog", "gog");
            setBestRated((prev) => ({ ...prev, gog: games }));
        })();
        (async () => {
            const games = await fetchList("best-rated-instant-gaming", "instantGaming");
            setBestRated((prev) => ({ ...prev, instantGaming: games }));
        })();
    }, []);

    // Banner multi-tienda: junta los "mejor valorados / destacados" de cada
    // tienda (Steam: extremadamente positivas; GOG: por rating; Instant
    // Gaming: 90%+ de reseñas; Humble y Fanatical: sus destacados, que son
    // sus páginas de más vendidos), intercala round-robin para que ninguna
    // tienda domine y deduplica por nombre quedándose con la tienda donde
    // el precio es más bajo (comparados en USD). Se muestra progresivo: en
    // cuanto llega la primera lista ya hay banner y se completa después.
    const overwhelminglyPositive = useMemo(() => {
        const sources = [
            bestRated.steam,
            bestRated.gog,
            bestRated.instantGaming,
            topSellers.humble,
            topSellers.fanatical,
        ];
        if (sources.every((list) => list === null)) return null;
        const lists = sources.map((list) => list || []);
        const interleaved = [];
        const maxLen = Math.max(...lists.map((l) => l.length), 0);
        for (let i = 0; i < maxLen; i++) {
            lists.forEach((list) => {
                if (list[i]) interleaved.push(list[i]);
            });
        }
        return dedupeCheapest(interleaved, eurUsdRate).slice(0, 12);
    }, [bestRated, topSellers, eurUsdRate]);

    // Cuando los 5 “más vendidos” ya llegaron, arma la banda agregada con
    // dedupe (queda el más barato entre las tiendas para cada título).
    useEffect(() => {
        if (topSellersAggregated !== null) return;
        if (Object.values(topSellers).some((v) => v === null)) return;
        const merged = Object.values(topSellers).flat();
        setTopSellersAggregated(dedupeCheapest(merged, eurUsdRate).slice(0, 12));
    }, [topSellers, topSellersAggregated]);

    return (
        <HomeContext.Provider
            value={{
                topSellers,
                topOffers,
                newReleases,
                topSellersAggregated,
                overwhelminglyPositive,
            }}
        >
            {props.children}
        </HomeContext.Provider>
    );
}