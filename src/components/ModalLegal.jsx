import { useContext } from "react";
import { MainContext } from "../context/MainContext";
import { AiOutlineClose } from "react-icons/ai";

function ModalLegal() {
    const { toggleModal, isModalOpen } = useContext(MainContext);

    if (!isModalOpen) return null;

    const stores = ["Steam", "GOG", "Instant Gaming", "Humble Store", "Fanatical"];

    return (
        <>
            <div className="modal-backdrop" onClick={toggleModal} />
            <div id="modal" className="modal">
                <div className="modal__head">
                    <h2 className="modal__title">¿Cómo funciona?</h2>
                    <button
                        className="close"
                        onClick={toggleModal}
                        aria-label="Cerrar"
                    >
                        <AiOutlineClose />
                    </button>
                </div>
                <p>
                    <strong>GameScraping</strong> compara el precio de tu videojuego
                    favorito entre las principales tiendas digitales:
                </p>
                <ul className="modal__stores">
                    {stores.map((s) => (
                        <li key={s} className="modal__store">{s}</li>
                    ))}
                </ul>
                <p>
                    Usamos <strong>Web Scraping</strong>: recopilamos los precios
                    públicos que cada tienda muestra en su web y te los presentamos
                    juntos para que sepas dónde conviene comprar. Sin intermediarios,
                    sin comisiones — el link te lleva directo a la tienda.
                </p>
                <h3>¿Es legal el Web Scraping?</h3>
                <p>
                    Sí. Mientras los datos sean públicos (como los precios de los
                    videojuegos), el scraping es totalmente legal. Solo sería
                    problemático si se accediera a datos privados o protegidos, lo
                    cual no hacemos. Podés usar este sitio sin problema.
                </p>
            </div>
        </>
    );
}

export default ModalLegal;