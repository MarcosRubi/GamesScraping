import { useContext, useEffect, useRef, useState } from "react";
import { MainContext } from "../context/MainContext";
import FormHeader from "./FormHeader";
import NavHeader from "./NavHeader";
import LogoHeader from "./LogoHeader";

function Header() {
    const { viewSearch} = useContext(MainContext);
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
            <div className={`d-flex align-center jc-between container flex-wrap ${header}`}>
                <LogoHeader/>
                {viewSearch ? <FormHeader /> : <NavHeader/>}
            </div>
        </header>
    );
}

export default Header;
