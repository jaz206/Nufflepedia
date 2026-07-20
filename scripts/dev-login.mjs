#!/usr/bin/env node
/**
 * SOLO PARA DESARROLLO LOCAL. Genera un enlace de acceso directo usando la
 * API de administracion de Supabase (no manda email, no cuenta para el
 * limite de correos). Usa la clave secreta -> nunca compartir este script
 * fuera de tu maquina ni subir capturas de su salida.
 *
 * Uso: node scripts/dev-login.mjs [email]
 */
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

function loadEnv(path) {
  const out = {};
  try {
    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match) out[match[1]] = match[2].trim();
    }
  } catch {
    // El archivo puede no existir, seguimos con lo que haya en el otro.
  }
  return out;
}

const env = { ...loadEnv(".env"), ...loadEnv(".env.local") };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = env.SUPABASE_SECRET_KEY;
const email = process.argv[2] || "webjaz@gmail.com";

if (!supabaseUrl || !secretKey) {
  console.error("Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env / .env.local");
  process.exit(1);
}

const res = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
  method: "POST",
  headers: {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "magiclink",
    email,
    options: { redirect_to: "http://localhost:3000/auth/callback" },
  }),
});

const data = await res.json();

if (!res.ok) {
  console.error("Error generando el enlace:", data);
  process.exit(1);
}

console.log(`Enlace de acceso (un solo uso) para ${email}:`);
console.log(data.action_link);
console.log("\nAbriendo en el navegador...");
execSync(`start "" "${data.action_link}"`, { shell: "cmd.exe" });
