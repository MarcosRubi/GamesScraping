import { useContext, useEffect, useRef } from "react";
import { MainContext } from "../../context/MainContext";
import GetGameStore from "./GetGameStore";
import SearchLoading from "../SearchLoading";
import { STORES } from "../GameCard";
import { priceToUsdValue } from "../../utils/currency";

const STORE_KEYS = ["steam", "gog", "instantGaming", "humble", "fanatical"];

// Resultados de búsqueda en la MISMA grilla que las secciones de la home:
// tamaños de card idénticos y halo sin recortar (el carrusel anterior los
// clipeaba con su overflow). Las tiendas sin resultado no ocupan una card:
// se listan en una línea discreta arriba de la grilla.
function GamesResultSearchContainer() {
    const { gamesResult, showLoading, eurUsdRate } = useContext(MainContext);
    const sectionRef = useRef(null);

    // Al iniciar una búsqueda (desde la barra o "Comparar precios"), la vista
    // baja hasta esta sección en vez de quedarse donde estaba o ir al inicio.
    useEffect(() => {
        if (!showLoading) return;
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [showLoading]);

    if (showLoading) {
        return (
            <section className="results-search container" ref={sectionRef}>
                <SearchLoading />
            </section>
        );
    }
    if (gamesResult.length === 0) return null;

    function storeGames(key) {
        const games = gamesResult.find((element) => element[key])?.[key];
        return Array.isArray(games) && games.length > 0 ? games : null;
    }

    // Tiendas realmente consultadas (las del filtro activo al buscar): las
    // no consultadas se avisan aparte para que no parezca que "no existen".
    const searched = STORE_KEYS.filter((key) =>
        gamesResult.some((element) => key in element)
    );
    const available = searched.filter((key) => storeGames(key));
    const missing = searched.filter((key) => !storeGames(key));
    const excluded = STORE_KEYS.filter((key) => !searched.includes(key));

    // Precio del primer resultado de cada tienda, llevado a USD con el tipo
    // de cambio en vivo (solo para comparar cuál conviene, no se muestra).
    function priceValue(games) {
        const value = priceToUsdValue(games[0]?.price, eurUsdRate);
        return value === Infinity ? null : value;
    }

    const prices = available
        .map((key) => ({ key, value: priceValue(storeGames(key)) }))
        .filter((entry) => entry.value !== null);

    // Solo tiene sentido resaltar "mejor precio" si hay al menos 2 tiendas comparables
    const bestKey = prices.length >= 2
        ? prices.reduce((min, entry) => (entry.value < min.value ? entry : min)).key
        : null;

    return (
        <section className="container results-search">
            <h2 className="section-title">Resultados de búsqueda</h2>
            {missing.length > 0 && (
                <p className="missing-stores">
                    <span className="missing-stores__label">No disponible en:</span>
                    {missing.map((key) => (
                        <span key={key} className="missing-stores__tag">
                            {STORES[key].label}
                        </span>
                    ))}
                </p>
            )}
            {excluded.length > 0 && (
                <p className="missing-stores">
                    <span className="missing-stores__label">
                        Sin buscar (fuera de tu filtro):
                    </span>
                    {excluded.map((key) => (
                        <span key={key} className="missing-stores__tag">
                            {STORES[key].label}
                        </span>
                    ))}
                </p>
            )}
            <div className="game-grid">
                {available.map((key) => (
                    <GetGameStore
                        key={key}
                        data={gamesResult.filter((element) => element[key])}
                        storeKey={key}
                        highlight={bestKey === key}
                    />
                ))}
            </div>
        </section>
    );
}
export default GamesResultSearchContainer;
