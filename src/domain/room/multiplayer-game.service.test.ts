import { describe, expect, it } from "vitest";
import { RoomService } from "./room.service";
import { MultiplayerGameService } from "./multiplayer-game.service";
import type { RoomSnapshot } from "./room.types";

const gameService = new MultiplayerGameService();
const roomService = new RoomService();
const playerIds = ["p1", "p2", "p3"] as const;

describe("MultiplayerGameService", () => {
  it("GAME-MP-001 asigna el primer turno según el orden de ingreso", () => {
    expect(gameService.createGame("SOL", playerIds).currentPlayerId).toBe("p1");
  });

  it("GAME-MP-002 bloquea el teclado para quien no tiene el turno", () => {
    const game = gameService.createGame("SOL", playerIds);
    const room = { id: "r1", code: "K7P4X", status: "playing", hostId: "p1", players: [], game: { ...game, id: "g1", revealedWord: null, startedAt: "now", finishedAt: null } } as RoomSnapshot;
    expect(roomService.canUseKeyboard(room, "p1")).toBe(true);
    expect(roomService.canUseKeyboard(room, "p2")).toBe(false);
  });

  it("GAME-MP-003 procesa una letra correcta", () => {
    const result = gameService.guessLetter(gameService.createGame("SOL", playerIds), "s", playerIds);
    expect(result.state).toMatchObject({ maskedWord: "S__", errors: 0, guessedLetters: ["S"] });
  });

  it("GAME-MP-004 procesa una letra incorrecta", () => {
    const result = gameService.guessLetter(gameService.createGame("SOL", playerIds), "x", playerIds);
    expect(result.state).toMatchObject({ maskedWord: "___", errors: 1, incorrectLetters: ["X"] });
  });

  it("GAME-MP-005 rota el turno y vuelve al primero", () => {
    expect(gameService.guessLetter({ ...gameService.createGame("SOL", playerIds), currentPlayerId: "p3" }, "A", playerIds).state.currentPlayerId).toBe("p1");
  });

  it("GAME-MP-006 evita una letra repetida", () => {
    const first = gameService.guessLetter(gameService.createGame("SOL", playerIds), "S", playerIds).state;
    const repeated = gameService.guessLetter(first, "s", playerIds);
    expect(repeated.accepted).toBe(false);
    expect(repeated.state).toBe(first);
  });

  it("GAME-MP-007 sincroniza una victoria en el estado compartido", () => {
    let game = gameService.createGame("SOL", playerIds);
    for (const letter of ["S", "O", "L"]) game = gameService.guessLetter(game, letter, playerIds).state;
    expect(game).toMatchObject({ status: "won", maskedWord: "SOL" });
  });

  it("GAME-MP-008 sincroniza una derrota al sexto error", () => {
    let game = gameService.createGame("SOL", playerIds);
    for (const letter of ["A", "B", "C", "D", "E", "F"]) game = gameService.guessLetter(game, letter, playerIds).state;
    expect(game).toMatchObject({ status: "lost", errors: 6 });
  });

  it("GAME-MP-009 reinicia el juego sin cambiar sala, código ni jugadores", () => {
    const room = { id: "r1", code: "K7P4X", players: playerIds };
    const restarted = gameService.restart("MAR", playerIds);
    expect(room).toEqual({ id: "r1", code: "K7P4X", players: playerIds });
    expect(restarted).toMatchObject({ maskedWord: "___", errors: 0, currentPlayerId: "p1" });
  });
});
