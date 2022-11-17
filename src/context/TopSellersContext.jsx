import { createContext, useEffect, useState } from "react";

export const TopSellersContext = createContext();

export function TopSellersContextProvider(props) {
    const [steam, setSteam] = useState(null);
    const [instantGaming, setInstantGaming] = useState(null);

    async function getSteam() {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/top-sellers-steam`);
        const data = await response.json();

        setSteam(data);
    }
    async function getInstantGaming() {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/top-sellers-instant-gaming`);
        const data = await response.json();

        setInstantGaming(data);
    }

    useEffect(() => {
        getSteam();
        getInstantGaming();
    }, []);

    return (
        <TopSellersContext.Provider
            value={{steam, instantGaming}}
        >
            {props.children}
        </TopSellersContext.Provider>
    );
}
