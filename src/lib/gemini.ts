/**
 * Cliente mínimo para la API de Gemini (REST directa, sin SDK) — usado por
 * Balonazo Sangriento para generar el texto narrativo de cada número.
 * GEMINI_API_KEY debe estar en el entorno (server-only, nunca NEXT_PUBLIC_).
 */

const MODEL = "gemini-2.5-flash";
const MAX_RETRIES = 4;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Cuota gratuita: 5 peticiones/minuto. Reintenta con el "retryDelay" que sugiere la propia API, o backoff exponencial si no viene. */
function retryDelayMs(status: number, bodyText: string, attempt: number): number | null {
  if (status !== 429) return null;
  const match = bodyText.match(/"retryDelay":\s*"(\d+)s"/);
  if (match) return (Number.parseInt(match[1], 10) + 1) * 1000;
  return 2 ** attempt * 5_000;
}

export async function generateText(prompt: string, temperature = 0.9): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no configurada");

  let lastError = "";
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature },
        }),
      }
    );
    if (res.ok) {
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      if (!text.trim()) throw new Error("Gemini no devolvió texto");
      return text.trim();
    }

    const bodyText = await res.text();
    lastError = `Gemini API error ${res.status}: ${bodyText}`;
    const delay = retryDelayMs(res.status, bodyText, attempt);
    if (delay === null || attempt === MAX_RETRIES) break;
    await sleep(delay);
  }
  throw new Error(lastError);
}
