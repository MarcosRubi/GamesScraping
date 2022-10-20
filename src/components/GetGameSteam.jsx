import GetNotFound from "./GetNotFound";

function GetGameSteam({ data }) {
    if (data[0].steam.steam === "null") {
        return <GetNotFound platform={"Steam"} />;
    }
    return (
        <div className="cardGame">
            {data[0].steam.price.length > 1 ? <div className="cardGame--discount"><span className="discount">{data[0].steam.discount}</span></div> : ""}

            <div className="cardGameHeader">
                <img
                    src={data[0].steam.imgUrl}
                    alt={`Imagen juego ${data[0].steam.name} de Steam`}
                />
            </div>
            
            <div className="cardGameContent">
                <h3>{data[0].steam.name}</h3>
                <div className="cardGame--price">
                    {data[0].steam.price.length > 1 ? <span className="price-old">${data[0].steam.price[0]}</span>  : ""}
                    {data[0].steam.price.length > 1 ? <span className="price-now">${data[0].steam.price[1]}</span> : ""}
                    {data[0].steam.price.length === 1 ? <span className="price-now">${data[0].steam.price}</span> : ""}
                </div>
                    <a href={data[0].steam.url} target="_blank" className="btn btn-primary"><span>Comprar en steam</span></a>
            </div>
        </div>
    );
}

export default GetGameSteam;
