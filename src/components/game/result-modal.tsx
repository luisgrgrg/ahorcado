import type { GameState } from "@/domain/game/game.types";
import { GameButton } from "@/components/ui/game-button";

export function ResultModal({ game, onPlayAgain, onChangeCategory }: { readonly game: GameState; readonly onPlayAgain: () => void; readonly onChangeCategory: () => void }) {
  if (game.status === "playing") return null;
  const won = game.status === "won";
  return (
    <div className="modal-backdrop" role="presentation">
      <div className={`dialog-card result-card${won ? "" : " loss"}`} role="dialog" aria-modal="true" aria-labelledby="result-title">
        <div className="result-burst" aria-hidden="true"><span>{won ? "★" : "!"}</span></div>
        <span className="dialog-kicker">{won ? "Ronda completada" : "Fin de la ronda"}</span>
        <h2 id="result-title">{won ? "¡Palabra descubierta!" : "¡Buen intento!"}</h2>
        <p>{won ? "Tu intuición estuvo a la altura." : "Cada intento te acerca a la próxima victoria."}</p>
        <div className="answer-chip"><small>La palabra era</small><strong>{game.entry.word}</strong></div>
        <div className="result-stats" aria-label="Resultado de la partida">
          <div><strong>{game.errors}</strong><span>errores</span></div>
          <div><strong>{game.guessedLetters.length}</strong><span>letras usadas</span></div>
          <div><strong>{Math.max(0, Math.round((new Date(game.finishedAt!).getTime() - new Date(game.startedAt).getTime()) / 1000))}s</strong><span>duración</span></div>
        </div>
        <div className="result-actions">
          <GameButton type="button" onClick={onPlayAgain}><span aria-hidden="true">↻</span> Jugar otra vez</GameButton>
          <button className="text-button" type="button" onClick={onChangeCategory}>Cambiar tema</button>
        </div>
      </div>
    </div>
  );
}
