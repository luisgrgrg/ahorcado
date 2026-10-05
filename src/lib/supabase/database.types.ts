export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string; created_at: string };
        Insert: { id: string; display_name: string; created_at?: string };
        Update: { display_name?: string };
        Relationships: [];
      };
      games: {
        Row: { id: string; user_id: string | null; player_name: string; word_length: number; errors: number; result: "won" | "lost"; started_at: string; finished_at: string };
        Insert: { id?: string; user_id?: string | null; player_name: string; word_length: number; errors: number; result: "won" | "lost"; started_at: string; finished_at: string };
        Update: never;
        Relationships: [];
      };
      rooms: {
        Row: { id: string; code: string; status: Database["public"]["Enums"]["room_status"]; host_id: string; current_game_id: string | null; created_at: string };
        Insert: { id?: string; code: string; status?: Database["public"]["Enums"]["room_status"]; host_id: string; current_game_id?: string | null; created_at?: string };
        Update: { status?: Database["public"]["Enums"]["room_status"]; host_id?: string; current_game_id?: string | null };
        Relationships: [];
      };
      room_players: {
        Row: { room_id: string; player_id: string; name: string; joined_at: string };
        Insert: { room_id: string; player_id: string; name: string; joined_at?: string };
        Update: { name?: string };
        Relationships: [];
      };
      room_games: {
        Row: { id: string; room_id: string; masked_word: string; guessed_letters: string[]; incorrect_letters: string[]; errors: number; current_player_id: string; status: Database["public"]["Enums"]["room_game_status"]; revealed_word: string | null; started_at: string; finished_at: string | null };
        Insert: { id?: string; room_id: string; masked_word: string; guessed_letters?: string[]; incorrect_letters?: string[]; errors?: number; current_player_id: string; status?: Database["public"]["Enums"]["room_game_status"]; revealed_word?: string | null; started_at?: string; finished_at?: string | null };
        Update: Partial<Database["public"]["Tables"]["room_games"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_room: { Args: { p_player_name: string }; Returns: string };
      join_room: { Args: { p_code: string; p_player_name: string }; Returns: string };
      start_room_game: { Args: { p_room_id: string }; Returns: string };
      guess_room_letter: { Args: { p_room_id: string; p_letter: string }; Returns: undefined };
      restart_room_game: { Args: { p_room_id: string }; Returns: string };
      leave_room: { Args: { p_room_id: string }; Returns: undefined };
      is_room_member: { Args: { p_room_id: string }; Returns: boolean };
    };
    Enums: { room_status: "waiting" | "playing" | "finished"; room_game_status: "playing" | "won" | "lost" };
    CompositeTypes: Record<string, never>;
  };
}
