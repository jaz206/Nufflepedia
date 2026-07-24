import { resolveSkillInfo } from "@/lib/resolveSkillName";
import SkillPill from "@/components/SkillPill";

export interface SkillInfo {
  name: string;
  description: string;
  isElite?: boolean;
  /// Opcionales: solo los rellena el catálogo de MasterSkill (no MasterTrait),
  /// para pantallas que necesiten filtrar/elegir por clave o categoría
  /// (p.ej. la subida de nivel en El Cuartel).
  key?: string;
  category?: string;
}

/**
 * Fila de SkillPill a partir de una lista de nombres (display, no keys) y
 * el índice construido con `buildSkillInfoIndex`. Componente compartido:
 * úsalo en cualquier sitio que muestre habilidades de un jugador — El
 * Cuartel, el Heraldo de Nuffle, futuras fichas de equipo — en vez de
 * repetir el mapeo nombre→tooltip en cada pantalla.
 */
export default function SkillPillList({ names, index }: { names: string[]; index: Map<string, SkillInfo> }) {
  if (names.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {names.map((n) => {
        const info = resolveSkillInfo(n, index);
        return <SkillPill key={n} label={n} description={info?.description} elite={info?.isElite} />;
      })}
    </div>
  );
}
