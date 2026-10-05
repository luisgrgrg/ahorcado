import {
  ALPHABET,
  MAX_ERRORS,
  type GameCategory,
  type GameState,
  type GuessResult,
  type WordEntry,
} from "./game.types";

export function normalizeLetter(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

export class GameService {
  createGame(entry: WordEntry, category: GameCategory, now = new Date()): GameState {
    return {
      id: crypto.randomUUID(),
      category,
      entry,
      guessedLetters: [],
      errors: 0,
      status: "playing",
      startedAt: now.toISOString(),
      finishedAt: null,
    };
  }

  guess(current: GameState, input: string, now = new Date()): GuessResult {
    const letter = normalizeLetter(input);
    if (
      current.status !== "playing" ||
      !ALPHABET.includes(letter) ||
      current.guessedLetters.includes(letter)
    ) {
      return { state: current, accepted: false, correct: null };
    }

    const correct = normalizeLetter(current.entry.word).includes(letter);
    const guessedLetters = [...current.guessedLetters, letter];
    const errors = current.errors + (correct ? 0 : 1);
    const completed = [...normalizeLetter(current.entry.word)].every(
      (character) => !ALPHABET.includes(character) || guessedLetters.includes(character),
    );
    const status = completed ? "won" : errors >= MAX_ERRORS ? "lost" : "playing";

    return {
      accepted: true,
      correct,
      state: {
        ...current,
        guessedLetters,
        errors,
        status,
        finishedAt: status === "playing" ? null : now.toISOString(),
      },
    };
  }

  isRevealed(character: string, game: GameState): boolean {
    const normalized = normalizeLetter(character);
    return (
      !ALPHABET.includes(normalized) ||
      game.guessedLetters.includes(normalized) ||
      game.status !== "playing"
    );
  }
}
