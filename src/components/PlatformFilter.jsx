import { useContext, useEffect, useRef, useState } from "react";
import { BsChevronDown } from "react-icons/bs";
import { MainContext } from "../context/MainContext";
import { HomeContext } from "../context/HomeContext";

const STORES = [
    { key: "steam", label: "Steam" },
    { key: "gog", label: "GOG" },
    { key: "instantGaming", label: "Instant Gaming" },
    { key: "humble", label: "Humble" },
    { key: "fanatical", label: "Fanatical" },
];

const MAX_CATEGORY_OPTIONS = 12;

// Categorías disponibles: unión de las categorías de los juegos cargados en
// las 3 secciones agregadas, ordenadas por frecuencia (las más comunes
// primero).
function availableCategories(lists) {
    const counts = new Map();
    for (const list of lists) {
        for (const game of list || []) {
            for (const category of game.categories || []) {
                counts.set(category, (counts.get(category) || 0) + 1);
            }
        }
    }
    return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_CATEGORY_OPTIONS)
        .map(([category]) => category);
}

// Dropdown de filtro estilo Steam: trigger pill con contador de selecciones
// y panel flotante con las opciones (multi-selección tipo checkbox).
function FilterDropdown({ id, label, options, selected, onChange, openId, onToggle }) {
    const open = openId === id;
    const allSelected = selected.length === 0;

    function toggle(key) {
        onChange(
            selected.includes(key)
                ? selected.filter((k) => k !== key)
                : [...selected, key]
        );
    }

    return (
        <div className={`filter-dd ${open ? "filter-dd--open" : ""}`}>
            <button
                type="button"
                className={`filter-dd__trigger ${
                    selected.length > 0 ? "filter-dd__trigger--active" : ""
                }`}
                aria-expanded={open}
                onClick={() => onToggle(open ? null : id)}
            >
                {label}
                <span
                    className={`filter-dd__count ${
                        selected.length === 0 ? "filter-dd__count--zero" : ""
                    }`}
                >
                    {selected.length}
                </span>
                <BsChevronDown className="filter-dd__caret" aria-hidden="true" />
            </button>
            {open && (
                <div className="filter-dd__menu">
                    <button
                        type="button"
                        className={`filter-dd__option filter-dd__option--all ${
                            allSelected ? "filter-dd__option--active" : ""
                        }`}
                        onClick={() => onChange([])}
                    >
                        <span className="filter-check" aria-hidden="true" />
                        Todas
                    </button>
                    <div className="filter-dd__grid">
                        {options.map((option) => (
                            <button
                                key={option.key}
                                type="button"
                                className={`filter-dd__option ${
                                    selected.includes(option.key)
                                        ? "filter-dd__option--active"
                                        : ""
                                }`}
                                aria-pressed={selected.includes(option.key)}
                                onClick={() => toggle(option.key)}
                            >
                                <span className="filter-check" aria-hidden="true" />
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Barra sticky de filtros con menús desplegables (Tiendas / Categorías) al
// estilo Steam, en lugar de filas de pills. El panel se cierra con click
// afuera o Escape.
function PlatformFilter() {
    const {
        platformFilter, setPlatformFilter,
        categoryFilter, setCategoryFilter,
    } = useContext(MainContext);
    const { topOffers, newReleases, topSellersAggregated } = useContext(HomeContext);

    const [openId, setOpenId] = useState(null);
    const barRef = useRef(null);

    useEffect(() => {
        if (!openId) return;
        function onDocMouseDown(e) {
            if (barRef.current && !barRef.current.contains(e.target)) {
                setOpenId(null);
            }
        }
        function onKeyDown(e) {
            if (e.key === "Escape") setOpenId(null);
        }
        document.addEventListener("mousedown", onDocMouseDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onDocMouseDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [openId]);

    const categories = availableCategories([topOffers, newReleases, topSellersAggregated]);

    return (
        <div className="header-filters" ref={barRef}>
            <FilterDropdown
                id="stores"
                label="Tiendas"
                options={STORES}
                selected={platformFilter}
                onChange={setPlatformFilter}
                openId={openId}
                onToggle={setOpenId}
            />
            {categories.length > 0 && (
                <FilterDropdown
                    id="categories"
                    label="Categorías"
                    options={categories.map((c) => ({ key: c, label: c }))}
                    selected={categoryFilter}
                    onChange={setCategoryFilter}
                    openId={openId}
                    onToggle={setOpenId}
                />
            )}
        </div>
    );
}

export default PlatformFilter;
