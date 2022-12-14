import { createContext, useEffect, useState } from "react";

export const MainContext = createContext();

export function MainContextProvider(props) {
    const [body, setBody] = useState(null);
    const [viewSearch, setViewSearch] = useState(false);
    const [gamesResult, setGameResult] = useState([]);
    const [nameGame, setNameGame] = useState(null);
    const [showLoading, setShowLoading] = useState(false)


    useEffect(() => {
        setBody(document.querySelector("html"));
    }, []);

    function toggleModal() {
        const modal = document.getElementById("modal");
        modal.classList.contains("show") ? modal.classList.remove("show") : modal.classList.add("show");
    }
    function transitionPage() {
        body.classList.toggle("transition");
    }

    function loadViewToSearch() {
        setTimeout(() => {
            viewSearch ? setViewSearch(false) : setViewSearch(true);
            transitionPage()
        }, 1000);
    }
    async function getGames() {
        let result = []
        const responseSteam = await fetch(`${import.meta.env.VITE_API_URL}/steam/${nameGame}`);
        const dataSteam = await responseSteam.json();

        const responseGog = await fetch(`${import.meta.env.VITE_API_URL}/gog/${nameGame}`);
        const dataGog = await responseGog.json();
        
        const responseInstantGaming = await fetch(`${import.meta.env.VITE_API_URL}/instant-gaming/${nameGame}`);
        const dataInstantGaming = await responseInstantGaming.json();

        result.push({steam:dataSteam})
        result.push({gog:dataGog})
        result.push({instantGaming:dataInstantGaming})

        setGameResult(result)
        setShowLoading(false)
    }

    return (
        <MainContext.Provider
            value={{ toggleModal, transitionPage, loadViewToSearch, viewSearch, setViewSearch, getGames, setNameGame, nameGame, gamesResult, setShowLoading, showLoading }}
        >
            {props.children}
        </MainContext.Provider>
    );
}
