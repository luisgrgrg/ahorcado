"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlayerSession } from "@/domain/player/player.types";
import { AuthService } from "@/lib/auth/auth.service";
import { clearGuestSession, getGuestSession } from "@/lib/session/guest-session";
import { PlayerBadge } from "./player-badge";
import { GameBoard } from "./game-board";

const authService = new AuthService();

export function GameScreen() {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void authService.getSession().then((authSession) => {
      if (!active) return;
      const resolved = authSession ?? getGuestSession();
      if (!resolved) router.replace("/");
      else setPlayer(resolved);
      setLoading(false);
    }).catch(() => {
      const guest = getGuestSession();
      if (guest) setPlayer(guest);
      else router.replace("/");
      setLoading(false);
    });
    return () => { active = false; };
  }, [router]);

  const signOut = async () => {
    if (player?.userId) await authService.signOut();
    clearGuestSession();
    router.replace("/");
  };

  if (loading || !player) return <main className="centered-state" aria-live="polite"><span className="loader" /><strong>Preparando la partida…</strong></main>;

  return (
    <div className="page-shell">
      <header className="game-header">
        <a className="brand" href="#game" aria-label="Ahorcado Aventuras, ir al tablero"><span className="brand-mark" aria-hidden="true">A</span><span><strong>Ahorcado</strong><small>Aventuras</small></span></a>
        <PlayerBadge name={player.displayName} mode={player.mode} />
      </header>
      <GameBoard player={player} onSignOut={() => void signOut()} />
      <p className="page-note">Piensa, prueba y diviértete. Cada palabra es una nueva aventura.</p>
    </div>
  );
}
