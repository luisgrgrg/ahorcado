import { ALPHABET } from "@/domain/game/game.types";
import { RoomService } from "@/domain/room/room.service";
import type { RoomGame } from "@/domain/room/room.types";

const roomService = new RoomService();

export function MultiplayerKeyboard({ game, enabled, busy, onGuess }: { readonly game: RoomGame; readonly enabled: boolean; readonly busy: boolean; readonly onGuess: (letter: string) => void }) {
  return (
    <div className="keyboard" aria-label="Teclado de letras" aria-disabled={!enabled}>
      {ALPHABET.map((letter) => {
        const state = roomService.getLetterState(game, letter);
        const used = state !== "available";
        return (
          <button type="button" className={`letter-button${used ? ` ${state}` : ""}`} disabled={!enabled || busy || used} aria-label={`Letra ${letter}${used ? `, ${state === "correct" ? "correcta" : "incorrecta"}` : ""}`} onClick={() => onGuess(letter)} key={letter}>
            <span>{letter}</span><span className="key-state" aria-hidden="true">{used ? state === "correct" ? "✓" : "×" : ""}</span>
          </button>
        );
      })}
    </div>
  );
}

