/**
 * Enlaces de calendario sin pedir ningún permiso nuevo de Google: un
 * enlace "Añadir a Google Calendar" (URL pública de Google, no necesita
 * OAuth) y un archivo .ics descargable que sirve para Google, Outlook o
 * Apple Calendar. Deliberadamente NO se integra con la API de Google
 * Calendar (eso pediría un scope de escritura sobre el calendario del
 * usuario y guardar/renovar sus tokens — coste y riesgo que no compensan
 * frente a un enlace que ya hace el 90% del trabajo).
 */

interface CalendarEventInput {
  title: string;
  description?: string;
  startsAt: Date;
  durationMinutes?: number;
}

function formatUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function googleCalendarUrl({ title, description, startsAt, durationMinutes = 120 }: CalendarEventInput): string {
  const end = new Date(startsAt.getTime() + durationMinutes * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatUtc(startsAt)}/${formatUtc(end)}`,
    details: description ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function icsFileContent({ title, description, startsAt, durationMinutes = 120 }: CalendarEventInput & { uid?: string }): string {
  const end = new Date(startsAt.getTime() + durationMinutes * 60_000);
  const uid = `${startsAt.getTime()}-${Math.random().toString(36).slice(2)}@blood-bowl-manager`;
  const escape = (s: string) => s.replace(/[,;]/g, "\\$&").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Blood Bowl Manager//ES",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatUtc(startsAt)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:${escape(title)}`,
    description ? `DESCRIPTION:${escape(description)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
