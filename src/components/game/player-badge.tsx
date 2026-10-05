interface PlayerBadgeProps {
  readonly name: string;
  readonly mode: "guest" | "authenticated";
}

export function PlayerBadge({ name, mode }: PlayerBadgeProps) {
  return (
    <div className="player-badge" aria-label={`Jugador actual: ${name}`}>
      <span className="avatar" aria-hidden="true">★</span>
      <span><small>{mode === "guest" ? "Invitado" : "Jugador"}</small><strong>{name}</strong></span>
    </div>
  );
}
