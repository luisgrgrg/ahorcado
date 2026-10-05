import type { GameCategory } from "@/domain/game/game.types";

const CATEGORIES: readonly { category: GameCategory; icon: string; title: string; detail: string; featured?: boolean }[] = [
  { category: "animales", icon: "♞", title: "Animales", detail: "Del bosque al océano" },
  { category: "comida", icon: "♨", title: "Comida", detail: "Sabores deliciosos" },
  { category: "aventura", icon: "⚑", title: "Aventura", detail: "Lugares por explorar" },
  { category: "variado", icon: "✦", title: "Sorpresa", detail: "Un poco de todo", featured: true },
];

export function CategoryDialog({ open, onClose, onSelect }: { readonly open: boolean; readonly onClose: () => void; readonly onSelect: (category: GameCategory) => void }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="dialog-card selector-card" role="dialog" aria-modal="true" aria-labelledby="category-title">
        <button className="icon-button close-dialog" type="button" aria-label="Cerrar selector" onClick={onClose}>×</button>
        <span className="dialog-kicker">Nueva partida</span>
        <h2 id="category-title">Elige una aventura</h2>
        <p>Cada tema trae palabras y pistas diferentes.</p>
        <div className="category-grid">
          {CATEGORIES.map((item) => (
            <button type="button" className={`category-card${item.featured ? " featured" : ""}`} onClick={() => onSelect(item.category)} key={item.category}>
              <span className="category-icon" aria-hidden="true">{item.icon}</span><strong>{item.title}</strong><small>{item.detail}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
