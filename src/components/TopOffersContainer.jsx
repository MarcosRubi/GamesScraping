import { useContext } from "react";
import { TopOffersContext } from "../context/TopOffersContext";
import CardGame from "./CardGame";

function TopOffersContainer() {
    const { steam, instantGaming } = useContext(TopOffersContext);
    return (
        <>
            <CardGame data={steam} title={"las mejores ofertas de steam"} platform={"steam"} classList={"top-offers-steam"}/>
            <CardGame data={instantGaming} title={"las mejores ofertas de instant gaming"} platform={"instant gaming"} classList={"top-offers-instant-gaming"}/>
        </>
    );
}

export default TopOffersContainer;
