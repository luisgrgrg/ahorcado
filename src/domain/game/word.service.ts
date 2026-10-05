import type { GameCategory, WordEntry } from "./game.types";
import { WORDS } from "./words";

export class WordService {
  constructor(
    private readonly words: readonly WordEntry[] = WORDS,
    private readonly random: () => number = Math.random,
  ) {}

  select(category: GameCategory, previousWord?: string): WordEntry {
    const categoryPool = category === "variado"
      ? this.words
      : this.words.filter((entry) => entry.category === category);
    const withoutPrevious = categoryPool.filter((entry) => entry.word !== previousWord);
    const pool = withoutPrevious.length > 0 ? withoutPrevious : categoryPool;

    if (pool.length === 0) {
      throw new Error(`No hay palabras disponibles para la categoría ${category}.`);
    }

    return pool[Math.floor(this.random() * pool.length)]!;
  }
}
