import { useContext } from "react";
import { MainContext } from "./context/MainContext";

import Header from "./components/Header";
import Banner from "./components/Banner";
import ModalLegal from "./components/ModalLegal";

import TopSellersContainer from "./components/TopSellersContainer";
import TopOffersContainer from "./components/TopOffersContainer";
import GamesResultSearchContainer from "./components/ResultsSearch/GamesResultSearchContainer";

import { TopSellersContextProvider } from "./context/TopSellersContext";
import { TopOffersContextProvider } from "./context/TopOffersContext";

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
            <ModalLegal />
        </>
    );
}

export default App;
