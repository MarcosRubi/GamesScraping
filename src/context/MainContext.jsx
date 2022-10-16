import { createContext, useEffect, useState } from "react";

export const MainContext = createContext();

export function MainContextProvider(props) {

    const [body, setBody] = useState(null)

    useEffect(() => {
    setBody(document.querySelector('html'))
    }, [])
    
    function toggleModal(){
        const modal = document.getElementById('modal')
        modal.classList.contains('show') ? modal.classList.remove('show') : modal.classList.add('show')
    }
    function transitionPage(){
        body.classList.add('transition')
    }
    return (
        <MainContext.Provider value={{ toggleModal, transitionPage }}>
            {props.children}
        </MainContext.Provider>
    );
}
