"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlayerSession } from "@/domain/player/player.types";
import { AuthService } from "@/lib/auth/auth.service";
import { SupabaseRoomRepository } from "@/lib/repositories/supabase-room.repository";
import { getGuestSession } from "@/lib/session/guest-session";

const authService = new AuthService();
const roomRepository = new SupabaseRoomRepository();

export function GameLanding() {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      const guest = getGuestSession();
      if (!guest) router.replace("/"); else setPlayer(guest);
    });
    return () => { active = false; };
  }, [router]);

  const createRoom = async () => {
    if (!player) return;
    setBusy(true); setError(null);
    try {
      await authService.ensureAnonymousSession(player.displayName);
      const code = await roomRepository.createRoom(player.displayName);
      router.push(`/sala/${code}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos crear la sala.");
      setBusy(false);
    }
  };

  if (!player) return <main className="centered-state" aria-live="polite"><span className="loader" /><strong>Preparando tu aventura…</strong></main>;

  return (
    <main className="flow-page landing-page">
      <section className="landing-card" aria-labelledby="landing-title">
        <div className="landing-logo" aria-hidden="true"><span>A</span><i>✦</i></div>
        <span className="eyebrow">Juego cooperativo</span>
        <h1 id="landing-title">El Ahorcado</h1>
        <p className="landing-greeting">Hola, <strong>{player.displayName}</strong> <span aria-hidden="true">👋</span></p>
        <h2>¿Qué quieres hacer?</h2>
        <div className="landing-actions">
          <button className="choice-button primary-choice" type="button" onClick={() => void createRoom()} disabled={busy}>
            <span className="choice-icon" aria-hidden="true">＋</span><span><strong>{busy ? "Creando sala…" : "Crear sala"}</strong><small>Invita a tus amigos con un código</small></span><span aria-hidden="true">→</span>
          </button>
          <Link className="choice-button" href="/sala/entrar">
            <span className="choice-icon" aria-hidden="true">⌁</span><span><strong>Entrar a una sala</strong><small>Usa el código de un amigo</small></span><span aria-hidden="true">→</span>
          </Link>
        </div>
        {error ? <p className="inline-alert error" role="alert">{error}</p> : null}
        <nav className="secondary-nav" aria-label="Opciones secundarias">
          <Link href="/configuracion">Configuración</Link><span aria-hidden="true">•</span><Link href="/cuenta">Iniciar sesión</Link><span aria-hidden="true">•</span><Link href="/historial">Historial</Link>
        </nav>
      </section>
    </main>
  );
}
