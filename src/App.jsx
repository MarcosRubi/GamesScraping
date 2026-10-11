import { useContext } from "react";
import Header from "./components/Header";
import GamesResultSearchContainer from "./components/ResultsSearch/GamesResultSearchContainer";
import HomeSectionsContainer from "./components/Home/HomeSectionsContainer";
import TopSellersContainer from "./components/TopSellers/TopSellersContainer";
import FeaturedCarousel from "./components/FeaturedCarousel/FeaturedCarousel";
import ModalLegal from "./components/ModalLegal";
import { MainContext } from "./context/MainContext";
import { HomeContextProvider } from "./context/HomeContext";

function App() {
    const { gamesResult, showLoading } = useContext(MainContext);
    const hasSearched = showLoading || gamesResult.length > 0;

    return (
        <HomeContextProvider>
            <Header />
            <FeaturedCarousel />
            {hasSearched ? <GamesResultSearchContainer /> : ""}
            <HomeSectionsContainer />
            <TopSellersContainer />
            <ModalLegal />
        </HomeContextProvider>
    );
}

export default App;