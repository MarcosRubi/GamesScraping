import React, { useContext } from "react";
import { IndieGamesContext } from "../context/IndieGamesContext";
import CardGame from "./CardGame";

function IndieGamesContainer() {
    const { instantGaming } = useContext(IndieGamesContext);
    return (
        <CardGame
            data={instantGaming}
            title={"los mejores juegos indie de instant gaming"}
            platform={"instant gaming"}
            classList={"top-indie-games-instant-gaming"}
        />
    );
}

export default IndieGamesContainer;
