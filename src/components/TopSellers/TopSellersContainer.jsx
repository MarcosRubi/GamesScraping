import { useContext } from "react";
import { TopSellersContext } from "../../context/TopSellersContext";
import TopSellers from "./TopSellers";

function TopSellersContainer() {
    const { steam, gog } = useContext(TopSellersContext);
    return (
        <>
            <TopSellers data={steam} platform={"steam"} />
            <TopSellers data={gog} platform={"gog"} />
        </>
    );
}

export default TopSellersContainer;
