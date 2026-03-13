"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radar, TrendingUp, Calculator, Car, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { GlobalSearch } from "./global-search";

const nav = [
  { href: "/", label: "Oportunidades", icon: Radar },
  { href: "/market", label: "Mercado", icon: TrendingUp },
  { href: "/valuator", label: "Valuador", icon: Calculator },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent scroll when open on mobile
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Mobile header bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border-subtle flex items-center justify-between px-4 z-50 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Car className="w-4 h-4 text-accent" />
          </div>
          <span
            className="text-base font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            AutoRadar
          </span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 w-64 bg-surface border-r border-border-subtle flex flex-col z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border-subtle">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Car className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1
                className="text-lg font-bold tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                AutoRadar
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium">
                Intel de Mercado
              </p>
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="px-4 pt-4 pb-2">
          <GlobalSearch />
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-muted hover:text-foreground hover:bg-surface-2 border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Status */}
        <div className="p-4 border-t border-border-subtle">
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-accent pulse-live" />
            <span className="text-xs text-muted">Scraper activo</span>
          </div>
          <div className="px-3 mt-1">
            <span
              className="text-[10px] text-muted/60 font-mono"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              v0.1.0 — Uruguay
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
