import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { PlayerSession } from "@/domain/player/player.types";
import { createClient } from "@/lib/supabase/client";

export interface AuthCredentials {
  readonly email: string;
  readonly password: string;
  readonly displayName?: string;
}

export class AuthService {
  isAvailable(): boolean {
    return createClient() !== null;
  }

  async signUp(credentials: AuthCredentials): Promise<{ needsConfirmation: boolean }> {
    const client = this.requireClient();
    const { data, error } = await client.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: { data: { display_name: credentials.displayName?.trim() || "Jugador" } },
    });
    if (error) throw new Error(error.message);
    return { needsConfirmation: data.session === null };
  }

  async signIn(credentials: AuthCredentials): Promise<PlayerSession> {
    const client = this.requireClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) throw new Error(error.message);
    return this.toPlayerSession(data.session);
  }

  async ensureAnonymousSession(displayName: string): Promise<PlayerSession> {
    const client = this.requireClient();
    const { data: current, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw new Error(sessionError.message);
    if (current.session) return this.toPlayerSession(current.session);

    const { data, error } = await client.auth.signInAnonymously({
      options: { data: { display_name: displayName.trim().slice(0, 32) || "Invitado" } },
    });
    if (error) throw new Error(error.message);
    if (!data.session) throw new Error("No fue posible preparar la identidad de invitado.");
    return this.toPlayerSession(data.session);
  }

  async signOut(): Promise<void> {
    const client = this.requireClient();
    const { error } = await client.auth.signOut();
    if (error) throw new Error(error.message);
  }

  async getSession(): Promise<PlayerSession | null> {
    const client = createClient();
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session ? this.toPlayerSession(data.session) : null;
  }

  onAuthStateChange(callback: (session: PlayerSession | null, event: AuthChangeEvent) => void) {
    const client = createClient();
    if (!client) return () => undefined;
    const { data } = client.auth.onAuthStateChange((event, session) => {
      callback(session ? this.toPlayerSession(session) : null, event);
    });
    return () => data.subscription.unsubscribe();
  }

  private toPlayerSession(session: Session): PlayerSession {
    const metadataName = session.user.user_metadata.display_name;
    return {
      mode: session.user.is_anonymous ? "guest" : "authenticated",
      userId: session.user.id,
      displayName: typeof metadataName === "string" && metadataName.trim() ? metadataName : session.user.email?.split("@")[0] || "Jugador",
      email: session.user.email ?? null,
    };
  }

  private requireClient() {
    const client = createClient();
    if (!client) throw new Error("Supabase aún no está configurado en este entorno.");
    return client;
  }
}
