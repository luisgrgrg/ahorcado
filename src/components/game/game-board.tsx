"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PlayerSession } from "@/domain/player/player.types";
import { normalizeLetter } from "@/domain/game/game.service";
import { useGameController } from "@/controllers/use-game-controller";
import { LocalGameRepository } from "@/lib/repositories/local-game.repository";
import { SupabaseGameRepository } from "@/lib/repositories/supabase-game.repository";
import { GameStatus } from "./game-status";
import { WordBoard } from "./word-board";
import { HangmanFigure } from "./hangman-figure";
import { LetterKeyboard } from "./letter-keyboard";
import { CategoryDialog } from "./category-dialog";
import { ResultModal } from "./result-modal";
import { GameButton } from "@/components/ui/game-button";

export function GameBoard({ player, onSignOut }: { readonly player: PlayerSession; readonly onSignOut: () => void }) {
  const repository = useMemo(() => player.userId ? new SupabaseGameRepository(player.userId) : new LocalGameRepository(), [player.userId]);
  const { game, gameService, guess, newGame, saveError } = useGameController({ playerName: player.displayName, userId: player.userId, repository });
  const [showCategories, setShowCategories] = useState(false);
  const wrongLetters = game.guessedLetters.filter((letter) => !normalizeLetter(game.entry.word).includes(letter));

  return (
    <>
      <main className="game-card" id="game" tabIndex={-1}>
        <GameStatus game={game} />
        <div className="board-layout">
          <section className="word-zone" aria-labelledby="word-heading">
            <div className="zone-heading"><span className="step-dot" aria-hidden="true">1</span><h2 id="word-heading">Palabra secreta</h2></div>
            <WordBoard game={game} service={gameService} />
            <p className="hint"><span aria-hidden="true">✦</span> Pista: {game.entry.hint}</p>
          </section>
          <section className="figure-zone" aria-labelledby="figure-heading">
            <div className="zone-heading compact-heading"><span className="step-dot" aria-hidden="true">2</span><h2 id="figure-heading">Tu progreso</h2></div>
            <HangmanFigure errors={game.errors} />
          </section>
          <section className="keyboard-zone" aria-labelledby="keyboard-heading">
            <div className="zone-heading keyboard-heading">
              <div className="heading-label"><span className="step-dot" aria-hidden="true">3</span><h2 id="keyboard-heading">Elige una letra</h2></div>
              <span className="desktop-tip">También puedes usar tu teclado</span>
            </div>
            <LetterKeyboard game={game} onGuess={guess} />
            <div className="wrong-letters" aria-live="polite"><span className="wrong-title">Letras fallidas</span><span className="wrong-list">{wrongLetters.length ? wrongLetters.join(" · ") : "Ninguna todavía"}</span></div>
            {saveError ? <p className="inline-alert error" role="alert">La partida terminó, pero no se guardó: {saveError}</p> : null}
          </section>
        </div>
        <footer className="game-actions">
          <GameButton variant="secondary" type="button" onClick={() => setShowCategories(true)}><span aria-hidden="true">↻</span> Nueva partida</GameButton>
          <div className="game-links"><Link href="/historial">Mis partidas</Link><button type="button" onClick={onSignOut}>Salir</button></div>
        </footer>
      </main>
      <CategoryDialog open={showCategories} onClose={() => setShowCategories(false)} onSelect={(category) => { newGame(category); setShowCategories(false); }} />
      <ResultModal game={game} onPlayAgain={() => newGame(game.category)} onChangeCategory={() => setShowCategories(true)} />
    </>
  );
}
