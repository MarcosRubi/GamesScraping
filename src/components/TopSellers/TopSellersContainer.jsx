import { useContext } from "react";
import { HomeContext } from "../../context/HomeContext";
import TopSellers from "./TopSellers";

function TopSellersContainer() {
    const { topSellers } = useContext(HomeContext);
    return (
        <>
            <TopSellers data={topSellers.steam} storeKey="steam" />
            <TopSellers data={topSellers.instantGaming} storeKey="instantGaming" />
            <TopSellers data={topSellers.gog} storeKey="gog" />
            <TopSellers data={topSellers.humble} storeKey="humble" />
            <TopSellers data={topSellers.fanatical} storeKey="fanatical" />
        </>
    );
}

export default TopSellersContainer;
