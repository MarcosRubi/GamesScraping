import React, { useEffect, useRef, useState } from "react";
import ShowLoading from "../ShowLoading";

function TopSellersSteam() {
    const [games, setGames] = useState(null);
    const resultsRef = useRef(null);
    const [results, setResults] = useState(null);
    const [entryObserver, setEntryObserver] = useState(false);

    async function getGames() {
        const response = await fetch(`http://localhost:3000/top-sellers-steam`);
        const data = await response.json();

        setGames(data);
    }

    useEffect(() => {
        getGames();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setEntryObserver(entry.isIntersecting);
                if (entryObserver) {
                    setResults("visible");
                }
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.1,
            }
        );
        observer.observe(resultsRef.current);
    }, [entryObserver]);

    if (games === null) {
        return (
            <section
                className={`top-sellers-steam container ${results}`}
                ref={resultsRef}
            >
                <ShowLoading
                    message={"Obteniendo los más vendidos de steam..."}
                />
            </section>
        );
    }

    return (
        <section className={`top-sellers-steam container`} ref={resultsRef}>
            <h2>Los juegos más vendidos de steam:</h2>
            <div className={`results ${results}`}>
                {games.map((game, index) => (
                    <div className="cardGame" key={index}>
                        {game.discount ? (
                            <div className="cardGame--discount">
                                <span className="discount">
                                    {game.discount}
                                </span>
                            </div>
                        ) : (
                            ""
                        )}
                        <div className="cardGameHeader">
                            <img
                                src={game.imgUrl}
                                alt={`Imagen juego ${game.name} de Steam`}
                            />
                        </div>
                        <div className="cardGameContent">
                            <h3>{game.name}</h3>
                            <div className="cardGame--price">
                                {game.discount ? (
                                    <span className="price-old">
                                        {game.price[1].old}
                                    </span>
                                ) : (
                                    ""
                                )}
                                <span className="price-now">
                                    {game.price[0].now}
                                </span>
                            </div>
                            <a
                                href={game.url}
                                target="_blank"
                                className="btn btn-primary"
                            >
                                <span>Comprar en steam</span>
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default TopSellersSteam;
