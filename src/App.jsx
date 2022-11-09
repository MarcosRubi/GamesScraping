import { useContext } from "react";
import Banner from "./components/Banner";
import GamesResultSearchContainer from "./components/ResultsSearch/GamesResultSearchContainer";
import Header from "./components/Header";
import ModalLegal from "./components/ModalLegal";
import { MainContext } from "./context/MainContext";
import TopSellersContainer from "./components/TopSellers/TopSellersContainer";

function App() {
    const {viewSearch} = useContext(MainContext)
    return (
        <>
            <Header/>
            {viewSearch ? <GamesResultSearchContainer/> : <Banner/> }
            {viewSearch ? <TopSellersContainer/> : '' }
            <ModalLegal/>
        </>
    );
}

export default App;
