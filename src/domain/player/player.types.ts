export type PlayerMode = "guest" | "authenticated";

export interface PlayerSession {
  readonly mode: PlayerMode;
  readonly userId: string | null;
  readonly displayName: string;
  readonly email: string | null;
}
