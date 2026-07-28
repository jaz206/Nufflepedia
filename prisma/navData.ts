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
  { key: "biblioteca", href: "/nufflepedia", label: "La Biblioteca", sortOrder: 1 },
  { key: "tablas", href: "/nufflepedia/tablas", label: "Tablas", sortOrder: 2 },
  { key: "secuencia-partido", href: "/nufflepedia/partido", label: "Secuencia de Partido", sortOrder: 3 },
  { key: "equipos", href: "/equipos", label: "Equipos", sortOrder: 4 },
  { key: "competiciones", href: "/competiciones", label: "Competiciones Amateur", sortOrder: 5 },
  { key: "torneos-presenciales", href: "/torneos-presenciales", label: "Torneos Presenciales", sortOrder: 6 },
  { key: "pizarra", href: "/pizarra", label: "Pizarra", sortOrder: 7 },
  { key: "arena", href: "/arena", label: "Arena", sortOrder: 8 },
  { key: "guia", href: "/guia", label: "❓ Guía", sortOrder: 9 },
];
