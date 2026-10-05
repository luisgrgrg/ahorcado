import type { GameStatus } from "@/domain/game/game.types";

export type RoomStatus = "waiting" | "playing" | "finished";

export interface RoomPlayer {
  readonly id: string;
  readonly name: string;
  readonly isHost: boolean;
  readonly joinedAt: string;
}

export interface RoomGame {
  readonly id: string;
  readonly maskedWord: string;
  readonly guessedLetters: readonly string[];
  readonly incorrectLetters: readonly string[];
  readonly errors: number;
  readonly currentPlayerId: string;
  readonly status: GameStatus;
  readonly revealedWord: string | null;
  readonly startedAt: string;
  readonly finishedAt: string | null;
}

export interface RoomSnapshot {
  readonly id: string;
  readonly code: string;
  readonly status: RoomStatus;
  readonly hostId: string;
  readonly players: readonly RoomPlayer[];
  readonly game: RoomGame | null;
}

export type LetterState = "available" | "correct" | "incorrect";

