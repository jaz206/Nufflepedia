/**
 * Formaciones preestablecidas de la Pizarra Táctica: datos puros, no
 * código — a diferencia del prototipo anterior, que las tenía escritas a
 * mano dentro del componente. Coordenadas en casillas de la cuadrícula
 * (0-indexadas), listas para aplicar sobre los primeros N jugadores sin
 * colocar de la plantilla, en el orden en que aparezcan.
 */

export const GRID_COLS = 26;
export const GRID_ROWS = 15;

export interface FormationSlot {
  x: number;
  y: number;
}

export interface Formation {
  key: string;
  name: string;
  /** Casillas para el lado "mine" — hasta 11, más cerca de la mitad izquierda del campo. */
  slots: FormationSlot[];
}

// La línea de scrimmage cae en x=12/13 (centro de 26 columnas); "mine" juega
// hacia la izquierda, así que sus casillas quedan en x <= 12.
export const FORMATIONS: Formation[] = [
  {
    key: "defensa-estandar",
    name: "Defensa estándar",
    slots: [
      { x: 12, y: 4 },
      { x: 12, y: 6 },
      { x: 12, y: 7 },
      { x: 12, y: 8 },
      { x: 12, y: 10 },
      { x: 10, y: 2 },
      { x: 10, y: 12 },
      { x: 8, y: 5 },
      { x: 8, y: 9 },
      { x: 6, y: 3 },
      { x: 6, y: 11 },
    ],
  },
  {
    key: "ataque-jaula",
    name: "Ataque en jaula",
    slots: [
      { x: 12, y: 7 },
      { x: 11, y: 6 },
      { x: 11, y: 8 },
      { x: 10, y: 6 },
      { x: 10, y: 8 },
      { x: 9, y: 7 },
      { x: 7, y: 3 },
      { x: 7, y: 11 },
      { x: 5, y: 1 },
      { x: 5, y: 13 },
      { x: 3, y: 7 },
    ],
  },
  {
    key: "presion-lateral",
    name: "Presión lateral",
    slots: [
      { x: 12, y: 1 },
      { x: 12, y: 2 },
      { x: 12, y: 3 },
      { x: 12, y: 4 },
      { x: 12, y: 13 },
      { x: 10, y: 1 },
      { x: 10, y: 2 },
      { x: 9, y: 5 },
      { x: 8, y: 7 },
      { x: 6, y: 9 },
      { x: 6, y: 12 },
    ],
  },
];

export interface PlacedFormation<T> {
  playerId: T;
  x: number;
  y: number;
}

/** Aplica una formación sobre los primeros N ids de la lista, en orden — no reordena ni elige por puesto. */
export function applyFormation<T>(formation: Formation, playerIds: T[]): PlacedFormation<T>[] {
  const count = Math.min(formation.slots.length, playerIds.length);
  const placed: PlacedFormation<T>[] = [];
  for (let i = 0; i < count; i++) {
    placed.push({ playerId: playerIds[i], x: formation.slots[i].x, y: formation.slots[i].y });
  }
  return placed;
}

export function clampToGrid(x: number, y: number): FormationSlot {
  return {
    x: Math.min(Math.max(Math.round(x), 0), GRID_COLS - 1),
    y: Math.min(Math.max(Math.round(y), 0), GRID_ROWS - 1),
  };
}
