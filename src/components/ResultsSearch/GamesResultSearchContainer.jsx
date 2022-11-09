import { useContext, useEffect, useRef, useState } from "react";
import { MainContext } from "../../context/MainContext";
import GetGameGog from "./GetGameGog";
import GetGameInstantGaming from "./GetGameInstantGaming";
import GetGameSteam from "./GetGameSteam";
import ShowLoading from '../ShowLoading'

function GamesResultSearchContainer() {
    const { gamesResult, showLoading } = useContext(MainContext);
    const resultsRef = useRef(null);
    const [results, setResults] = useState(null);
    const [entryObserver, setEntryObserver] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setEntryObserver(entry.isIntersecting);
                if (entryObserver) {
                    setResults("visible");
                }
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.1,
            }
        );
        observer.observe(resultsRef.current);
    }, [entryObserver]);

    if (showLoading) {
        return<section className={`results container ${results}`} ref={resultsRef}><ShowLoading/></section>
    }
    if (gamesResult.length === 0) {
        return <section className={` container ${results}`} ref={resultsRef}></section>;
    }

    
    return (
        <>
            <section className={`container`} ref={resultsRef}>
                <h2>Resultados de búsqueda </h2>
                <div className={`results ${results}`}>
                    <GetGameSteam data={gamesResult.filter((element) => element.steam)}/>
                    <GetGameGog data={gamesResult.filter((element) => element.gog)}/>
                    <GetGameInstantGaming data={gamesResult.filter((element) => element.instantGaming)}/>
                </div>
            </section>
        </>
    );
}
export default GamesResultSearchContainer;
