import { useEffect, useRef, useState } from "react";

function ShowLoading() {
    const loadingRef = useRef(null);
    const [loading, setLoading] = useState(null);
    const [entryObserver, setEntryObserver] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setEntryObserver(entry.isIntersecting);
                if (entryObserver) {
                    setLoading("visible");
                }
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.1,
            }
        );
        observer.observe(loadingRef.current);
    }, [entryObserver]);
    return <div className={`loading ${loading}`} ref={loadingRef}><span></span><span></span></div>;
}

export default ShowLoading;
