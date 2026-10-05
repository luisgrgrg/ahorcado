export const MAX_ERRORS = 6;
export const ALPHABET = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("") as readonly string[];

export type GameCategory = "animales" | "comida" | "aventura" | "variado";
export type GameResult = "won" | "lost";
export type GameStatus = "playing" | GameResult;

export interface WordEntry {
  readonly word: string;
  readonly hint: string;
  readonly category: Exclude<GameCategory, "variado">;
}

export interface GameState {
  readonly id: string;
  readonly category: GameCategory;
  readonly entry: WordEntry;
  readonly guessedLetters: readonly string[];
  readonly errors: number;
  readonly status: GameStatus;
  readonly startedAt: string;
  readonly finishedAt: string | null;
}

export interface GameRecord {
  readonly id: string;
  readonly userId: string | null;
  readonly playerName: string;
  readonly wordLength: number;
  readonly errors: number;
  readonly result: GameResult;
  readonly startedAt: string;
  readonly finishedAt: string;
}

export interface GuessResult {
  readonly state: GameState;
  readonly accepted: boolean;
  readonly correct: boolean | null;
}
