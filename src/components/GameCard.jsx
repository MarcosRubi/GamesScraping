import { useContext } from "react";
import { MainContext } from "../context/MainContext";
import GameCardImage from "./GameCardImage";
import InfoNote from "./InfoNote";
import { parsePrice, formatPrice } from "../utils/currency";

export const STORES = {
    steam: { label: "Steam", tag: "steam" },
    gog: { label: "GOG", tag: "gog" },
    instantGaming: { label: "Instant Gaming", tag: "instant-gaming" },
    humble: { label: "Humble Store", tag: "humble" },
    fanatical: { label: "Fanatical", tag: "fanatical" },
};

// Detecta si el juego es gratis: precio 0, "Free" o "Gratis" en la
// cadena del precio actual.
function isFree(priceArr) {
    if (!Array.isArray(priceArr) || !priceArr[0]) return false;
    const now = String(priceArr[0].now || "").toLowerCase();
    return /free|gratis|\b0\b|0\.00|0,00/.test(now.replace(/[^\w.,]/g, ""));
}

// Devuelve la nota informativa apropiada: si el precio mostrado fue
// convertido de otra moneda (aviso con el precio original) o si la tienda
// cobra precio regional (GOG).
function buildNote(priceArr, storeKey, currency) {
    if (!Array.isArray(priceArr) || !priceArr[0]) return null;
    const now = String(priceArr[0].now || "");
    const parsed = parsePrice(now);
    if (parsed && parsed.currency !== currency) {
        return {
            label: "≈ convertido",
            text: (
                <>
                    Precio original <strong>{now}</strong>, al tipo de cambio
                    del día. El cobro final lo define la tienda.
                </>
            ),
        };
    }
    if (storeKey === "gog") {
        return {
            label: "Precio regional",
            text: "El precio puede variar según tu región. Verificalo en la web antes de comprar.",
        };
    }
    return null;
}

// La tarjeta de juego única de toda la app. La imagen ocupa toda la tarjeta
// (overlay degradado abajo con tienda / título / precios / comprar) y los
// chips (descuento, mejor precio) viven sobre la imagen. `children` es el
// slot para ResultNav en resultados de búsqueda.
function GameCard({ game, store, highlight = false, onCompare, children }) {
    const { currency, eurUsdRate } = useContext(MainContext);
    const storeInfo = STORES[store] || { label: store, tag: store };
    // Precio "conocido": hay un número parseable en el string. Si no hay
    // (y no es gratis), se muestra "Precio no encontrado" en vez de vacío.
    const rawNow = Array.isArray(game.price) ? game.price[0]?.now : undefined;
    const priceKnown = parsePrice(rawNow) !== null;
    // Gratis: por el string del precio, o porque es un free-to-play sin
    // precio en la tienda (ej. Counter-Strike 2 en la home de Steam).
    const free =
        isFree(game.price) ||
        (!priceKnown && (game.categories || []).includes("Free to Play"));
    const note = priceKnown ? buildNote(game.price, store, currency) : null;

    return (
        <div className={`cardGame ${highlight ? "cardGame--best" : ""}`}>
            <GameCardImage
                src={game.imgUrl}
                alt={`Imagen juego ${game.name} de ${storeInfo.label}`}
            />
            {children}
            {game.discount ? <span className="discount-chip">{game.discount}</span> : ""}
            <span className={`store-tag store-tag--${storeInfo.tag}`}>
                {storeInfo.label}
            </span>
            <div className="cardGameContent">
                <div className="cardGameTitle">
                    {highlight ? <span className="best-badge">Mejor precio</span> : ""}
                    <h3>{game.name}</h3>
                    {note ? <InfoNote label={note.label} text={note.text} /> : ""}
                </div>
                {Array.isArray(game.categories) && game.categories.length > 0 ? (
                    <div className="category-chips">
                        {game.categories.slice(0, 3).map((category) => (
                            <span key={category} className="category-chip">
                                {category}
                            </span>
                        ))}
                    </div>
                ) : (
                    ""
                )}
                <div className="cardGame--price">
                    {priceKnown && game.price.length > 1 ? (
                        <span className="price-old">
                            {formatPrice(game.price[1].old, currency, eurUsdRate)}
                        </span>
                    ) : (
                        ""
                    )}
                    {free ? (
                        <span className="price-now">Gratis</span>
                    ) : priceKnown ? (
                        <span className="price-now">
                            {formatPrice(rawNow, currency, eurUsdRate)}
                        </span>
                    ) : (
                        <span className="price-now price-now--missing">
                            Precio no encontrado
                        </span>
                    )}
                </div>
                <div className="cardGame__cta">
                    <a href={game.url} target="_blank" rel="noreferrer" className="buy-btn">
                        {free
                            ? `Obtener gratis en ${storeInfo.label}`
                            : `Comprar en ${storeInfo.label}`}
                    </a>
                    {onCompare ? (
                        <button
                            className="compare-btn compare-btn--cta"
                            onClick={() => onCompare(game.name)}
                            title="Buscar este juego en todas las tiendas"
                        >
                            Comparar precios
                        </button>
                    ) : (
                        ""
                    )}
                </div>
            </div>
        </div>
    );
}

export default GameCard;