import React, { useContext } from "react";
import { GiGamepad } from "react-icons/gi";
import { MainContext } from "../context/MainContext";

function LogoHeader() {
    const { viewSearch, loadViewToSearch, transitionPage } = useContext(MainContext);
    return (
        <a
            href="#"
            className="logo d-flex"
            onClick={() => { if( viewSearch ){ transitionPage(); loadViewToSearch() } }}
        >
            <GiGamepad />
        </a>
    );
}

export default LogoHeader;
