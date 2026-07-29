import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import Sidebar from "./Sidebar";

/**
 * Layout de la zona autenticada (Dashboard, Mis Equipos, Torneos y Ligas
 * Locales, Torneos NAF, Pizarra Táctica, Asistente de Partido).
 * requireUser() redirige a /login si no hay sesión — es el guard de acceso
 * pedido para estas rutas. La Nufflepedia se queda FUERA de este grupo a
 * propósito: MASTER_PLAN.md la marca como pública (gancho de entrada sin
 * cuenta), así que vive en su propio layout sin este guard.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const navItems = await prisma.masterNavItem.findMany({ orderBy: { sortOrder: "asc" }, select: { href: true, label: true } });

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar items={navItems} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
