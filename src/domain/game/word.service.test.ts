import { describe, expect, it } from "vitest";
import { WordService } from "./word.service";
import type { WordEntry } from "./game.types";

const words: WordEntry[] = [
  { word: "GATO", hint: "Animal", category: "animales" },
  { word: "PAN", hint: "Comida", category: "comida" },
];

describe("WordService", () => {
  it("filtra palabras por categoría", () => {
    const service = new WordService(words, () => 0);
    expect(service.select("comida").word).toBe("PAN");
  });

  it("evita repetir la palabra cuando existe otra opción", () => {
    const service = new WordService(words, () => 0);
    expect(service.select("variado", "GATO").word).toBe("PAN");
  });
});
