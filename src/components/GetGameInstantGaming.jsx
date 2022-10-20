import GetNotFound from "./GetNotFound";

function GetGameInstantGaming({ data }) {
    if (data[0].instantGaming.instantGaming === "null") {
        return <GetNotFound platform={"Instant Gaming"} />;
    }
    return (
        <div className="cardGame">
            {data[0].instantGaming.price.length > 1 ? <div className="cardGame--discount"><span className="discount">{data[0].instantGaming.discount}</span></div> : ""}

            <div className="cardGameHeader">
                <img
                    src={data[0].instantGaming.imgUrl}
                    alt={`Imagen juego ${data[0].instantGaming.name} de Instant Gaming`}
                />
            </div>
            
            <div className="cardGameContent">
                <h3>{data[0].instantGaming.name}</h3>
                <div className="cardGame--price">
                    <span className="price-now">€{data[0].instantGaming.price}</span>
                </div>
                    <a href={data[0].instantGaming.url} target="_blank" className="btn btn-primary"><span className="fz-small">Comprar en Instant Gaming</span></a>
                    <div className="message">El precio es en EUROS</div>
            </div>
        </div>
    );
}

export default GetGameInstantGaming;
