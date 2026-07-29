/**
 * Semilla de las entradas del menú lateral — solo el texto de cada una es
 * editable desde /admin/menu (href y orden se quedan fijos aquí para no
 * poder romper la navegación). Ver src/app/(app)/Sidebar.tsx.
 */

export interface NavItemSeed {
  key: string;
  href: string;
  label: string;
  sortOrder: number;
}

export const NAV_ITEMS: NavItemSeed[] = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard", sortOrder: 0 },
  { key: "biblioteca", href: "/nufflepedia", label: "Biblioteca de Reglas", sortOrder: 1 },
  { key: "tablas", href: "/nufflepedia/tablas", label: "Tablas de Tiradas", sortOrder: 2 },
  { key: "secuencia-partido", href: "/nufflepedia/partido", label: "Secuencia de Partido", sortOrder: 3 },
  { key: "equipos", href: "/equipos", label: "Mis Equipos", sortOrder: 4 },
  { key: "competiciones", href: "/competiciones", label: "Torneos y Ligas Locales", sortOrder: 5 },
  { key: "torneos-presenciales", href: "/torneos-presenciales", label: "Torneos NAF", sortOrder: 6 },
  { key: "pizarra", href: "/pizarra", label: "Pizarra Táctica", sortOrder: 7 },
  { key: "arena", href: "/arena", label: "Asistente de Partido", sortOrder: 8 },
  { key: "guia", href: "/guia", label: "❓ Guía y Ayuda", sortOrder: 9 },
];
