import { useContext, useEffect, useRef, useState } from "react";
import BannerImg from "../assets/banner.png";
import { MainContext } from "../context/MainContext";

function Banner() {
    const { transitionPage, loadViewToSearch } =
        useContext(MainContext);

    const bannerRef = useRef(null);
    const [banner, setBanner] = useState(null);
    const [entryObserver, setEntryObserver] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setEntryObserver(entry.isIntersecting);
                if (entryObserver) {
                    setBanner("visible");
                }
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.1,
            }
        );
        observer.observe(bannerRef.current);
    }, [entryObserver]);

    return (
        <section className={`banner container`} ref={bannerRef}>
            <div className="d-flex align-center jc-between">
                <div className={`banner-information  ${banner}`}>
                    <h1 className={`${banner}`}>
                        Compra tus videojuegos al mejor precio
                    </h1>
                    <p className={`${banner}`}>
                        Utilizamos el método de Web Scraping para ayudarte a
                        buscar la plataforma en donde más barato puedes adquirir
                        el juego que desees.
                    </p>
                    <button
                        className={`btn ${banner}`}
                        onClick={() => {
                            transitionPage();
                            loadViewToSearch();
                        }}
                    >
                        <span>Buscar Videojuego</span>
                    </button>
                </div>
                <div className="banner-img">
                    <img
                        src={BannerImg}
                        alt="Banner Image"
                        className={`${banner}`}
                    />
                </div>
            </div>
        </section>
    );
}

export default Banner;
