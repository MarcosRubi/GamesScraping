import { useContext } from "react";
import { TopSellersContext } from "../../context/TopSellersContext";
import TopSellers from "./TopSellers";

function TopSellersContainer() {
    const { steam, gog, instantGaming } = useContext(TopSellersContext);
    return (
        <>
            <TopSellers data={steam} platform={"steam"} />
            <TopSellers data={instantGaming} platform={"instant gaming"} />
            {/* <TopSellers data={gog} platform={"gog"} /> */}
        </>
    );
}

export default TopSellersContainer;
