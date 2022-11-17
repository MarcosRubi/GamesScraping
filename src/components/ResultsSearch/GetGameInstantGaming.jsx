import { useState } from "react";
import GetNotFound from "./GetNotFound";
import { AiOutlineReload } from "react-icons/ai";


function GetGameInstantGaming({ data }) {
    const [id, setId] = useState(0)

    function handleOnClick() {
        id + 1 === data[0].instantGaming.length ? setId(0) : setId(id+1)
    }

    if (data[0].instantGaming.instantGaming === "null") {
        return <GetNotFound platform={"Instant Gaming"} />;
    }
    return (
        <div className="cardGame">
            {data[0].instantGaming.length > 1 
            ? <button className="changeResult" title="Cambiar resultado" onClick={()=>{handleOnClick()}}><AiOutlineReload/></button>
            : ''
            }
            
            {data[0].instantGaming[id].discount ? <div className="cardGame--discount"><span className="discount">{data[0].instantGaming[id].discount}</span></div> : ""}

            <div className="cardGameHeader">
                <img
                    src={data[0].instantGaming[id].imgUrl}
                    alt={`Imagen juego ${data[0].instantGaming[id].name} de Instant Gaming`}
                />
            </div>
            
            <div className="cardGameContent">
                <h3>{data[0].instantGaming[id].name}</h3>
                <div className="cardGame--price">
                    <span className="price-now">{data[0].instantGaming[id].price[0].now}</span>
                </div>
                    <a href={data[0].instantGaming[id].url} target="_blank" className="btn btn-primary"><span className="fz-small">Comprar en Instant Gaming</span></a>
            </div>
        </div>
    );
}

export default GetGameInstantGaming;
