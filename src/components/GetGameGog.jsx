import { useState } from "react";
import GetNotFound from "./GetNotFound";
import { AiOutlineReload } from "react-icons/ai";


function GetGameGog({ data }) {
    const [id, setId] = useState(0)

    function handleOnClick() {
        id + 1 === data[0].gog.length ? setId(0) : setId(id+1)
    }

    if (data[0].gog.gog === "null") {
        return <GetNotFound platform={"Gog"} />;
    }
    return (
        <div className="cardGame">
            <button className="changeResult" title="Cambiar resultado" onClick={()=>{handleOnClick()}}><AiOutlineReload/></button>
            {data[0].gog[id].discount 
                ? <div className="cardGame--discount"><span className="discount">{data[0].gog[id].discount}</span></div> 
                : ""
            }

            <div className="cardGameHeader">
                <img
                    src={data[0].gog[id].imgUrl}
                    alt={`Imagen juego ${data[0].gog[id].name} de gog`}
                />
            </div>
            
            <div className="cardGameContent">
                <h3>{data[0].gog[id].name}</h3>
                <div className="cardGame--price">
                    {data[0].gog[id].discount ? <span className="price-old">${data[0].gog[id].price[1].old}</span>  : ""}
                    <span className="price-now">{data[0].gog[id].price[0].now}</span>
                </div>
                    <a href={data[0].gog[id].url} target="_blank" className="btn btn-primary"><span>Comprar en Gog</span></a>
                    <div className="message">El precio puede variar dependiendo de la región, ingrese a la web para verificar el precio que se muestra.</div>
            </div>
        </div>
    );
}

export default GetGameGog;
