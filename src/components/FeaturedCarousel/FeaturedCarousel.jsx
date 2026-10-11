import { useContext, useEffect, useState } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { MainContext } from "../../context/MainContext";
import { HomeContext } from "../../context/HomeContext";
import { STORES } from "../GameCard";
import { parsePrice, formatPrice } from "../../utils/currency";

const AUTO_ROTATE_MS = 6000;
const IMAGE_ROTATE_MS = 3500;
// Bajo 1200px el banner usa el layout compacto: imagen 16:9 arriba con las
// screenshots como slideshow (en vez de cuadrícula, que ocupa mucho) e info
// abajo. Desde 1200px, el layout de escritorio completo.
const MOBILE_QUERY = "(max-width: 1199px)";
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(
        () => window.matchMedia(MOBILE_QUERY).matches
    );
    useEffect(() => {
        const mq = window.matchMedia(MOBILE_QUERY);
        const onChange = (e) => setIsMobile(e.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);
    return isMobile;
}

const SWIPE_MIN_PX = 40;

// SOLO pantallas <1200px: imagen del slide activo como mini-slideshow
// (portada + screenshots rotan solas y se cambian arrastrando/deslizando).
// Fondo cover difuminado + imagen contain encima. Se remonta con cada
// slide (key del track), así el índice arranca en la portada.
function SlideImage({ game }) {
    const [imageIndex, setImageIndex] = useState(0);
    const [dragStartX, setDragStartX] = useState(null);
    const images = [game.imgUrl, ...(game.screenshots || [])].filter(Boolean);

    useEffect(() => {
        if (images.length < 2) return;
        const timer = setInterval(() => {
            setImageIndex((prev) => (prev + 1) % images.length);
        }, IMAGE_ROTATE_MS);
        return () => clearInterval(timer);
    }, [images.length]);

    function endDrag(clientX) {
        if (dragStartX === null) return;
        const dx = clientX - dragStartX;
        setDragStartX(null);
        if (Math.abs(dx) < SWIPE_MIN_PX || images.length < 2) return;
        setImageIndex(
            (prev) => (prev + (dx < 0 ? 1 : -1) + images.length) % images.length
        );
    }

    const src = images[imageIndex % images.length];

    return (
        <div
            className="featured-carousel__center-img featured-carousel__center-img--swipe"
            onPointerDown={(e) => setDragStartX(e.clientX)}
            onPointerUp={(e) => endDrag(e.clientX)}
            onPointerCancel={() => setDragStartX(null)}
        >
            <img
                key={`bg-${src}`}
                className="featured-carousel__center-img-bg"
                src={src}
                alt=""
                aria-hidden="true"
            />
            <img
                key={src}
                className="featured-carousel__center-img-main"
                src={src}
                alt={game.name}
            />
        </div>
    );
}

function FeaturedCarousel() {
    const { currency, eurUsdRate, setNameGame, getGames, setShowLoading } = useContext(MainContext);
    const { overwhelminglyPositive } = useContext(HomeContext);
    const [currentIndex, setCurrentIndex] = useState(0);
    // Dirección del último cambio (1 = adelante, -1 = atrás): decide desde
    // qué lado entra el slide en la animación CSS.
    const [direction, setDirection] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    // Desktop: la screenshot bajo el cursor sustituye la imagen grande.
    const [hoveredScreenshot, setHoveredScreenshot] = useState(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (!overwhelminglyPositive || overwhelminglyPositive.length === 0) return;
        if (isPaused) return;

        const timer = setInterval(() => {
            setDirection(1);
            setCurrentIndex((prev) => (prev + 1) % overwhelminglyPositive.length);
        }, AUTO_ROTATE_MS);

        return () => clearInterval(timer);
    }, [overwhelminglyPositive, isPaused]);

    if (overwhelminglyPositive === null) {
        return (
            <section className="featured-carousel" aria-busy="true">
                <h2 className="featured-carousel__title-section">Los mejor valorados</h2>
                {/* Placeholder con la misma forma que el slide central:
                    evita el salto de layout cuando llegan los datos. */}
                <div className="featured-carousel__stage">
                    <div className="featured-carousel__track">
                        <div className="featured-carousel__slide featured-carousel__slide--prev" />
                        <div className="featured-carousel__slide featured-carousel__slide--active">
                            <div className="featured-carousel__center featured-carousel__skeleton">
                                <div className="featured-carousel__center-img skeleton-block" />
                                <div className="featured-carousel__center-info">
                                    <span className="skeleton-line skeleton-line--tag" />
                                    <span className="skeleton-line skeleton-line--title" />
                                    <span className="skeleton-line skeleton-line--short" />
                                    <span className="skeleton-line skeleton-line--price" />
                                    <span className="skeleton-line skeleton-line--btn" />
                                </div>
                            </div>
                        </div>
                        <div className="featured-carousel__slide featured-carousel__slide--next" />
                    </div>
                </div>
            </section>
        );
    }

    if (!overwhelminglyPositive || overwhelminglyPositive.length === 0) {
        return null;
    }

    const games = overwhelminglyPositive;
    const total = games.length;

    // La lista crece/cambia a medida que llegan las tiendas: el índice se
    // normaliza con módulo para nunca apuntar fuera del array.
    const safeIndex = currentIndex % total;
    const prevGame = games[(safeIndex - 1 + total) % total];
    const activeGame = games[safeIndex];
    const nextGame = games[(safeIndex + 1) % total];

    const storeInfo = STORES[activeGame.store] || { label: activeGame.store, tag: activeGame.store };
    const rawNow = Array.isArray(activeGame.price) ? activeGame.price[0]?.now : undefined;
    const priceKnown = parsePrice(rawNow) !== null;
    const isFree = priceKnown && parsePrice(rawNow) === 0;
    const displayImage = hoveredScreenshot || activeGame.imgUrl;

    function handleCompare(name) {
        const cleanName = name.split(" - ")[0].replace(/\(.*?\)/g, "").trim();
        setNameGame(cleanName);
        setShowLoading(true);
        getGames(cleanName);
    }

    function go(dir) {
        setDirection(dir);
        setCurrentIndex((prev) => (prev + dir + total) % total);
    }

    return (
        <section className="featured-carousel">
            <h2 className="featured-carousel__title-section">Los mejor valorados</h2>
            <div
                className="featured-carousel__stage"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => {
                    setIsPaused(false);
                    setHoveredScreenshot(null);
                }}
            >
                <div
                    key={safeIndex}
                    className={`featured-carousel__track ${
                        direction === 1
                            ? "featured-carousel__track--fwd"
                            : "featured-carousel__track--back"
                    }`}
                >
                    <div className="featured-carousel__slide featured-carousel__slide--prev">
                        <div className="featured-carousel__side">
                            <img src={prevGame.imgUrl} alt={prevGame.name} />
                            <div className="featured-carousel__side-fade featured-carousel__side-fade--right" />
                        </div>
                    </div>

                    <div className="featured-carousel__slide featured-carousel__slide--active">
                        <div className="featured-carousel__center">
                            {isMobile ? (
                                <SlideImage game={activeGame} />
                            ) : (
                                <div className="featured-carousel__center-img">
                                    <img
                                        key={`bg-${displayImage}`}
                                        className="featured-carousel__center-img-bg"
                                        src={displayImage}
                                        alt=""
                                        aria-hidden="true"
                                    />
                                    <img
                                        key={displayImage}
                                        className="featured-carousel__center-img-main"
                                        src={displayImage}
                                        alt={activeGame.name}
                                    />
                                </div>
                            )}
                            <div className="featured-carousel__center-info">
                                <span className={`store-tag store-tag--${storeInfo.tag}`}>
                                    {storeInfo.label}
                                </span>
                                <h3 className="featured-carousel__game-title">{activeGame.name}</h3>
                                {/* Siempre presente (aunque vacía) para que todos los
                                    slides tengan las mismas filas y la misma altura. */}
                                <p className="featured-carousel__reviews">
                                    {activeGame.reviews || " "}
                                </p>
                                {/* Cuadrícula de screenshots SOLO en desktop; en móvil
                                    van como slideshow dentro de la imagen grande. */}
                                {!isMobile &&
                                    activeGame.screenshots &&
                                    activeGame.screenshots.length > 0 && (
                                        <div className="featured-carousel__screenshots">
                                            {activeGame.screenshots.map((ss, i) => (
                                                <button
                                                    key={i}
                                                    className="featured-carousel__screenshot"
                                                    onMouseEnter={() => setHoveredScreenshot(ss)}
                                                    onMouseLeave={() => setHoveredScreenshot(null)}
                                                >
                                                    <img src={ss} alt={`Screenshot ${i + 1}`} />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                {/* Contenedor siempre presente con min-height en CSS:
                                    reserva la fila aunque el juego no tenga categorías. */}
                                <div className="category-chips">
                                    {(activeGame.categories || []).slice(0, 3).map((cat) => (
                                        <span key={cat} className="category-chip">{cat}</span>
                                    ))}
                                </div>
                                <div className="featured-carousel__price-row">
                                    {activeGame.discount && (
                                        <span className="discount-chip discount-chip--large">{activeGame.discount}</span>
                                    )}
                                    {activeGame.price && activeGame.price.length > 1 && (
                                        <span className="price-old price-old--large">
                                            {formatPrice(activeGame.price[1].old, currency, eurUsdRate)}
                                        </span>
                                    )}
                                    {isFree ? (
                                        <span className="price-now price-now--large">Gratis</span>
                                    ) : priceKnown ? (
                                        <span className="price-now price-now--large">
                                            {formatPrice(rawNow, currency, eurUsdRate)}
                                        </span>
                                    ) : (
                                        <span className="price-now price-now--large price-now--missing">
                                            Precio no encontrado
                                        </span>
                                    )}
                                </div>
                                <div className="featured-carousel__actions">
                                    <a
                                        href={activeGame.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="buy-btn buy-btn--large"
                                    >
                                        {isFree ? `Obtener gratis en ${storeInfo.label}` : `Comprar en ${storeInfo.label}`}
                                    </a>
                                    <button
                                        className="compare-btn compare-btn--large"
                                        onClick={() => handleCompare(activeGame.name)}
                                    >
                                        Comparar precios
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="featured-carousel__slide featured-carousel__slide--next">
                        <div className="featured-carousel__side">
                            <img src={nextGame.imgUrl} alt={nextGame.name} />
                            <div className="featured-carousel__side-fade featured-carousel__side-fade--left" />
                        </div>
                    </div>
                </div>

                <button
                    className="featured-carousel__arrow featured-carousel__arrow--left"
                    onClick={() => go(-1)}
                    aria-label="Anterior"
                >
                    <AiOutlineLeft />
                </button>
                <button
                    className="featured-carousel__arrow featured-carousel__arrow--right"
                    onClick={() => go(1)}
                    aria-label="Siguiente"
                >
                    <AiOutlineRight />
                </button>

                <div className="featured-carousel__dots">
                    {games.map((_, index) => (
                        <button
                            key={index}
                            className={`featured-carousel__dot ${index === safeIndex ? "featured-carousel__dot--active" : ""}`}
                            onClick={() => {
                                setDirection(index > safeIndex ? 1 : -1);
                                setCurrentIndex(index);
                            }}
                            aria-label={`Ir al juego ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FeaturedCarousel;
