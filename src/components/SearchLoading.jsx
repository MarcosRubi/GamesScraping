import { useContext } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { MainContext } from "../context/MainContext";
import { STORES } from "./GameCard";

const STORE_KEYS = ["steam", "gog", "instantGaming", "humble", "fanatical"];

// Loading de búsqueda con progreso por tienda: cada pill muestra un
// mini-spinner mientras esa tienda busca y un check violeta cuando ya
// respondió (resuelva con resultados o sin ellos). Solo lista las tiendas
// que realmente se están buscando (las del filtro activo).
function SearchLoading() {
    const { nameGame, loadingStores } = useContext(MainContext);
    const searchedKeys = STORE_KEYS.filter((key) => key in loadingStores);

    return (
        <div className="search-loading">
            <p className="search-loading__title">
                Buscando <strong>{nameGame}</strong>
                {searchedKeys.length < STORE_KEYS.length
                    ? " en las tiendas de tu filtro..."
                    : " en las tiendas..."}
            </p>
            <div className="search-loading__stores">
                {searchedKeys.map((key) => {
                    const done = loadingStores[key] === false;
                    return (
                        <span
                            key={key}
                            className={`search-loading__store ${
                                done ? "search-loading__store--done" : ""
                            }`}
                        >
                            {done ? (
                                <AiOutlineCheck className="search-loading__check" aria-hidden="true" />
                            ) : (
                                <span className="search-loading__spinner" aria-hidden="true" />
                            )}
                            {STORES[key].label}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

export default SearchLoading;
