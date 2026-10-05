"use client";

import { useState } from "react";
import { GameButton } from "@/components/ui/game-button";
import { RoomService } from "@/domain/room/room.service";
import type { RoomSnapshot } from "@/domain/room/room.types";

const roomService = new RoomService();

interface RoomLobbyProps {
  readonly room: RoomSnapshot;
  readonly playerId: string;
  readonly busy: boolean;
  readonly onStart: () => void;
  readonly onLeave: () => void;
}

export function RoomLobby({ room, playerId, busy, onStart, onLeave }: RoomLobbyProps) {
  const [copied, setCopied] = useState(false);
  const isHost = room.hostId === playerId;
  const canStart = roomService.canStart(room, playerId);

  const copyCode = async () => {
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="room-shell">
      <section className="lobby-card" aria-labelledby="lobby-title">
        <header className="room-code-header">
          <span className="eyebrow">Sala privada</span>
          <h1 id="lobby-title">Sala <strong>{room.code}</strong></h1>
          <p>Comparte este código con tus amigos</p>
          <button type="button" className="copy-code" onClick={() => void copyCode()}><span aria-hidden="true">▣</span>{copied ? "Código copiado" : "Copiar código"}</button>
        </header>
        <div className="lobby-waiting"><span className="waiting-dots" aria-hidden="true"><i /><i /><i /></span><strong>Esperando jugadores…</strong><small>Los participantes aparecerán aquí en tiempo real</small></div>
        <section className="participants" aria-labelledby="participants-title">
          <div className="participants-heading"><h2 id="participants-title">Jugadores</h2><span>{room.players.length} conectado{room.players.length === 1 ? "" : "s"}</span></div>
          <ul className="participant-list">
            {room.players.map((player, index) => (
              <li key={player.id}>
                <span className={`participant-avatar avatar-${index % 4}`} aria-hidden="true">{player.name.charAt(0).toUpperCase()}</span>
                <span className="participant-name"><strong>{player.name}{player.id === playerId ? " (Tú)" : ""}</strong><small><i aria-hidden="true" /> En sala</small></span>
                {player.isHost ? <span className="host-badge"><span aria-hidden="true">♛</span> Anfitrión</span> : null}
              </li>
            ))}
          </ul>
        </section>
        <footer className="lobby-actions">
          {isHost ? (
            <><GameButton type="button" disabled={!canStart || busy} onClick={onStart}>{busy ? "Preparando…" : "Iniciar partida"}</GameButton>{room.players.length < 2 ? <small>Espera a que se una al menos otro jugador.</small> : <small>Todos jugarán la misma palabra por turnos.</small>}</>
          ) : <div className="host-wait-message"><span aria-hidden="true">⌛</span><span><strong>Todo listo</strong><small>Esperando a que el anfitrión inicie la partida…</small></span></div>}
          <button type="button" className="text-button leave-button" onClick={onLeave}>Salir de la sala</button>
        </footer>
      </section>
    </main>
  );
}

