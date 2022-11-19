import React, { createContext, useEffect, useState } from "react";

export const IndieGamesContext = createContext();

export function IndieGamesContextProvider(props) {
    const [instantGaming, setInstantGaming] = useState(null);

    async function getInstantGaming() {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/top-indie-games-instant-gaming`
        );
        const data = await response.json();

        setInstantGaming(data);
    }

    useEffect(() => {
        getInstantGaming();
    }, []);

    return (
        <IndieGamesContext.Provider value={{instantGaming}}>
            {props.children}
        </IndieGamesContext.Provider>
    );
}
