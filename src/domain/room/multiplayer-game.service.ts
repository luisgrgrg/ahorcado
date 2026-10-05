import { MAX_ERRORS } from "@/domain/game/game.types";

export interface AuthoritativeGameState {
  readonly secretWord: string;
  readonly maskedWord: string;
  readonly guessedLetters: readonly string[];
  readonly incorrectLetters: readonly string[];
  readonly errors: number;
  readonly currentPlayerId: string;
  readonly status: "playing" | "won" | "lost";
}

export interface AuthoritativeGuessResult {
  readonly accepted: boolean;
  readonly state: AuthoritativeGameState;
}

export class MultiplayerGameService {
  createGame(secretWord: string, playerIds: readonly string[]): AuthoritativeGameState {
    if (!playerIds.length) throw new Error("ROOM_NOT_READY");
    const normalized = secretWord.trim().toUpperCase();
    return {
      secretWord: normalized,
      maskedWord: normalized.replace(/[A-ZÑ]/g, "_"),
      guessedLetters: [],
      incorrectLetters: [],
      errors: 0,
      currentPlayerId: playerIds[0],
      status: "playing",
    };
  }

  guessLetter(state: AuthoritativeGameState, letter: string, playerIds: readonly string[]): AuthoritativeGuessResult {
    const normalized = letter.trim().toUpperCase();
    if (state.status !== "playing" || !/^[A-ZÑ]$/.test(normalized) || state.guessedLetters.includes(normalized)) {
      return { accepted: false, state };
    }

    const guessedLetters = [...state.guessedLetters, normalized];
    const correct = state.secretWord.includes(normalized);
    const incorrectLetters = correct ? state.incorrectLetters : [...state.incorrectLetters, normalized];
    const errors = state.errors + (correct ? 0 : 1);
    const maskedWord = [...state.secretWord]
      .map((character) => guessedLetters.includes(character) ? character : character === " " ? " " : "_")
      .join("");
    const status = !maskedWord.includes("_") ? "won" : errors >= MAX_ERRORS ? "lost" : "playing";
    const currentIndex = playerIds.indexOf(state.currentPlayerId);
    const currentPlayerId = playerIds.length
      ? playerIds[(currentIndex + 1 + playerIds.length) % playerIds.length]
      : state.currentPlayerId;

    return {
      accepted: true,
      state: { ...state, maskedWord, guessedLetters, incorrectLetters, errors, currentPlayerId, status },
    };
  }

  restart(secretWord: string, playerIds: readonly string[]): AuthoritativeGameState {
    return this.createGame(secretWord, playerIds);
  }
}

