"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RoomSnapshot } from "@/domain/room/room.types";
import { SupabaseRoomRepository } from "@/lib/repositories/supabase-room.repository";

export function useRoomController(code: string) {
  const repository = useMemo(() => new SupabaseRoomRepository(), []);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roomId = room?.id;

  const refresh = useCallback(async () => {
    try { setRoom(await repository.getRoom(code)); setError(null); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "No fue posible sincronizar la sala."); }
    finally { setLoading(false); }
  }, [code, repository]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);
  useEffect(() => roomId ? repository.subscribe(roomId, () => { void refresh(); }) : undefined, [repository, roomId, refresh]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true); setError(null);
    try { await action(); await refresh(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "No fue posible completar la acción."); }
    finally { setBusy(false); }
  };

  return {
    room, loading, busy, error,
    clearError: () => setError(null),
    startGame: () => room ? run(() => repository.startGame(room.id)) : Promise.resolve(),
    guessLetter: (letter: string) => room ? run(() => repository.guessLetter(room.id, letter)) : Promise.resolve(),
    restartGame: () => room ? run(() => repository.restartGame(room.id)) : Promise.resolve(),
    leaveRoom: () => room ? repository.leaveRoom(room.id) : Promise.resolve(),
  };
}
