/**
 * Tabla de Clima (2D6). Transcrita desde COMPENDIO 2025 Third Season + NAF.pdf.
 */
export interface WeatherEntry {
  /** Rango de la suma de 2D6 que activa este resultado. */
  min: number;
  max: number;
  name: string;
  effect: string;
}

export const WEATHER_TABLE: WeatherEntry[] = [
  {
    min: 2,
    max: 2,
    name: "Calor Asfixiante",
    effect:
      "Al final de cada entrada en la que esta condición climatológica esté activa, un Entrenador tira 1D3 y a continuación cada Entrenador determina al azar ese mismo número de jugadores de su equipo que estuvieran en el campo cuando terminó la entrada. Dichos jugadores son colocados en la zona de Reservas de su equipo y no podrán ser desplegados en la siguiente entrada.",
  },
  { min: 3, max: 3, name: "Muy Soleado", effect: "Aplica un modificador de -1 a todos los chequeos de Pase." },
  { min: 4, max: 10, name: "Clima Perfecto", effect: "¡Un ambiente perfecto para jugar al Blood Bowl!" },
  {
    min: 11,
    max: 11,
    name: "Lluvioso",
    effect: "Aplica un modificador de -1 a las tiradas para intentar atrapar o recoger el balón, o para intentar interceptar una acción de Pase.",
  },
  {
    min: 12,
    max: 12,
    name: "Ventisca",
    effect:
      "Aplica un modificador de -1 a los intentos de forzar la marcha. Además, cuando un jugador realice una acción de Pase, solo podrá intentar hacer un Pase rápido o un Pase corto.",
  },
];

export function resolveWeather(sum2d6: number): WeatherEntry {
  const entry = WEATHER_TABLE.find((e) => sum2d6 >= e.min && sum2d6 <= e.max);
  if (!entry) {
    throw new Error(`Resultado de clima fuera de rango: ${sum2d6}`);
  }
  return entry;
}
