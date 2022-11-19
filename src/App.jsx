import { useContext } from "react";
import { MainContext } from "./context/MainContext";

import Header from "./components/Header";
import Banner from "./components/Banner";
import ModalLegal from "./components/ModalLegal";

import GamesResultSearchContainer from "./components/ResultsSearch/GamesResultSearchContainer";
import TopSellersContainer from "./components/TopSellersContainer";
import TopOffersContainer from "./components/TopOffersContainer";
import NewReleasesContainer from "./components/NewReleasesContainer";
import IndieGamesContainer from "./components/IndieGamesContainer";

import { TopSellersContextProvider } from "./context/TopSellersContext";
import { TopOffersContextProvider } from "./context/TopOffersContext";
import { NewReleasesContextProvider } from "./context/NewReleasesContext";
import { IndieGamesContextProvider } from "./context/IndieGamesContext";

function App() {
    const { viewSearch } = useContext(MainContext);
    return (
        <>
            <Header />
            {viewSearch ? <GamesResultSearchContainer /> : <Banner />}
            <TopSellersContextProvider>
                {viewSearch ? <TopSellersContainer /> : ""}
            </TopSellersContextProvider>
            <TopOffersContextProvider>
                {viewSearch ? <TopOffersContainer/> : ""}
            </TopOffersContextProvider>
            <NewReleasesContextProvider>
                {viewSearch ? <NewReleasesContainer/> : ""}
            </NewReleasesContextProvider>
            <IndieGamesContextProvider>
                {viewSearch ? <IndieGamesContainer/> : ""}
            </IndieGamesContextProvider>
            <ModalLegal />
        </>
    );
}

export default App;
