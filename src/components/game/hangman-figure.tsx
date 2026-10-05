import { MAX_ERRORS } from "@/domain/game/game.types";

const CAPTIONS = [
  ["¡Todo bien!", "Aún no hay errores"], ["Primer tropiezo", "Te quedan 5 intentos"],
  ["Sigue pensando", "Te quedan 4 intentos"], ["Mitad del camino", "Te quedan 3 intentos"],
  ["¡Tú puedes!", "Te quedan 2 intentos"], ["Última oportunidad", "Respira y elige bien"],
  ["Fin de la ronda", "La palabra se escapó"],
] as const;

export function HangmanFigure({ errors }: { readonly errors: number }) {
  const caption = CAPTIONS[errors] ?? CAPTIONS[MAX_ERRORS];
  return (
    <>
      <div className="figure-stage" role="img" aria-label={errors === 0 ? "Ahorcado sin errores" : `Ahorcado con ${errors} de ${MAX_ERRORS} partes dibujadas`}>
        <svg className="hangman" viewBox="0 0 280 230" aria-hidden="true">
          <path className="gallows" d="M36 210h172M67 210V24h119M186 24v30" />
          <path className="gallows-brace" d="M68 62l38-38" />
          <g className="person">
            <circle className={`body-part${errors > 0 ? " visible" : ""}`} cx="186" cy="76" r="22" />
            <path className={`body-part${errors > 1 ? " visible" : ""}`} d="M186 98v61" />
            <path className={`body-part${errors > 2 ? " visible" : ""}`} d="M186 116l-35 24" />
            <path className={`body-part${errors > 3 ? " visible" : ""}`} d="M186 116l35 24" />
            <path className={`body-part${errors > 4 ? " visible" : ""}`} d="M186 159l-29 36" />
            <path className={`body-part${errors > 5 ? " visible" : ""}`} d="M186 159l29 36" />
          </g>
        </svg>
        <div className="figure-caption"><strong>{caption[0]}</strong><span>{caption[1]}</span></div>
      </div>
      <div className="progress-wrap">
        <div className="progress-label"><span>Errores</span><strong>{errors} de {MAX_ERRORS}</strong></div>
        <div className="progress-track" role="progressbar" aria-label="Errores cometidos" aria-valuemin={0} aria-valuemax={MAX_ERRORS} aria-valuenow={errors}>
          <span style={{ width: `${(errors / MAX_ERRORS) * 100}%` }} />
        </div>
      </div>
    </>
  );
}
