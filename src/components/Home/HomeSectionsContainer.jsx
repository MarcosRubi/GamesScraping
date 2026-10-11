import { useContext } from "react";
import { HomeContext } from "../../context/HomeContext";
import HomeSection from "./HomeSection";

function HomeSectionsContainer() {
    const { topOffers, newReleases, topSellersAggregated } = useContext(HomeContext);

    return (
        <>
            <HomeSection
                title="Mejores ofertas"
                games={topOffers}
                loadingMessage="Buscando las mejores ofertas..."
            />
            <HomeSection
                title="Nuevos lanzamientos"
                games={newReleases}
                loadingMessage="Buscando los nuevos lanzamientos..."
            />
            <HomeSection
                title="Más vendidos"
                games={topSellersAggregated}
                loadingMessage="Buscando los más vendidos..."
            />
        </>
    );
}

export default HomeSectionsContainer;