import React, { useEffect, useRef, useState } from "react";
import ShowLoading from "./ShowLoading";

function CardGame({ title, data, platform, classList }) {
    const DivResultsRef = useRef(null);
    const [DivResults, setDivResults] = useState(null);
    const [entryObserver, setEntryObserver] = useState(false);
    const [width, setWidth] = useState(310);

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

    if (data === null) {
        return (
            <section
                className={`${classList} container loading ${DivResults}`}
                ref={DivResultsRef}
            >
                <ShowLoading
                    message={`Obteniendo ${title}...`}
                />
            </section>
        );
    }

    const handleOnClick = () => {
        let div = document.querySelector(`.${classList}`)
        let offsetWidth = (data.length * 280 + (30*data.length)) - div.offsetWidth

        width >= offsetWidth ? setWidth(0) : setWidth(width + 280 + 30);
        width+280+30 > offsetWidth ? setWidth(0) : ''
        document.querySelector(`.${classList} .results`).scrollLeft = width;
    };

    return (
        <section
            className={`${classList} container`}
            ref={DivResultsRef}
        >
            <div className="d-flex align-center jc-between">
                <h2> {title} </h2>
                {(data.length * 280 + (30*data.length)) - document.querySelector(`.${classList}`).offsetWidth > 0 
                ?
                <div className="controls">
                    <button className="btn btn-outline" onClick={() => {handleOnClick(); }} > <span> Ver más</span> </button>
                </div>
                : ''}
            </div>
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
                                alt={`Imagen del juego ${game.name}`}
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
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default CardGame;
