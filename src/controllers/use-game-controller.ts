"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameRepository } from "@/domain/game/game.repository";
import { GameService } from "@/domain/game/game.service";
import type { GameCategory, GameRecord, GameState } from "@/domain/game/game.types";
import { WordService } from "@/domain/game/word.service";

interface UseGameControllerOptions {
  readonly playerName: string;
  readonly userId: string | null;
  readonly repository: GameRepository;
}

export function useGameController({ playerName, userId, repository }: UseGameControllerOptions) {
  const gameService = useMemo(() => new GameService(), []);
  const wordService = useMemo(() => new WordService(), []);
  const [game, setGame] = useState<GameState>(() => {
    const category: GameCategory = "variado";
    return gameService.createGame(wordService.select(category), category);
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const savedGames = useRef(new Set<string>());

  const persistFinishedGame = useCallback(async (finished: GameState) => {
    if (finished.status === "playing" || !finished.finishedAt || savedGames.current.has(finished.id)) return;
    savedGames.current.add(finished.id);
    const record: GameRecord = {
      id: finished.id,
      userId,
      playerName,
      wordLength: [...finished.entry.word].filter((letter) => letter !== " ").length,
      errors: finished.errors,
      result: finished.status,
      startedAt: finished.startedAt,
      finishedAt: finished.finishedAt,
    };
    try {
      await repository.save(record);
      setSaveError(null);
    } catch (error) {
      savedGames.current.delete(finished.id);
      setSaveError(error instanceof Error ? error.message : "No se pudo guardar la partida.");
    }
  }, [playerName, repository, userId]);

  const guess = useCallback((letter: string) => {
    setGame((current) => {
      const result = gameService.guess(current, letter);
      if (result.accepted && result.state.status !== "playing") {
        void persistFinishedGame(result.state);
      }
      return result.state;
    });
  }, [gameService, persistFinishedGame]);

  const newGame = useCallback((category: GameCategory) => {
    setSaveError(null);
    setGame((current) => gameService.createGame(wordService.select(category, current.entry.word), category));
  }, [gameService, wordService]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
      guess(event.key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [guess]);

  return { game, gameService, guess, newGame, saveError };
}
