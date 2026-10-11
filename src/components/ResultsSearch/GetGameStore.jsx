import { useState } from "react";
import GetNotFound from "./GetNotFound";
import ResultNav from "./ResultNav";
import GameCard, { STORES } from "../GameCard";

// Tarjeta de resultado de búsqueda para una tienda: maneja el índice del
// resultado visible (n/m) y el caso "no encontrado".
function GetGameStore({ data, storeKey, highlight }) {
    const [id, setId] = useState(0);
    const games = data[0]?.[storeKey];

    if (!Array.isArray(games) || games.length === 0) {
        return <GetNotFound platform={STORES[storeKey].label} />;
    }

    return (
        <GameCard game={games[id]} store={storeKey} highlight={highlight}>
            <ResultNav current={id} total={games.length} onChange={setId} />
        </GameCard>
    );
}

export default GetGameStore;
