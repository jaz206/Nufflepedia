"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/nufflepedia", label: "La Biblioteca" },
  { href: "/nufflepedia/tablas", label: "Tablas" },
  { href: "/equipos", label: "Equipos" },
  { href: "/competiciones", label: "Competiciones" },
  { href: "/pizarra", label: "Pizarra" },
  { href: "/arena", label: "Arena" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 shrink-0 border-r px-3 py-6 hidden md:flex md:flex-col md:gap-1"
      style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
    >
      {NAV_ITEMS.map((item) => {
        // Resalta solo la entrada más específica que coincide (evita que
        // "La Biblioteca" y "Tablas" se marquen ambas activas a la vez en
        // /nufflepedia/tablas, ya que una es prefijo de la otra).
        const matches = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
        const mostSpecific = NAV_ITEMS.filter((i) => matches(i.href)).sort((a, b) => b.href.length - a.href.length)[0];
        const active = matches(item.href) && mostSpecific?.href === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-[3px] px-3 py-2 text-sm transition-colors"
            style={{
              color: active ? "var(--accent-ink)" : "var(--ink-2)",
              background: active ? "var(--accent)" : "transparent",
              fontWeight: active ? 600 : 400,
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
