import { useContext } from "react";
import { MainContext } from "../context/MainContext";
import { AiOutlineSearch } from "react-icons/ai";

function SearchBar({ compact = false }) {
    const { setNameGame, nameGame, getGames, setShowLoading } = useContext(MainContext);

    function handleSubmit(e) {
        e.preventDefault();
        if (!nameGame || !nameGame.trim()) return;
        setShowLoading(true);
        getGames();
    }

    if (compact) {
        return (
            <form className="header-search" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Buscar..."
                    aria-label="Nombre del juego"
                    value={nameGame === null ? "" : nameGame}
                    onChange={(e) => setNameGame(e.target.value)}
                />
                <button type="submit" className="header-search__submit" aria-label="Buscar">
                    <AiOutlineSearch />
                </button>
            </form>
        );
    }

    return (
        <form className="search-pill" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Busca un juego..."
                aria-label="Nombre del juego"
                value={nameGame === null ? "" : nameGame}
                onChange={(e) => setNameGame(e.target.value)}
            />
            <button type="submit" className="search-pill__submit" aria-label="Buscar">
                <AiOutlineSearch />
            </button>
        </form>
    );
}

export default SearchBar;
