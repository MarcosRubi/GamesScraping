import { AiOutlineFileSearch } from "react-icons/ai";

function GetNotFound({ platform }) {
    return (
        <div className="cardGame cardGame--empty">
            <AiOutlineFileSearch className="cardGame--empty__icon" />
            <h3>No disponible</h3>
            <p>
                {platform} no vende este juego
            </p>
        </div>
    );
}

export default GetNotFound;