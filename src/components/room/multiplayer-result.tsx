import { GameButton } from "@/components/ui/game-button";
import type { RoomSnapshot } from "@/domain/room/room.types";

export function MultiplayerResult({ room, isHost, busy, onRestart }: { readonly room: RoomSnapshot; readonly isHost: boolean; readonly busy: boolean; readonly onRestart: () => void }) {
  const game = room.game;
  if (!game || game.status === "playing") return null;
  const won = game.status === "won";
  return (
    <div className="modal-backdrop" role="presentation">
      <section className={`dialog-card result-card ${won ? "" : "loss"}`} role="dialog" aria-modal="true" aria-labelledby="multiplayer-result-title">
        <div className="result-burst" aria-hidden="true">{won ? "★" : "!"}</div>
        <span className="dialog-kicker">{won ? "¡Misión cumplida!" : "Fin de la partida"}</span>
        <h2 id="multiplayer-result-title">{won ? "¡Palabra completada!" : "La palabra se escapó"}</h2>
        <p>{won ? "La sala ganó trabajando en equipo." : "Buen intento. Pueden volver a jugar juntos."}</p>
        <div className="answer-chip"><small>La palabra era</small><strong>{game.revealedWord}</strong></div>
        <div className="result-stats multiplayer-stats"><div><strong>{game.errors}</strong><span>Errores</span></div><div><strong>{game.guessedLetters.length}</strong><span>Letras usadas</span></div><div><strong>{room.players.length}</strong><span>Jugadores</span></div></div>
        <div className="result-players"><strong>Equipo</strong><span>{room.players.map((player) => player.name).join(" · ")}</span></div>
        <div className="result-actions">
          {isHost ? <GameButton type="button" disabled={busy} onClick={onRestart}>{busy ? "Preparando…" : "Jugar otra vez"}</GameButton> : <div className="host-wait-message"><span aria-hidden="true">⌛</span><span><strong>Partida terminada</strong><small>Esperando al anfitrión…</small></span></div>}
        </div>
      </section>
    </div>
  );
}
