"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameButton } from "@/components/ui/game-button";
import { RoomService } from "@/domain/room/room.service";
import type { PlayerSession } from "@/domain/player/player.types";
import { AuthService } from "@/lib/auth/auth.service";
import { SupabaseRoomRepository } from "@/lib/repositories/supabase-room.repository";
import { createGuestName, getGuestSession, startGuestSession } from "@/lib/session/guest-session";

const roomService = new RoomService();
const repository = new SupabaseRoomRepository();
const authService = new AuthService();

export function JoinRoomScreen() {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerSession | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      if (!active) return;
      const guest = getGuestSession();
      if (guest) {
        setPlayer(guest);
        return;
      }

      if (authService.isAvailable()) {
        try {
          const session = await authService.getSession();
          if (session) {
            const displayName = session.displayName || createGuestName();
            startGuestSession(displayName);
            setPlayer({ ...session, displayName });
            return;
          }
        } catch {
          // Si no hay sesión, se fuerza al flujo inicial para crear la identidad temporal.
        }
      }

      router.replace("/");
    });
    return () => { active = false; };
  }, [router]);

  const join = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!player) return;
    const normalized = roomService.normalizeRoomCode(code);
    if (!normalized) { setError("Escribe el código de la sala."); return; }
    if (!roomService.isValidRoomCode(normalized)) { setError("El código debe tener 5 caracteres válidos."); return; }
    setBusy(true); setError(null);
    try {
      await authService.ensureAnonymousSession(player.displayName);
      const joinedCode = await repository.joinRoom(normalized, player.displayName);
      router.push(`/sala/${joinedCode}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible entrar a la sala.");
      setBusy(false);
    }
  };

  return (
    <main className="flow-page join-page">
      <section className="flow-card join-card" aria-labelledby="join-title">
        <Link className="back-link" href="/inicio">← Volver</Link>
        <div className="join-icon" aria-hidden="true">⌁</div>
        <span className="eyebrow">Sala privada</span>
        <h1 id="join-title">Ingresa el código de la sala</h1>
        <p>Pídeselo al anfitrión. Tiene 5 caracteres.</p>
        <form onSubmit={join} className="join-form">
          <label htmlFor="room-code" className="sr-only">Código de sala</label>
          <input id="room-code" className="code-input" value={code} onChange={(event) => { setCode(roomService.normalizeRoomCode(event.target.value).slice(0, 5)); setError(null); }} maxLength={5} autoCapitalize="characters" autoComplete="off" placeholder="K7P4X" autoFocus />
          {error ? <p className="inline-alert error" role="alert">{error}</p> : null}
          <GameButton type="submit" disabled={busy || !player}>{busy ? "Entrando…" : "Entrar"}</GameButton>
        </form>
      </section>
    </main>
  );
}
