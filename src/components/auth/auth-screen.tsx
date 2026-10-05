"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { GameButton } from "@/components/ui/game-button";
import { AuthService } from "@/lib/auth/auth.service";
import Link from "next/link";
import { startGuestSession } from "@/lib/session/guest-session";

const authService = new AuthService();

export function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const authAvailable = authService.isAvailable();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signUp") {
        const result = await authService.signUp({ email, password, displayName });
        if (result.needsConfirmation) {
          setMessage("Cuenta creada. Revisa tu correo para confirmar el acceso.");
        } else {
          startGuestSession(displayName.trim() || email.split("@")[0] || "Jugador");
          router.push("/inicio");
        }
      } else {
        const session = await authService.signIn({ email, password });
        startGuestSession(session.displayName);
        router.push("/inicio");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible completar el acceso.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-hero" aria-labelledby="welcome-title">
        <div className="auth-illustration" aria-hidden="true">
          <span className="auth-spark one">✦</span><span className="auth-spark two">★</span><span className="auth-letter">A</span>
        </div>
        <Link className="back-link" href="/configuracion">← Volver a configuración</Link>
        <span className="eyebrow">Función opcional</span>
        <h1 id="welcome-title">Guarda tu<br />aventura.</h1>
        <p>No necesitas una cuenta para jugar. Inicia sesión solo si quieres conservar tu identidad e historial.</p>
      </section>

      <section className="auth-card" aria-labelledby="auth-title">
        <span className="dialog-kicker">{mode === "signIn" ? "Qué bueno verte" : "Nueva aventura"}</span>
        <h2 id="auth-title">{mode === "signIn" ? "Iniciar sesión" : "Crear cuenta"}</h2>
        <p>{mode === "signIn" ? "Continúa donde dejaste tu última partida." : "Guarda resultados e historial con lo esencial."}</p>
        <form onSubmit={submit} className="auth-form">
          {mode === "signUp" ? <label>Nombre del jugador<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={32} required autoComplete="nickname" /></label> : null}
          <label>Correo<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
          <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required autoComplete={mode === "signIn" ? "current-password" : "new-password"} /></label>
          {!authAvailable ? <p className="inline-alert">El acceso con cuenta se habilitará al configurar Supabase. El modo invitado ya está disponible.</p> : null}
          {error ? <p className="inline-alert error" role="alert">{error}</p> : null}
          {message ? <p className="inline-alert success" role="status">{message}</p> : null}
          <GameButton type="submit" disabled={!authAvailable || busy}>{busy ? "Procesando…" : mode === "signIn" ? "Iniciar sesión" : "Crear cuenta"}</GameButton>
        </form>
        <button className="auth-switch" type="button" onClick={() => { setMode(mode === "signIn" ? "signUp" : "signIn"); setError(null); setMessage(null); }}>
          {mode === "signIn" ? "¿Primera vez? Crear cuenta" : "Ya tengo cuenta"}
        </button>
      </section>
    </main>
  );
}
