import { createContext, useEffect, useState } from "react";

export const MainContext = createContext();

export function MainContextProvider(props) {
    const [body, setBody] = useState(null);
    const [viewSearch, setViewSearch] = useState(false);

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

    return (
        <MainContext.Provider
            value={{ toggleModal, transitionPage, loadViewToSearch, viewSearch, setViewSearch }}
        >
            {props.children}
        </MainContext.Provider>
    );
}