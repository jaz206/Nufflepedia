"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        required
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 outline-none focus:border-zinc-500"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-lg bg-foreground px-4 py-3 text-background font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] disabled:opacity-50"
      >
        {status === "sending" ? "Enviando..." : "Enviarme un enlace de acceso"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </form>
  );
}
