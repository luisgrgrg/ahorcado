"use client";

import { useEffect } from "react";
import { HangmanFigure } from "@/components/game/hangman-figure";
import { RoomService } from "@/domain/room/room.service";
import type { RoomSnapshot } from "@/domain/room/room.types";
import { MaskedWordBoard } from "./masked-word-board";
import { MultiplayerKeyboard } from "./multiplayer-keyboard";
import { MultiplayerResult } from "./multiplayer-result";

const roomService = new RoomService();

interface MultiplayerGameBoardProps {
  readonly room: RoomSnapshot;
  readonly playerId: string;
  readonly busy: boolean;
  readonly error: string | null;
  readonly onGuess: (letter: string) => void;
  readonly onRestart: () => void;
  readonly onLeave: () => void;
}

export function MultiplayerGameBoard({ room, playerId, busy, error, onGuess, onRestart, onLeave }: MultiplayerGameBoardProps) {
  const game = room.game;
  const canPlay = game ? roomService.canUseKeyboard(room, playerId) : false;
  const currentPlayer = room.players.find((player) => player.id === game?.currentPlayerId);

  useEffect(() => {
    if (!canPlay || !game || game.status !== "playing") return;
    const handleKey = (event: KeyboardEvent) => {
      const letter = event.key.toUpperCase();
      if (/^[A-ZÑ]$/.test(letter) && !game.guessedLetters.includes(letter)) onGuess(letter);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [canPlay, game, onGuess]);

  if (!game) return <main className="centered-state"><strong>Preparando la partida…</strong></main>;

  return (
    <div className="page-shell multiplayer-shell">
      <header className="game-header room-game-header">
        <span className="brand"><span className="brand-mark" aria-hidden="true">A</span><span><strong>Ahorcado</strong><small>Sala {room.code}</small></span></span>
        <button className="text-button" type="button" onClick={onLeave}>Salir de la sala</button>
      </header>
      <main className="game-card" id="game" tabIndex={-1}>
        <header className={`status-bar turn-status ${canPlay ? "your-turn" : ""}`}>
          <div><span className="eyebrow">{canPlay ? "Tu turno" : "Turno actual"}</span><h1>{canPlay ? "¡Elige una letra!" : `Turno de ${currentPlayer?.name ?? "otro jugador"}`}</h1></div>
          <div className="attempt-pill"><span className="heart" aria-hidden="true">♥</span><span><strong>{6 - game.errors}</strong><small>intentos</small></span></div>
        </header>
        <div className="board-layout">
          <section className="word-zone" aria-labelledby="mp-word-title">
            <div className="zone-heading"><span className="step-dot" aria-hidden="true">1</span><h2 id="mp-word-title">Palabra secreta</h2></div>
            <MaskedWordBoard maskedWord={game.maskedWord} />
            <p className="hint"><span aria-hidden="true">✦</span> Completen la palabra entre todos</p>
          </section>
          <section className="figure-zone" aria-labelledby="mp-progress-title">
            <div className="zone-heading compact-heading"><span className="step-dot" aria-hidden="true">2</span><h2 id="mp-progress-title">Progreso de la sala</h2></div>
            <HangmanFigure errors={game.errors} />
          </section>
          <section className="keyboard-zone" aria-labelledby="mp-keyboard-title">
            <div className="zone-heading keyboard-heading"><div className="heading-label"><span className="step-dot" aria-hidden="true">3</span><h2 id="mp-keyboard-title">{canPlay ? "Elige una letra" : "Teclado en espera"}</h2></div><span className="desktop-tip">{canPlay ? "También puedes usar tu teclado" : `Juega ${currentPlayer?.name ?? "otro jugador"}`}</span></div>
            <MultiplayerKeyboard game={game} enabled={canPlay} busy={busy} onGuess={onGuess} />
            <div className="wrong-letters" aria-live="polite"><span className="wrong-title">Letras fallidas</span><span className="wrong-list">{game.incorrectLetters.length ? game.incorrectLetters.join(" · ") : "Ninguna todavía"}</span></div>
            {!canPlay && game.status === "playing" ? <p className="turn-helper" role="status"><span aria-hidden="true">⌛</span> Espera tu turno. El teclado se activará automáticamente.</p> : null}
            {error ? <p className="inline-alert error" role="alert">{error}</p> : null}
          </section>
        </div>
        <footer className="game-actions mp-player-strip"><strong>Orden de turnos</strong><div>{room.players.map((player) => <span className={player.id === game.currentPlayerId ? "active" : ""} key={player.id}>{player.name}{player.isHost ? " ♛" : ""}</span>)}</div></footer>
      </main>
      <MultiplayerResult room={room} isHost={room.hostId === playerId} busy={busy} onRestart={onRestart} />
    </div>
  );
}

