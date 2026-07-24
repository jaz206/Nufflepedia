import { requireUser } from "@/server/auth/requireUser";
import Sidebar from "./Sidebar";

/**
 * Layout de la zona autenticada (Dashboard, Equipos, Competiciones, Pizarra,
 * Arena). requireUser() redirige a /login si no hay sesión — es el guard
 * de acceso pedido para estas rutas. La Nufflepedia se queda FUERA de este
 * grupo a propósito: MASTER_PLAN.md la marca como pública (gancho de
 * entrada sin cuenta), así que vive en su propio layout sin este guard.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
