import type { GameRecord } from "@/domain/game/game.types";
import type { GameRepository } from "@/domain/game/game.repository";

const STORAGE_KEY = "hangman.games";

export class LocalGameRepository implements GameRepository {
  async save(record: GameRecord): Promise<void> {
    const games = await this.list();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...games].slice(0, 50)));
  }

  async list(): Promise<readonly GameRecord[]> {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as GameRecord[];
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }
}
