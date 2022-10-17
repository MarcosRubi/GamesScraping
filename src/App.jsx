import { useContext } from "react";
import Banner from "./components/Banner";
import Header from "./components/Header";
import ModalLegal from "./components/ModalLegal";
import { MainContext } from "./context/MainContext";

function App() {
    const {viewSearch} = useContext(MainContext)
    return (
        <main>
            <Header/>
            {viewSearch ? '' : <Banner/> }
            <ModalLegal/>
        </main>
    );
}

export default App;
