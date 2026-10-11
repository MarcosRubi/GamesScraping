import { useContext, useEffect, useState } from "react";
import { MainContext } from "../context/MainContext";
import { BsSun, BsMoonStars, BsSliders } from "react-icons/bs";
import SearchBar from "./SearchBar";
import PlatformFilter from "./PlatformFilter";

const CURRENCIES = [
    { key: "USD", label: "US$" },
    { key: "EUR", label: "€" },
];

const THEMES = [
    { key: "light", icon: <BsSun />, label: "Modo claro" },
    { key: "dark", icon: <BsMoonStars />, label: "Modo oscuro" },
];

function Header() {
    const { toggleModal, theme, setTheme, currency, setCurrency, platformFilter, categoryFilter } =
        useContext(MainContext);
    // Panel de herramientas (filtros + moneda): en escritorio vive inline en
    // el header; en móvil se colapsa detrás del botón de ajustes para no
    // comerse media pantalla de alto.
    const [toolsOpen, setToolsOpen] = useState(false);
    const activeFilters = platformFilter.length + categoryFilter.length;

    useEffect(() => {
        if (!toolsOpen) return;
        function onDocMouseDown(e) {
            if (!e.target.closest(".header-tools, .tools-toggle")) {
                setToolsOpen(false);
            }
        }
        function onKeyDown(e) {
            if (e.key === "Escape") setToolsOpen(false);
        }
        document.addEventListener("mousedown", onDocMouseDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onDocMouseDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [toolsOpen]);

    return (
        <header className="site-header">
            <div className="container d-flex align-center jc-between">
                <a
                    className="logo"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                >
                    GameScraping<span className="logo-dot">.</span>
                </a>
                <div className="site-header__actions">
                    <SearchBar compact />
                    <button
                        type="button"
                        className="tools-toggle"
                        aria-expanded={toolsOpen}
                        aria-label="Filtros y moneda"
                        onClick={() => setToolsOpen((open) => !open)}
                    >
                        <BsSliders />
                        {activeFilters > 0 && (
                            <span className="tools-toggle__badge">{activeFilters}</span>
                        )}
                    </button>
                    <div className={`header-tools ${toolsOpen ? "header-tools--open" : ""}`}>
                        <PlatformFilter />
                        <div className="seg seg--currency" role="group" aria-label="Moneda de los precios">
                            {CURRENCIES.map(({ key, label }) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`seg__option ${
                                        currency === key ? "seg__option--active" : ""
                                    }`}
                                    aria-pressed={currency === key}
                                    onClick={() => setCurrency(key)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="seg seg--theme" role="group" aria-label="Tema de la interfaz">
                            {THEMES.map(({ key, icon, label }) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`seg__option ${
                                        theme === key ? "seg__option--active" : ""
                                    }`}
                                    aria-pressed={theme === key}
                                    aria-label={label}
                                    onClick={() => setTheme(key)}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button className="how-link" onClick={toggleModal}>
                        ¿Cómo funciona?
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
