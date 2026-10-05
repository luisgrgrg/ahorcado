"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameButton } from "@/components/ui/game-button";
import { getGuestSession, updateGuestName } from "@/lib/session/guest-session";

export function SettingsScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      const session = getGuestSession();
      if (!session) router.replace("/"); else setName(session.displayName);
    });
    return () => { active = false; };
  }, [router]);

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const session = updateGuestName(name);
    setName(session.displayName); setSaved(true);
  };

  return (
    <main className="flow-page settings-page">
      <section className="flow-card settings-card" aria-labelledby="settings-title">
        <Link className="back-link" href="/inicio">← Volver al inicio</Link>
        <span className="eyebrow">Opciones</span><h1 id="settings-title">Configuración</h1>
        <form className="settings-form" onSubmit={save}>
          <label htmlFor="settings-name">Nombre del jugador</label>
          <input id="settings-name" value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} maxLength={32} required />
          <GameButton type="submit" disabled={!name.trim()}>Guardar nombre</GameButton>
          {saved ? <p className="inline-alert success" role="status">Nombre guardado para tus próximas salas.</p> : null}
        </form>
        <div className="settings-links">
          <Link href="/juego"><span aria-hidden="true">🎯</span><span><strong>Práctica individual</strong><small>Juega una ronda sin sala</small></span></Link>
          <Link href="/cuenta"><span aria-hidden="true">👤</span><span><strong>Cuenta</strong><small>Inicia sesión o crea una cuenta</small></span></Link>
          <Link href="/historial"><span aria-hidden="true">↗</span><span><strong>Historial</strong><small>Consulta tus partidas guardadas</small></span></Link>
        </div>
      </section>
    </main>
  );
}
