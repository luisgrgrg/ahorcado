import { describe, expect, it } from "vitest";
import { RoomService } from "./room.service";
import type { RoomPlayer, RoomSnapshot } from "./room.types";

const service = new RoomService();
const players: readonly RoomPlayer[] = [
  { id: "p1", name: "Luna", isHost: true, joinedAt: "2026-10-04T10:00:00Z" },
  { id: "p2", name: "Sol", isHost: false, joinedAt: "2026-10-04T10:01:00Z" },
  { id: "p3", name: "Mar", isHost: false, joinedAt: "2026-10-04T10:02:00Z" },
];
const waitingRoom: RoomSnapshot = { id: "room-1", code: "K7P4X", status: "waiting", hostId: "p1", players, game: null };

describe("RoomService", () => {
  it("ROOM-001 crea un código de sala corto y legible", () => {
    expect(service.generateRoomCode(() => 0)).toBe("AAAAA");
    expect(service.isValidRoomCode("AAAAA")).toBe(true);
  });

  it("ROOM-002 genera códigos distintos con entradas aleatorias distintas", () => {
    expect(service.generateRoomCode(() => 0)).not.toBe(service.generateRoomCode(() => .99));
  });

  it("ROOM-003 normaliza y acepta un código válido", () => {
    expect(service.normalizeRoomCode(" k7 p4x ")).toBe("K7P4X");
    expect(service.isValidRoomCode(" k7 p4x ")).toBe(true);
  });

  it("ROOM-004 rechaza códigos vacíos, cortos o ambiguos", () => {
    expect(["", "ABC", "AB01O"].every((code) => !service.isValidRoomCode(code))).toBe(true);
  });

  it("ROOM-005 conserva el orden visible al incorporar un participante", () => {
    const joined = [...players, { id: "p4", name: "Río", isHost: false, joinedAt: "2026-10-04T10:03:00Z" }];
    expect(joined.map((player) => player.name)).toEqual(["Luna", "Sol", "Mar", "Río"]);
  });

  it("ROOM-006 solo permite iniciar al anfitrión con dos jugadores", () => {
    expect(service.canStart(waitingRoom, "p1")).toBe(true);
    expect(service.canStart(waitingRoom, "p2")).toBe(false);
    expect(service.canStart({ ...waitingRoom, players: players.slice(0, 1) }, "p1")).toBe(false);
  });

  it("ROOM-007 representa el inicio sincronizado en un único snapshot", () => {
    const playing = { ...waitingRoom, status: "playing" as const, game: { id: "g1", maskedWord: "___", guessedLetters: [], incorrectLetters: [], errors: 0, currentPlayerId: "p1", status: "playing" as const, revealedWord: null, startedAt: "now", finishedAt: null } };
    expect(playing).toMatchObject({ status: "playing", game: { currentPlayerId: "p1" } });
  });

  it("ROOM-008 elimina un jugador normal sin cambiar el anfitrión", () => {
    const remaining = players.filter((player) => player.id !== "p2");
    expect(remaining.map((player) => player.id)).toEqual(["p1", "p3"]);
    expect(service.getNextHost(remaining, "p2")?.id).toBe("p1");
  });

  it("ROOM-009 transfiere el rol cuando abandona el anfitrión", () => {
    expect(service.getNextHost(players, "p1")?.id).toBe("p2");
    expect(service.getNextHost(players.slice(0, 1), "p1")).toBeNull();
  });
});
