import type { RoomSnapshot } from "./room.types";

export interface RoomRepository {
  createRoom(playerName: string): Promise<string>;
  joinRoom(code: string, playerName: string): Promise<string>;
  getRoom(code: string): Promise<RoomSnapshot>;
  startGame(roomId: string): Promise<void>;
  guessLetter(roomId: string, letter: string): Promise<void>;
  restartGame(roomId: string): Promise<void>;
  leaveRoom(roomId: string): Promise<void>;
  subscribe(roomId: string, onChange: () => void): () => void;
}
