import { useEffect, useRef, useState } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

const CARD_WIDTH = 360;
const CARD_GAP = 48;
// Movimiento mínimo (px) para considerar el gesto un arrastre y no un click.
const DRAG_THRESHOLD = 8;

// Fila horizontal de tarjetas con flechas y arrastre (mouse o touch).
// El desplazamiento es por transform en vez de scroll nativo: el viewport
// solo recorta en el eje X (overflow-x: clip, overflow-y: visible), así el
// halo blur de las cards SOBRESALE libremente por arriba y abajo de la caja,
// igual que en las grillas.
function Carousel({ children, visibleClass }) {
    const viewportRef = useRef(null);
    const trackRef = useRef(null);
    const [offset, setOffset] = useState(0);
    const [maxOffset, setMaxOffset] = useState(0);
    const [dragging, setDragging] = useState(false);
    // Estado del arrastre en curso: no es state de React porque cambia en
    // cada pointermove y no debe re-renderizar por sí mismo.
    const dragRef = useRef(null);

    useEffect(() => {
        function measure() {
            const viewport = viewportRef.current;
            const track = trackRef.current;
            if (!viewport || !track) return;
            setMaxOffset(Math.max(0, track.scrollWidth - viewport.clientWidth));
        }
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [children]);

    // Si el contenido se achicó (resize/menos cards), no quedar pasados.
    useEffect(() => {
        setOffset((current) => Math.min(current, maxOffset));
    }, [maxOffset]);

    // Los listeners de move/up van en window: el arrastre sigue aunque el
    // puntero salga del viewport, sin capturar el pointer (capturarlo
    // rompería los clicks normales sobre los links de las cards).
    useEffect(() => {
        if (!dragging) return;
        function onMove(e) {
            const drag = dragRef.current;
            if (!drag) return;
            const dx = e.clientX - drag.startX;
            if (Math.abs(dx) > DRAG_THRESHOLD) drag.moved = true;
            setOffset(Math.max(0, Math.min(maxOffset, drag.startOffset - dx)));
        }
        function onUp() {
            setDragging(false);
            // Si no llegó a moverse, el click que sigue es legítimo.
            if (dragRef.current && !dragRef.current.moved) dragRef.current = null;
        }
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
        };
    }, [dragging, maxOffset]);

    function startDrag(e) {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        dragRef.current = { startX: e.clientX, startOffset: offset, moved: false };
        setDragging(true);
    }

    // Tras un arrastre real, el click que dispara el navegador al soltar no
    // debe abrir el link de la card sobre la que se soltó.
    function suppressClickAfterDrag(e) {
        if (dragRef.current?.moved) {
            e.preventDefault();
            e.stopPropagation();
        }
        dragRef.current = null;
    }

    // Avance por click: tantas tarjetas como entren visibles en el viewport,
    // mínimo 1 (en móvil entra una sola y se pasa de una en una). El ancho
    // de tarjeta se mide del DOM porque cambia por media query.
    function stepSize() {
        const viewport = viewportRef.current;
        const card = trackRef.current?.children?.[0];
        const perCard = card
            ? card.getBoundingClientRect().width + CARD_GAP
            : CARD_WIDTH + CARD_GAP;
        if (!viewport) return perCard;
        return Math.max(1, Math.floor(viewport.clientWidth / perCard)) * perCard;
    }

    function move(direction) {
        setOffset((current) =>
            Math.max(0, Math.min(maxOffset, current + direction * stepSize()))
        );
    }

    // Desvanecer el borde solo del lado donde quedan cards ocultas, así el
    // recorte no se ve como un corte seco. Se hace con overlays de degradado
    // (no mask) para no cortar el halo blur que sobresale en vertical.
    const fadeLeft = offset > 0;
    const fadeRight = offset < maxOffset - 1;

    return (
        <div
            className={`carousel-wrapper ${fadeLeft ? "carousel-wrapper--fade-left" : ""} ${fadeRight ? "carousel-wrapper--fade-right" : ""}`}
        >
            <button
                className="carousel-arrow carousel-arrow--left"
                onClick={() => move(-1)}
                disabled={offset <= 0}
                aria-label="Ver anteriores"
            >
                <AiOutlineLeft />
            </button>
            <div
                className={`results-viewport ${dragging ? "results-viewport--dragging" : ""}`}
                ref={viewportRef}
                onPointerDown={startDrag}
                onClickCapture={suppressClickAfterDrag}
                onDragStart={(e) => e.preventDefault()}
            >
                <div
                    className={`results ${visibleClass || ""} ${dragging ? "results--dragging" : ""}`}
                    ref={trackRef}
                    style={{ transform: `translateX(-${offset}px)` }}
                >
                    {children}
                </div>
            </div>
            <button
                className="carousel-arrow carousel-arrow--right"
                onClick={() => move(1)}
                disabled={offset >= maxOffset - 1}
                aria-label="Ver más"
            >
                <AiOutlineRight />
            </button>
        </div>
    );
}

export default Carousel;
