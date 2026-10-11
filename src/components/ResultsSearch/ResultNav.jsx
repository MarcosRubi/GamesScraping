import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

function ResultNav({ current, total, onChange }) {
    if (total <= 1) return null;

    return (
        <div className="changeResult">
            <button
                className="changeResult__arrow"
                title="Resultado anterior"
                aria-label="Resultado anterior"
                onClick={() => onChange((current - 1 + total) % total)}
            >
                <AiOutlineLeft />
            </button>
            <span className="changeResult__count">
                {current + 1}/{total}
            </span>
            <button
                className="changeResult__arrow"
                title="Siguiente resultado"
                aria-label="Siguiente resultado"
                onClick={() => onChange((current + 1) % total)}
            >
                <AiOutlineRight />
            </button>
        </div>
    );
}

export default ResultNav;
