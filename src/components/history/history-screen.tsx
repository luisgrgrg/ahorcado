"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { GameRepository } from "@/domain/game/game.repository";
import type { GameRecord } from "@/domain/game/game.types";
import type { PlayerSession } from "@/domain/player/player.types";
import { AuthService } from "@/lib/auth/auth.service";
import { LocalGameRepository } from "@/lib/repositories/local-game.repository";
import { SupabaseGameRepository } from "@/lib/repositories/supabase-game.repository";
import { getGuestSession } from "@/lib/session/guest-session";

const authService = new AuthService();

export function HistoryScreen() {
  const [player, setPlayer] = useState<PlayerSession | null>(null);
  const [games, setGames] = useState<readonly GameRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void authService.getSession().then(async (authSession) => {
      const resolved = authSession ?? getGuestSession();
      if (!active || !resolved) return;
      const repository: GameRepository = resolved.userId ? new SupabaseGameRepository(resolved.userId) : new LocalGameRepository();
      const history = await repository.list();
      if (active) { setPlayer(resolved); setGames(history); }
    }).catch((caught) => {
      if (active) setError(caught instanceof Error ? caught.message : "No fue posible cargar el historial.");
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => {
    const wins = games.filter((game) => game.result === "won").length;
    return { total: games.length, wins, losses: games.length - wins, rate: games.length ? Math.round((wins / games.length) * 100) : 0 };
  }, [games]);

  return (
    <main className="history-page">
      <header className="subpage-header"><div><span className="eyebrow">{player?.displayName ?? "Jugador"}</span><h1>Mis partidas</h1></div><Link className="back-link" href="/juego">← Volver al juego</Link></header>
      <section className="stats-grid" aria-label="Resumen de partidas">
        <article><strong>{stats.total}</strong><span>Partidas</span></article><article><strong>{stats.wins}</strong><span>Victorias</span></article><article><strong>{stats.losses}</strong><span>Derrotas</span></article><article><strong>{stats.rate}%</strong><span>Éxito</span></article>
      </section>
      <section className="history-card" aria-labelledby="history-title">
        <h2 id="history-title">Actividad reciente</h2>
        {loading ? <p className="empty-history">Cargando partidas…</p> : error ? <p className="inline-alert error" role="alert">{error}</p> : games.length === 0 ? <p className="empty-history">Aún no hay partidas guardadas. Juega una ronda para estrenar tu historial.</p> : (
          <ul className="history-list">
            {games.map((game) => {
              const duration = Math.max(0, Math.round((new Date(game.finishedAt).getTime() - new Date(game.startedAt).getTime()) / 1000));
              return <li key={game.id}><span className={`result-mark ${game.result}`} aria-hidden="true">{game.result === "won" ? "✓" : "×"}</span><div><strong>{game.result === "won" ? "Victoria" : "Derrota"}</strong><small>{new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(game.finishedAt))}</small></div><span>{game.errors} errores</span><span>{duration}s</span></li>;
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
