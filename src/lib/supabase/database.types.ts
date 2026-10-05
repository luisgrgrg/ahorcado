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
        Row: {
          id: string;
          user_id: string | null;
          player_name: string;
          word_length: number;
          errors: number;
          result: "won" | "lost";
          started_at: string;
          finished_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          player_name: string;
          word_length: number;
          errors: number;
          result: "won" | "lost";
          started_at: string;
          finished_at: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
