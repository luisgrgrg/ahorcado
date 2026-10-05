import { beforeEach, describe, expect, it } from "vitest";
import type { GameRecord } from "@/domain/game/game.types";
import { LocalGameRepository } from "./local-game.repository";

const record: GameRecord = {
  id: "game-1", userId: null, playerName: "Jugador 482", wordLength: 6,
  errors: 2, result: "won", startedAt: "2026-10-04T12:00:00.000Z", finishedAt: "2026-10-04T12:01:00.000Z",
};

describe("LocalGameRepository", () => {
  beforeEach(() => window.localStorage.clear());

  it("QA-DATA-001 guarda un resultado invitado", async () => {
    const repository = new LocalGameRepository();
    await repository.save(record);
    expect(await repository.list()).toEqual([record]);
  });

  it("QA-DATA-002 devuelve el historial más reciente primero", async () => {
    const repository = new LocalGameRepository();
    await repository.save(record);
    await repository.save({ ...record, id: "game-2", result: "lost" });
    expect((await repository.list()).map((game) => game.id)).toEqual(["game-2", "game-1"]);
  });
});
