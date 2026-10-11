import { useContext, useEffect, useRef, useState } from "react";
import { MainContext } from "../../context/MainContext";
import ShowLoading from "../ShowLoading";
import GameCard, { STORES } from "../GameCard";
import Carousel from "../Carousel";
import { cleanGameName } from "../../utils/compareSearch";

function TopSeller({ storeKey, data }) {
    const { setNameGame, getGames, setShowLoading } = useContext(MainContext);
    const sectionRef = useRef(null);
    const [visible, setVisible] = useState(null);
    const [entryObserver, setEntryObserver] = useState(false);
    const label = STORES[storeKey].label;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setEntryObserver(entry.isIntersecting);
                if (entryObserver) {
                    setVisible("visible");
                }
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.1,
            }
        );
        observer.observe(sectionRef.current);
    }, [entryObserver]);

    if (data === null) {
        return (
            <section className={`store-section container ${visible}`} ref={sectionRef}>
                <ShowLoading message={`Obteniendo los más vendidos de ${label}...`} />
            </section>
        );
    }

    // Busca este mismo juego en todas las tiendas.
    function compare(name) {
        const cleanName = cleanGameName(name);
        setNameGame(cleanName);
        setShowLoading(true);
        getGames(cleanName);
    }

    return (
        <section className="store-section container" ref={sectionRef}>
            <h2 className="section-title">Los más vendidos de {label}</h2>
            <Carousel visibleClass={visible}>
                {data.map((game, index) => (
                    <GameCard key={index} game={game} store={storeKey} onCompare={compare} />
                ))}
            </Carousel>
        </section>
    );
}

export default TopSeller;
