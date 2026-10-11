import { useContext } from "react";
import { MainContext } from "../../context/MainContext";
import GameCard from "../GameCard";
import { cleanGameName } from "../../utils/compareSearch";

const SKELETON_COUNT = 8;

// Banda agregada de la home (Mejores ofertas / Nuevos lanzamientos / Más
// vendidos): grilla responsiva, sin carrusel, filtrable por tienda. Cada
// tarjeta es un `GameCard` con overlay; el tag de la tienda ganadora se
// muestra sobre la imagen.
function HomeSection({ title, games, loadingMessage }) {
    const { setNameGame, getGames, setShowLoading, platformFilter, categoryFilter } =
        useContext(MainContext);

    if (games !== null) {
        const filtered = games.filter((game) => {
            if (platformFilter.length > 0 && !platformFilter.includes(game.store)) {
                return false;
            }
            if (
                categoryFilter.length > 0 &&
                !(game.categories || []).some((c) => categoryFilter.includes(c))
            ) {
                return false;
            }
            return true;
        });
        if (filtered.length === 0) return null;

        function compare(name) {
            const cleanName = cleanGameName(name);
            setNameGame(cleanName);
            setShowLoading(true);
            getGames(cleanName);
        }

        // Con una sola tienda filtrada, "Comparar precios" no aporta nada:
        // buscaría únicamente en la misma tienda que ya está viendo.
        const canCompare = platformFilter.length !== 1;

        return (
            <section className="home-section container">
                <h2 className="section-title">{title}</h2>
                <div className="game-grid">
                    {filtered.map((game, index) => (
                        <GameCard
                            key={index}
                            game={game}
                            store={game.store}
                            onCompare={canCompare ? compare : undefined}
                        />
                    ))}
                </div>
            </section>
        );
    }

    // Mientras carga: skeletons con la misma forma de card, para que la
    // página no salte cuando lleguen los juegos reales.
    return (
        <section className="home-section container" aria-busy="true">
            <h2 className="section-title">{title}</h2>
            <div className="game-grid" aria-label={loadingMessage}>
                {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                    <div key={index} className="skeleton-card" />
                ))}
            </div>
        </section>
    );
}

export default HomeSection;