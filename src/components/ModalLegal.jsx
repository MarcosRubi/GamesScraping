import { useContext } from "react";
import image from "../assets/data-scraping.svg";
import { MainContext } from "../context/MainContext";

function ModalLegal() {
    const { toggleModal } = useContext(MainContext);
    return (
        <div id="modal" className="modal container">
            <div className="d-flex jc-end" onClick={() => { toggleModal(); }} >
                <button className="close">X</button>
            </div>
            <hr />
            <h3 className=" text-center">¿Qué es el Web Scraping?</h3>
            <p>
                Es el proceso de recopilar información pública de diferentes
                páginas web con la finalidad de, por ejemplo, monitoreo de
                precios, de noticias, generación de clientes potenciales,
                investigación de mercado, entre muchos otros.
            </p>
            <h3 className=" text-center">¿Es legal el Web Scraping?</h3>
            <p>
                Para algunos puede parecer un robo el tomar datos de otros
                sitios web, pero siempre y cuando estos datos sean públicos es
                totalmente legal el scraping, en dado caso la información no sea
                pública como datos personales y de propiedad intelectual sería
                web scraping malicioso. En nuestro caso al ser los precios
                públicos de los videojuegos en las plataformas, no tenemos
                ningún problema con la ley, por lo tanto puede usar nuestra web
                sin problemas.
            </p>
            <div className="d-flex jc-center">
                <img src={image} alt="Image Scraping" />
            </div>
        </div>
    );
}

export default ModalLegal;
