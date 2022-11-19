import React, { createContext, useEffect, useState } from "react";

export const NewReleasesContext = createContext();

export function NewReleasesContextProvider(props) {
    const [steam, setSteam] = useState(null);

    async function getSteam() {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/new-releases-steam`);
        const data = await response.json();

        setSteam(data);
    }

    useEffect(() => {
        getSteam();
    }, []);
    return (
        <NewReleasesContext.Provider value={{steam}}>{props.children}</NewReleasesContext.Provider>
    );
}
