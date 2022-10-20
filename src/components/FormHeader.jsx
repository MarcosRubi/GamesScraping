import React, { useContext } from "react";
import { MainContext } from "../context/MainContext";
import { AiOutlineSearch } from "react-icons/ai";

function FormHeader() {
    const { setNameGame, nameGame, getGames, setShowLoading } = useContext(MainContext);
    function handleSubmit(e) {
        e.preventDefault();
        getGames();
        setShowLoading(true);
    }
    return (
        <form
            action="#"
            onSubmit={(e) => {
                handleSubmit(e);
            }}
            className="search"
        >
            <div className="d-flex align-center jc-end">
                <div className="input-group">
                    <input
                        type="text"
                        name="txtSearch"
                        id="txtSearch"
                        required="required"
                        autoFocus
                        onChange={(e) => {
                            setNameGame(e.target.value);
                        }}
                        value={nameGame === null ? "" : nameGame}
                    />
                    <label htmlFor="txtSearch">Nombre del juego</label>
                </div>
                <button type="submit" className="btn-search">
                    <AiOutlineSearch />
                </button>
            </div>
        </form>
    );
}

export default FormHeader;
