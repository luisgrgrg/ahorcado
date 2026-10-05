import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "secondary";
}

export function GameButton({ variant = "primary", className = "", children, ...props }: PropsWithChildren<GameButtonProps>) {
  return <button className={`game-button ${variant} ${className}`.trim()} {...props}>{children}</button>;
}
