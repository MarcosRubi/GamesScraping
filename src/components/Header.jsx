import { GiGamepad } from "react-icons/gi";
import { AiOutlineSearch } from "react-icons/ai";
import { useContext, useEffect, useRef, useState } from "react";
import { MainContext } from "../context/MainContext";

function Header() {
    const { toggleModal, viewSearch, loadViewToSearch, transitionPage } = useContext(MainContext);

    const headerRef = useRef(null);
    const [header, setHeader] = useState(null);
    const [entryObserver, setEntryObserver] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setEntryObserver(entry.isIntersecting);
                if (entryObserver) {
                    setHeader("visible");
                }
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.1,
            }
        );
        observer.observe(headerRef.current);
    }, [entryObserver]);


    return (
        <header ref={headerRef}>
            <div
                className={`d-flex align-center jc-between container ${header}`}
            >
                <a href="#" className="logo d-flex" onClick={()=>{
                    if(viewSearch){
                        transitionPage();loadViewToSearch()
                    } }}>
                    <GiGamepad />
                </a>
                {viewSearch ? (
                    <form action="#" onSubmit={(e)=>{e.preventDefault();}} className="search">
                        <div className="d-flex align-center jc-end">
                        <div className="input-group">
                            <input type="text" name="txtSearch" id="txtSearch" required="required" />
                            <label htmlFor="txtSearch">Nombre del juego</label>
                        </div>
                        <button type="submit" className="btn-search"><AiOutlineSearch/></button>
                        </div>
                    </form>
                ) : (
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
                )}
            </div>
        </header>
    );
}

export default Header;
