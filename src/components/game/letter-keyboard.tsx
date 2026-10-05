import { ALPHABET, type GameState } from "@/domain/game/game.types";
import { normalizeLetter } from "@/domain/game/game.service";

export function LetterKeyboard({ game, onGuess }: { readonly game: GameState; readonly onGuess: (letter: string) => void }) {
  const normalizedWord = normalizeLetter(game.entry.word);
  return (
    <div className="keyboard" aria-label="Teclado de letras">
      {ALPHABET.map((letter) => {
        const used = game.guessedLetters.includes(letter);
        const correct = normalizedWord.includes(letter);
        const stateClass = used ? (correct ? " correct" : " incorrect") : "";
        return (
          <button
            type="button"
            className={`letter-button${stateClass}`}
            disabled={used || game.status !== "playing"}
            aria-label={`Letra ${letter}${used ? `, ${correct ? "correcta" : "incorrecta"}` : ""}`}
            onClick={() => onGuess(letter)}
            key={letter}
          >
            <span>{letter}</span><span className="key-state" aria-hidden="true">{used ? (correct ? "✓" : "×") : ""}</span>
          </button>
        );
      })}
    </div>
  );
}
