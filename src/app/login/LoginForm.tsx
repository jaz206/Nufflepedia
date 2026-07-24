"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [oauthLoading, setOauthLoading] = useState(false);

  async function handleGoogleSignIn() {
    setOauthLoading(true);
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    // Si signInWithOAuth funciona, el navegador ya está siendo redirigido a
    // Google; solo llegamos aquí si algo falló antes de esa redirección.
    if (error) {
      setOauthLoading(false);
      setStatus("error");
      setErrorMessage(error.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <p className="text-center text-zinc-500">
        Te hemos enviado un enlace a <strong>{email}</strong>. Ábrelo desde este
        mismo dispositivo para entrar.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={oauthLoading}
        className="btn-secondary flex items-center justify-center gap-3 py-3 disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z" />
          <path fill="#FBBC05" d="M3.95 10.7a5.4 5.4 0 0 1 0-3.4V4.97H.96a9 9 0 0 0 0 8.06l2.99-2.33Z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58Z" />
        </svg>
        {oauthLoading ? "Conectando…" : "Continuar con Google"}
      </button>

      <div className="flex items-center gap-3 text-xs text-zinc-500 uppercase tracking-wide">
        <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
        o por correo
        <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
        <button type="submit" disabled={status === "sending"} className="btn-primary py-3">
          {status === "sending" ? "Enviando..." : "Enviarme un enlace de acceso"}
        </button>
      </form>

      {status === "error" && <p className="text-sm text-red-500">{errorMessage}</p>}
    </div>
  );
}
