import { useContext } from "react";
import { NewReleasesContext } from "../context/NewReleasesContext";
import CardGame from "./CardGame";

function NewReleasesContainer() {
    const { steam } = useContext(NewReleasesContext);
    return (
        <>
            <CardGame data={steam} title={"Novedades de steam"} platform={"steam"} classList={"new-releases-steam"}/>
        </>
    );
}

export default NewReleasesContainer;
