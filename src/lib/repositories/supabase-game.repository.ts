import type { GameRepository } from "@/domain/game/game.repository";
import type { GameRecord } from "@/domain/game/game.types";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

export class SupabaseGameRepository implements GameRepository {
  constructor(private readonly userId: string) {}

  async save(record: GameRecord): Promise<void> {
    const client = this.requireClient();
    const { error } = await client.from("games").insert({
      id: record.id,
      user_id: this.userId,
      player_name: record.playerName,
      word_length: record.wordLength,
      errors: record.errors,
      result: record.result,
      started_at: record.startedAt,
      finished_at: record.finishedAt,
    });
    if (error) throw new Error(error.message);
  }

  async list(): Promise<readonly GameRecord[]> {
    const client = this.requireClient();
    const { data, error } = await client.from("games").select("*").order("finished_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as Database["public"]["Tables"]["games"]["Row"][];
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      playerName: row.player_name,
      wordLength: row.word_length,
      errors: row.errors,
      result: row.result,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
    }));
  }

  private requireClient() {
    const client = createClient();
    if (!client) throw new Error("Supabase no está configurado.");
    return client;
  }
}
