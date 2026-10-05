"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlayerSession } from "@/domain/player/player.types";
import { useRoomController } from "@/controllers/use-room-controller";
import { AuthService } from "@/lib/auth/auth.service";
import { getGuestSession } from "@/lib/session/guest-session";
import { MultiplayerGameBoard } from "./multiplayer-game-board";
import { RoomLobby } from "./room-lobby";

const authService = new AuthService();

export function RoomScreen({ code }: { readonly code: string }) {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerSession | null>(null);
  const { room, loading, busy, error, startGame, guessLetter, restartGame, leaveRoom } = useRoomController(code);

  useEffect(() => {
    void authService.getSession().then((session) => {
      const local = getGuestSession();
      if (!session?.userId || !local) router.replace("/inicio");
      else setPlayer({ ...session, displayName: local.displayName });
    }).catch(() => router.replace("/inicio"));
  }, [router]);

  const leave = useCallback(async () => {
    await leaveRoom();
    router.replace("/inicio");
  }, [leaveRoom, router]);

  if (loading || !player) return <main className="centered-state" aria-live="polite"><span className="loader" /><strong>Sincronizando la sala…</strong></main>;
  if (!room) return <main className="flow-page"><section className="flow-card error-card"><span className="join-icon" aria-hidden="true">!</span><h1>No pudimos abrir la sala</h1><p>{error}</p><button className="game-button primary" type="button" onClick={() => router.replace("/inicio")}>Volver al inicio</button></section></main>;

  return room.status === "waiting"
    ? <><RoomLobby room={room} playerId={player.userId ?? ""} busy={busy} onStart={() => void startGame()} onLeave={() => void leave()} />{error ? <div className="room-toast inline-alert error" role="alert">{error}</div> : null}</>
    : <MultiplayerGameBoard room={room} playerId={player.userId ?? ""} busy={busy} error={error} onGuess={(letter) => void guessLetter(letter)} onRestart={() => void restartGame()} onLeave={() => void leave()} />;
}
