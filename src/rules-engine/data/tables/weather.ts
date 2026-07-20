/**
 * Tabla de Clima (2D6). Portada desde CODEX_REGLAS_S3.md.
 */
export interface WeatherEntry {
  /** Rango de la suma de 2D6 que activa este resultado. */
  min: number;
  max: number;
  name: string;
  effect: string;
}

export const WEATHER_TABLE: WeatherEntry[] = [
  { min: 2, max: 2, name: "Calor Sofocante", effect: "Tirada de desmayo al final de cada drive." },
  { min: 3, max: 3, name: "Muy Soleado", effect: "-1 a las tiradas de Pase." },
  { min: 4, max: 10, name: "Clima Perfecto", effect: "Sin efectos." },
  { min: 11, max: 11, name: "Lluvia Intensa", effect: "-1 a Atrapar, Interceptar y Recoger el balón." },
  { min: 12, max: 12, name: "Ventisca", effect: "-1 a Forzar la Marcha (GFI); solo se permiten pases cortos." },
];

export function resolveWeather(sum2d6: number): WeatherEntry {
  const entry = WEATHER_TABLE.find((e) => sum2d6 >= e.min && sum2d6 <= e.max);
  if (!entry) {
    throw new Error(`Resultado de clima fuera de rango: ${sum2d6}`);
  }
  return entry;
}
