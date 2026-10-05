import type { GameRecord } from "./game.types";

export interface GameRepository {
  save(record: GameRecord): Promise<void>;
  list(): Promise<readonly GameRecord[]>;
}
