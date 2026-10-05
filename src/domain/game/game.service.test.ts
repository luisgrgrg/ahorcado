import { describe, expect, it } from "vitest";
import { GameService } from "./game.service";
import type { WordEntry } from "./game.types";

const entry: WordEntry = { word: "SOL", hint: "Brilla", category: "aventura" };

describe("GameService", () => {
  it("QA-GAME-001 crea una partida local estable", () => {
    const service = new GameService();
    const game = service.createGame(entry, "aventura", new Date("2026-10-04T12:00:00Z"));
    expect(game).toMatchObject({ errors: 0, status: "playing", guessedLetters: [], startedAt: "2026-10-04T12:00:00.000Z" });
  });

  it("QA-GAME-002 acepta una letra correcta sin sumar error", () => {
    const service = new GameService();
    const result = service.guess(service.createGame(entry, "aventura"), "s");
    expect(result).toMatchObject({ accepted: true, correct: true });
    expect(result.state.errors).toBe(0);
  });

  it("QA-GAME-003 suma un error por letra incorrecta", () => {
    const service = new GameService();
    const result = service.guess(service.createGame(entry, "aventura"), "x");
    expect(result).toMatchObject({ accepted: true, correct: false });
    expect(result.state.errors).toBe(1);
  });

  it("QA-GAME-004 ignora una letra repetida", () => {
    const service = new GameService();
    const first = service.guess(service.createGame(entry, "aventura"), "x").state;
    const repeated = service.guess(first, "X");
    expect(repeated.accepted).toBe(false);
    expect(repeated.state).toBe(first);
  });

  it("QA-GAME-005 detecta la victoria", () => {
    const service = new GameService();
    let game = service.createGame(entry, "aventura");
    for (const letter of ["S", "O", "L"]) game = service.guess(game, letter).state;
    expect(game.status).toBe("won");
    expect(game.finishedAt).not.toBeNull();
  });

  it("QA-GAME-006 detecta la derrota al sexto error", () => {
    const service = new GameService();
    let game = service.createGame(entry, "aventura");
    for (const letter of ["A", "B", "C", "D", "E", "F"]) game = service.guess(game, letter).state;
    expect(game.status).toBe("lost");
    expect(game.errors).toBe(6);
  });
});
