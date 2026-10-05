import type { RealtimeChannel } from "@supabase/supabase-js";
import type { RoomRepository } from "@/domain/room/room.repository";
import { RoomService } from "@/domain/room/room.service";
import type { RoomSnapshot } from "@/domain/room/room.types";
import { createClient } from "@/lib/supabase/client";

const roomService = new RoomService();
const FRIENDLY_ERRORS: Record<string, string> = {
  INVALID_CODE: "El código debe tener 5 caracteres válidos.",
  ROOM_NOT_FOUND: "No encontramos esa sala. Verifica el código e inténtalo nuevamente.",
  ROOM_CLOSED: "Esa sala ya está cerrada.",
  ROOM_ALREADY_STARTED: "La partida de esa sala ya comenzó.",
  HOST_ONLY: "Solo el anfitrión puede realizar esta acción.",
  NOT_ENOUGH_PLAYERS: "Se necesitan al menos 2 jugadores para comenzar.",
  NOT_YOUR_TURN: "Espera tu turno para elegir una letra.",
  LETTER_ALREADY_USED: "Esa letra ya fue utilizada.",
  GAME_NOT_PLAYING: "La partida ya no está activa.",
};

export class SupabaseRoomRepository implements RoomRepository {
  async createRoom(playerName: string): Promise<string> {
    const { data, error } = await this.requireClient().rpc("create_room", { p_player_name: playerName });
    if (error) throw this.toFriendlyError(error.message);
    return data;
  }

  async joinRoom(code: string, playerName: string): Promise<string> {
    const normalized = roomService.normalizeRoomCode(code);
    if (!roomService.isValidRoomCode(normalized)) throw new Error(FRIENDLY_ERRORS.INVALID_CODE);
    const { data, error } = await this.requireClient().rpc("join_room", { p_code: normalized, p_player_name: playerName });
    if (error) throw this.toFriendlyError(error.message);
    return data;
  }

  async getRoom(code: string): Promise<RoomSnapshot> {
    const client = this.requireClient();
    const normalized = roomService.normalizeRoomCode(code);
    const { data: room, error: roomError } = await client.from("rooms").select("*").eq("code", normalized).maybeSingle();
    if (roomError) throw new Error(roomError.message);
    if (!room) throw new Error(FRIENDLY_ERRORS.ROOM_NOT_FOUND);

    const [{ data: players, error: playersError }, gameResult] = await Promise.all([
      client.from("room_players").select("*").eq("room_id", room.id).order("joined_at").order("player_id"),
      room.current_game_id
        ? client.from("room_games").select("*").eq("id", room.current_game_id).single()
        : Promise.resolve({ data: null, error: null }),
    ]);
    if (playersError) throw new Error(playersError.message);
    if (gameResult.error) throw new Error(gameResult.error.message);

    return {
      id: room.id,
      code: room.code,
      status: room.status,
      hostId: room.host_id,
      players: (players ?? []).map((player) => ({
        id: player.player_id,
        name: player.name,
        isHost: player.player_id === room.host_id,
        joinedAt: player.joined_at,
      })),
      game: gameResult.data ? {
        id: gameResult.data.id,
        maskedWord: gameResult.data.masked_word,
        guessedLetters: gameResult.data.guessed_letters,
        incorrectLetters: gameResult.data.incorrect_letters,
        errors: gameResult.data.errors,
        currentPlayerId: gameResult.data.current_player_id,
        status: gameResult.data.status,
        revealedWord: gameResult.data.revealed_word,
        startedAt: gameResult.data.started_at,
        finishedAt: gameResult.data.finished_at,
      } : null,
    };
  }

  async startGame(roomId: string): Promise<void> {
    const { error } = await this.requireClient().rpc("start_room_game", { p_room_id: roomId });
    if (error) throw this.toFriendlyError(error.message);
  }

  async guessLetter(roomId: string, letter: string): Promise<void> {
    const { error } = await this.requireClient().rpc("guess_room_letter", { p_room_id: roomId, p_letter: letter });
    if (error) throw this.toFriendlyError(error.message);
  }

  async restartGame(roomId: string): Promise<void> {
    const { error } = await this.requireClient().rpc("restart_room_game", { p_room_id: roomId });
    if (error) throw this.toFriendlyError(error.message);
  }

  async leaveRoom(roomId: string): Promise<void> {
    const { error } = await this.requireClient().rpc("leave_room", { p_room_id: roomId });
    if (error) throw this.toFriendlyError(error.message);
  }

  subscribe(roomId: string, onChange: () => void): () => void {
    const client = this.requireClient();
    let channel: RealtimeChannel = client.channel(`room:${roomId}`);
    for (const table of ["rooms", "room_players", "room_games"] as const) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: table === "rooms" ? `id=eq.${roomId}` : `room_id=eq.${roomId}` },
        onChange,
      );
    }
    channel.subscribe();
    return () => { void client.removeChannel(channel); };
  }

  private requireClient() {
    const client = createClient();
    if (!client) throw new Error("Las salas necesitan una conexión con Supabase. Configura las variables públicas para habilitarlas.");
    return client;
  }

  private toFriendlyError(message: string): Error {
    const key = Object.keys(FRIENDLY_ERRORS).find((candidate) => message.includes(candidate));
    return new Error(key ? FRIENDLY_ERRORS[key] : message);
  }
}
