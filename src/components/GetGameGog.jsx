import GetNotFound from "./GetNotFound";

function GetGameGog({ data }) {
    if (data[0].gog.gog === "null") {
        return <GetNotFound platform={"Gog"} />;
    }
    return (
        <div className="cardGame">
            {data[0].gog.price.length > 1 ? <div className="cardGame--discount"><span className="discount">{data[0].gog.discount}</span></div> : ""}

            <div className="cardGameHeader">
                <img
                    src={data[0].gog.imgUrl}
                    alt={`Imagen juego ${data[0].gog.name} de gog`}
                />
            </div>
            
            <div className="cardGameContent">
                <h3>{data[0].gog.name}</h3>
                <div className="cardGame--price">
                    {data[0].gog.price.length > 1 ? <span className="price-old">${data[0].gog.price[0]}</span>  : ""}
                    {data[0].gog.price.length > 1 ? <span className="price-now">${data[0].gog.price[1]}</span> : ""}
                    {data[0].gog.price.length === 1 ? <span className="price-now">${data[0].gog.price}</span> : ""}
                </div>
                    <a href={data[0].gog.url} target="_blank" className="btn btn-primary"><span>Comprar en Gog</span></a>
                    <div className="message">El precio puede variar dependiendo de la región, ingrese a la web para verificar el precio que se muestra.</div>
            </div>
        </div>
    );
}

export default GetGameGog;
