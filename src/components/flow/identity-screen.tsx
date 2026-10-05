"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameButton } from "@/components/ui/game-button";
import { AuthService } from "@/lib/auth/auth.service";
import { createGuestName, getGuestSession, startGuestSession } from "@/lib/session/guest-session";

const authService = new AuthService();

export function IdentityScreen() {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      const existing = getGuestSession();
      if (existing) router.replace("/inicio");
      else setName(createGuestName());
    });
    return () => { active = false; };
  }, [router]);

  const continueToGame = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const session = startGuestSession(name);
    if (authService.isAvailable()) {
      try { await authService.ensureAnonymousSession(session.displayName); } catch { /* The landing remains available for configuration and practice. */ }
    }
    router.push("/inicio");
  };

  return (
    <main className="flow-page identity-page">
      <section className="flow-card identity-card" aria-labelledby="identity-title">
        <div className="flow-mascot" aria-hidden="true">A</div>
        <span className="eyebrow">El Ahorcado</span>
        <h1 id="identity-title">¿Cómo quieres llamarte?</h1>
        <p>Este será tu nombre dentro de la sala.</p>
        <form className="identity-form" onSubmit={continueToGame}>
          <label htmlFor="player-name" className="sr-only">Nombre del jugador</label>
          <input id="player-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={32} minLength={1} required autoComplete="nickname" autoFocus />
          <GameButton type="submit" disabled={!name.trim()}>Continuar <span aria-hidden="true">→</span></GameButton>
        </form>
      </section>
    </main>
  );
}
