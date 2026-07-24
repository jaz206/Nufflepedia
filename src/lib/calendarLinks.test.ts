import { describe, expect, it } from "vitest";
import { googleCalendarUrl, icsFileContent } from "./calendarLinks";

describe("googleCalendarUrl", () => {
  it("genera una URL de Google Calendar con fechas en formato UTC básico", () => {
    const url = googleCalendarUrl({
      title: "Beer Teams vs bosquecityos",
      startsAt: new Date("2026-08-01T18:00:00.000Z"),
    });
    expect(url).toContain("https://calendar.google.com/calendar/render?");
    expect(url).toContain("text=Beer+Teams");
    expect(url).toContain("dates=20260801T180000Z%2F20260801T200000Z");
  });
});

describe("icsFileContent", () => {
  it("genera un .ics válido con las fechas de inicio y fin", () => {
    const ics = icsFileContent({
      title: "Final del torneo",
      startsAt: new Date("2026-08-01T18:00:00.000Z"),
      durationMinutes: 90,
    });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("SUMMARY:Final del torneo");
    expect(ics).toContain("DTSTART:20260801T180000Z");
    expect(ics).toContain("DTEND:20260801T193000Z");
    expect(ics).toContain("END:VCALENDAR");
  });
});
