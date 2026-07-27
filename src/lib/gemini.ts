/**
 * Cliente mínimo para la API de Gemini (REST directa, sin SDK) — usado por
 * Balonazo Sangriento para generar el texto narrativo de cada número.
 * GEMINI_API_KEY debe estar en el entorno (server-only, nunca NEXT_PUBLIC_).
 */

const MODEL = "gemini-2.5-flash";

export async function generateText(prompt: string, temperature = 0.9): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no configurada");

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
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text.trim()) throw new Error("Gemini no devolvió texto");
  return text.trim();
}
