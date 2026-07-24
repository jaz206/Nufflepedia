"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/nufflepedia", label: "La Biblioteca" },
  { href: "/equipos", label: "Equipos" },
  { href: "/competiciones", label: "Competiciones" },
  { href: "/pizarra", label: "Pizarra" },
  { href: "/arena", label: "Arena", badge: "Futuro" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 shrink-0 border-r px-3 py-6 hidden md:flex md:flex-col md:gap-1"
      style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
            {item.badge && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide"
                style={{
                  background: active ? "color-mix(in srgb, var(--accent-ink) 20%, transparent)" : "var(--surface-2)",
                  color: active ? "var(--accent-ink)" : "var(--ink-3)",
                }}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </aside>
  );
}
