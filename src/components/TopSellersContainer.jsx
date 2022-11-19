import { useContext } from "react";
import { TopSellersContext } from "../context/TopSellersContext";
import CardGame from "./CardGame";

function TopSellersContainer() {
    const { steam, instantGaming } = useContext(TopSellersContext);
    return (
        <>
            <CardGame data={steam} title={"lo más buscado de steam"} platform={"steam"} classList={"top-sellers-steam"} />
            <CardGame data={instantGaming} title={"lo más vendidos de instant gaming"} platform={"instant gaming"} classList={"top-sellers-instant-gaming"} />
        </>
    );
}

export default TopSellersContainer;
