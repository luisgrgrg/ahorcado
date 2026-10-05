import { GameService } from "@/domain/game/game.service";
import type { GameState } from "@/domain/game/game.types";

export function WordBoard({ game, service }: { readonly game: GameState; readonly service: GameService }) {
  const readable: string[] = [];
  return (
    <div
      className="word-board"
      aria-live="polite"
      aria-label={[...game.entry.word].map((character) => {
        const value = character === " " ? "espacio" : service.isRevealed(character, game) ? character : "guion";
        readable.push(value);
        return value;
      }).join(", ")}
    >
      {[...game.entry.word].map((character, index) => {
        if (character === " ") return <span className="word-space" key={`space-${index}`} />;
        const revealed = service.isRevealed(character, game);
        return <span className={`letter-slot${revealed ? " revealed" : ""}`} aria-hidden="true" key={`${character}-${index}`}>{revealed ? character : ""}</span>;
      })}
    </div>
  );
}
