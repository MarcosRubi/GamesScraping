import React, { createContext, useEffect, useState } from "react";

export const TopOffersContext = createContext();

export function TopOffersContextProvider(props) {
    const [steam, setSteam] = useState(null);
    const [instantGaming, setInstantGaming] = useState(null);

    async function getSteam() {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/top-offers-steam`);
        const data = await response.json();

        setSteam(data);
    }
    async function getInstantGaming() {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/top-offers-instant-gaming`);
        const data = await response.json();

        setInstantGaming(data);
    }

    useEffect(() => {
        getSteam();
        getInstantGaming();
    }, []);
    return (
        <TopOffersContext.Provider value={{steam, instantGaming}}>{props.children}</TopOffersContext.Provider>
    );
}
