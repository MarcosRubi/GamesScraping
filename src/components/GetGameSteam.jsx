import { useState } from "react";
import GetNotFound from "./GetNotFound";
import { AiOutlineReload } from "react-icons/ai";

function GetGameSteam({ data }) {
    const [id, setId] = useState(0)

    function handleOnClick() {
        id + 1 === data[0].steam.length ? setId(0) : setId(id+1)
    }

    if (data[0].steam.steam === "null") {
        return <GetNotFound platform={"Steam"} />;
    }

    return (
        <div className="cardGame">
            {data[0].steam.length > 1 
            ? <button className="changeResult" title="Cambiar resultado" onClick={()=>{handleOnClick()}}><AiOutlineReload/></button>
            : ''
            }
            {data[0].steam[id].discount 
                ? <div className="cardGame--discount">
                    <span className="discount">{data[0].steam[id].discount}</span>
                    </div> 
                : ""
            }
            <div className="cardGameHeader">
                <img src={data[0].steam[id].imgUrl} alt={`Imagen juego ${data[0].steam[id].name} de Steam`} />
            </div>
            
            <div className="cardGameContent">
                <h3>{data[0].steam[id].name}</h3>
                <div className="cardGame--price">
                    {data[0].steam[id].discount ? <span className="price-old">{data[0].steam[id].price[1].old}</span>  : ""}
                    <span className="price-now">{data[0].steam[id].price[0].now}</span>
                </div>
                    <a href={data[0].steam[id].url} target="_blank" className="btn btn-primary"><span>Comprar en steam</span></a>
            </div>
        </div>
    );
}

export default GetGameSteam;
