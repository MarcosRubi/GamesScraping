import { useState } from "react";

// Ratio a partir del cual una imagen se considera "banner ancho" (ej. las
// capsules de Steam, 231×87 ≈ 2.66): con object-fit: cover se les corta el
// texto a los lados, así que pasan a contain sobre el fondo blur.
const WIDE_RATIO = 2;

// Fondo desenfocado (mismo src, escalado y borroso) + artwork encima.
// El `__halo` es la capa que extiende el artwork blur más allá de los
// bordes de la tarjeta, dando el efecto tipo YouTube.
function GameCardImage({ src, alt }) {
    const [wide, setWide] = useState(false);

    function handleLoad(e) {
        const img = e.target;
        if (img.naturalWidth > 0 && img.naturalWidth / img.naturalHeight >= WIDE_RATIO) {
            setWide(true);
        }
    }

    return (
        <>
            <img className="cardGameHeader__halo" src={src} alt="" aria-hidden="true" />
            <div className="cardGameHeader">
                <img className="cardGameHeader__bg" src={src} alt="" aria-hidden="true" />
                <img
                    className={`cardGameHeader__fg ${wide ? "cardGameHeader__fg--contain" : ""}`}
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                />
            </div>
        </>
    );
}

export default GameCardImage;
