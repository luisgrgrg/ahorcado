import type { LetterState, RoomGame, RoomPlayer, RoomSnapshot } from "./room.types";

export const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const ROOM_CODE_LENGTH = 5;

export class RoomService {
  generateRoomCode(random: () => number = Math.random): string {
    return Array.from({ length: ROOM_CODE_LENGTH }, () => {
      const index = Math.floor(random() * ROOM_CODE_ALPHABET.length);
      return ROOM_CODE_ALPHABET[Math.min(index, ROOM_CODE_ALPHABET.length - 1)];
    }).join("");
  }

  normalizeRoomCode(code: string): string {
    return code.toUpperCase().replace(/\s+/g, "");
  }

  isValidRoomCode(code: string): boolean {
    return new RegExp(`^[${ROOM_CODE_ALPHABET}]{${ROOM_CODE_LENGTH}}$`).test(this.normalizeRoomCode(code));
  }

  getNextPlayer(players: readonly RoomPlayer[], currentPlayerId: string): RoomPlayer | null {
    if (players.length === 0) return null;
    const currentIndex = players.findIndex((player) => player.id === currentPlayerId);
    return players[(currentIndex + 1 + players.length) % players.length];
  }

  getNextHost(players: readonly RoomPlayer[], leavingPlayerId: string): RoomPlayer | null {
    return players.find((player) => player.id !== leavingPlayerId) ?? null;
  }

  canStart(room: RoomSnapshot, playerId: string): boolean {
    return room.status === "waiting" && room.hostId === playerId && room.players.length >= 2;
  }

  canUseKeyboard(room: RoomSnapshot, playerId: string): boolean {
    return room.status === "playing" && room.game?.status === "playing" && room.game.currentPlayerId === playerId;
  }

  getLetterState(game: RoomGame, letter: string): LetterState {
    if (game.incorrectLetters.includes(letter)) return "incorrect";
    if (game.guessedLetters.includes(letter)) return "correct";
    return "available";
  }
}

