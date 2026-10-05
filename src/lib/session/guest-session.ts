import type { PlayerSession } from "@/domain/player/player.types";

const GUEST_KEY = "hangman.guest";

export function createGuestName(): string {
  return `Jugador ${100 + Math.floor(Math.random() * 900)}`;
}

export function startGuestSession(displayName = createGuestName()): PlayerSession {
  const session: PlayerSession = { mode: "guest", userId: null, displayName, email: null };
  window.localStorage.setItem(GUEST_KEY, JSON.stringify(session));
  return session;
}

export function getGuestSession(): PlayerSession | null {
  const raw = window.localStorage.getItem(GUEST_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as PlayerSession;
    return session.mode === "guest" && typeof session.displayName === "string" ? session : null;
  } catch {
    window.localStorage.removeItem(GUEST_KEY);
    return null;
  }
}

export function updateGuestName(displayName: string): PlayerSession {
  return startGuestSession(displayName.trim().slice(0, 32) || createGuestName());
}

export function clearGuestSession(): void {
  window.localStorage.removeItem(GUEST_KEY);
}
