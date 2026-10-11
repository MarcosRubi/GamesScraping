import { AiOutlineInfoCircle } from "react-icons/ai";

// Pill informativa: la etiqueta corta es siempre visible (clave en móvil,
// donde no hay hover para descubrir el ícono); el texto completo aparece al
// pasar el mouse o tocarla (focus), como tarjeta flotante anclada a la pill.
// `text` puede ser JSX (ej. precio original en negrita).
function InfoNote({ text, label }) {
    return (
        <button type="button" className="info-note">
            <AiOutlineInfoCircle />
            {label ? <span className="info-note__label">{label}</span> : null}
            <span className="info-note__text" role="tooltip">{text}</span>
        </button>
    );
}

export default InfoNote;
