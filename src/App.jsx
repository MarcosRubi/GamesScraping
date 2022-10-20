import { useContext } from "react";
import Banner from "./components/Banner";
import GamesResultSearchContainer from "./components/GamesResultSearchContainer";
import Header from "./components/Header";
import ModalLegal from "./components/ModalLegal";
import { MainContext } from "./context/MainContext";

function App() {
    const {viewSearch} = useContext(MainContext)
    return (
        <main>
            <Header/>
            {viewSearch ? <GamesResultSearchContainer/> : <Banner/> }
            <ModalLegal/>
        </main>
    );
}

export default App;
