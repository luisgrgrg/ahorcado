import { MAX_ERRORS, type GameState } from "@/domain/game/game.types";

const CATEGORY_LABELS = { animales: "Animales", comida: "Comida", aventura: "Aventura", variado: "Variado" } as const;

export function GameStatus({ game }: { readonly game: GameState }) {
  const title = game.status === "won" ? "¡Misión cumplida!" : game.status === "lost" ? "La palabra se escapó" : "¡Descubre la palabra!";
  return (
    <div className="status-bar">
      <div>
        <span className="eyebrow">Ronda · {CATEGORY_LABELS[game.category]}</span>
        <h1>{title}</h1>
      </div>
      <div className="attempt-pill" aria-live="polite">
        <span className="heart" aria-hidden="true">♥</span>
        <span><strong>{MAX_ERRORS - game.errors}</strong><small>intentos</small></span>
      </div>
    </div>
  );
}
