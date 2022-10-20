import React, { useContext } from "react";
import { MainContext } from "../context/MainContext";

function NavHeader() {
    const { toggleModal} = useContext(MainContext);
    return (
        <nav>
            <ul>
                <li
                    onClick={() => {
                        toggleModal();
                    }}
                >
                    <a href="#">Web Scraping es legal?</a>
                </li>
            </ul>
        </nav>
    );
}

export default NavHeader;
