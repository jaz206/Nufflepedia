import Link from "next/link";
import { requireUser } from "@/server/auth/requireUser";
import FaqAccordion from "./FaqAccordion";

interface Section {
  emoji: string;
  title: string;
  href: string;
  color: string;
  description: string;
}

const SECTIONS: Section[] = [
  {
    emoji: "📖",
    title: "La Biblioteca (Nufflepedia)",
    href: "/nufflepedia",
    color: "#8a5cf6",
    description:
      "Consulta rápida de reglas: 72 habilidades, 40 rasgos, las 29 razas oficiales y los 68 Jugadores Estrella. Es pública — puedes compartir el enlace con quien no tenga cuenta.",
  },
  {
    emoji: "🎲",
    title: "Tablas",
    href: "/nufflepedia/tablas",
    color: "#2f9e44",
    description:
      "Todas las tablas de dados en un solo sitio (Clima, Patada Inicial, Lesiones, Plegarias a Nuffle, Incentivos, Reglas especiales) — para consultarlas rápido en mesa sin bucear entre habilidades.",
  },
  {
    emoji: "🧾",
    title: "Secuencia de Partido",
    href: "/nufflepedia/partido",
    color: "#1971c2",
    description:
      "Chuleta paso a paso de un partido oficial: preparación, secuencia previa, inicio de entrada, turnos, final de entrada y final del partido. Para no saltarte nada mientras juegas.",
  },
  {
    emoji: "🏰",
    title: "El Cuartel (Equipos)",
    href: "/equipos",
    color: "#e8590c",
    description:
      "Aquí fundas y gestionas tus equipos: eliges raza, fichas jugadores, compras personal de banquillo (relanzamientos, animadoras, apotecario...) y subes de nivel gastando PE.",
  },
  {
    emoji: "🏟️",
    title: "La Arena (Competiciones)",
    href: "/competiciones",
    color: "#c92a2a",
    description:
      "Crea o únete a ligas y torneos. Las ligas generan calendario automático a doble vuelta; los torneos, cuadro de eliminatoria (con fase de grupos opcional). Cada equipo juega con una copia de su plantilla aislada solo para esa competición.",
  },
  {
    emoji: "⚔️",
    title: "Arena — Asistente de Partido en vivo",
    href: "/arena",
    color: "#ae3ec9",
    description:
      "Para amistosos sueltos: elige tu equipo y el rival (otro tuyo, el de un amigo con cuenta, o uno creado al vuelo) y lleva el partido en directo — marcador, turnos, Touchdowns, bajas y más, cada botón con una explicación para ir aprendiendo el reglamento.",
  },
  {
    emoji: "🗺️",
    title: "Pizarra",
    href: "/pizarra",
    color: "#495057",
    description: "Mesa táctica para dibujar y guardar jugadas. Todavía en construcción.",
  },
];

const FAQ = [
  {
    question: "¿Necesito crear una liga para jugar un partido suelto?",
    answer:
      "No — para eso está la Arena (Asistente de Partido en vivo, /arena). Sirve para amistosos sin tener que montar una liga o torneo entero.",
  },
  {
    question: "¿Qué pasa si mi amigo no tiene cuenta?",
    answer:
      'Puedes crear un equipo "invitado" para él al vuelo desde /arena/nuevo — eliges raza y nombre, montas su plantilla, y ya podéis jugar.',
  },
  {
    question: "¿Los resultados de un amistoso afectan a mi equipo real?",
    answer:
      "Sí — a diferencia de una competición (que usa una copia aislada de la plantilla), un amistoso terminado aplica los PE, lesiones y demás cambios directamente a tu equipo de El Cuartel.",
  },
  {
    question: "¿Puedo dejar un partido a medias y seguir otro día?",
    answer:
      "Sí. Todo se va guardando mientras juegas, así que puedes cerrar la pestaña y retomarlo más tarde desde el Dashboard o desde /arena.",
  },
  {
    question: "¿Por qué la app no tira los dados por mí?",
    answer:
      "Es a propósito: sigues jugando con tus dados físicos en la mesa. La app te dice qué tirada toca y solo registra el resultado que tú ya has decidido.",
  },
  {
    question: "¿Sirve para jugar sin tablero ni miniaturas?",
    answer:
      "Hoy no — está pensada como ayudante mientras juegas en mesa con miniaturas, no como sustituto del tablero.",
  },
];

export default async function GuiaPage() {
  await requireUser();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Guía de la app</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-3)" }}>
          Qué es cada apartado del menú y para qué sirve.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-[3px] border-t-4 border-x border-b p-4 transition-colors"
            style={{ borderTopColor: s.color, borderColor: "var(--border)", background: "var(--surface-1)" }}
          >
            <p className="font-semibold" style={{ color: s.color }}>
              {s.emoji} {s.title}
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>
              {s.description}
            </p>
          </Link>
        ))}
      </div>

      <section className="rounded-[3px] border p-5" style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}>
        <h2 className="mb-3 text-lg font-semibold">Preguntas frecuentes</h2>
        <FaqAccordion items={FAQ} />
      </section>
    </div>
  );
}
