import React, { useEffect, useRef, useState } from "react";
import ShowLoading from "../ShowLoading";

function TopSeller({platform, data}) {
    const DivResultsRef = useRef(null);
    const [DivResults, setDivResults] = useState(null);
    const [entryObserver, setEntryObserver] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setEntryObserver(entry.isIntersecting);
                if (entryObserver) {
                    setDivResults("visible");
                }
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.1,
            }
        );
        observer.observe(DivResultsRef.current);
    }, [entryObserver]);
    console.log(data)

    if (data === null) {
        return (
            <section className={`top-sellers-${platform.split(' ').join('-')} container ${DivResults}`} ref={DivResultsRef} >
                <ShowLoading message={`Obteniendo los más vendidos de ${platform}...`} />
            </section>
        );
    }

    return (
        <section className={`top-sellers-${platform.split(' ').join('-')} container`} ref={DivResultsRef}>
            <h2>Los juegos más vendidos de <span>{platform}</span>:</h2>
            <div className={`results ${DivResults}`}>
                {data.map((game, index) => (
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
                                alt={`Imagen juego ${game.name} de ${platform}`}
                            />
                        </div>
                        <div className="cardGameContent">
                            <h3>{game.name}</h3>
                            <div className="cardGame--price">
                                {game.price.length > 1 ? (
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
                                <span>Comprar en {platform}</span>
                            </a>
                            {platform.split(' ').join('-') === 'instant-gaming' 
                                ? <div className="message">El precio es en EUROS</div>
                                : ''
                            }
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default TopSeller;
