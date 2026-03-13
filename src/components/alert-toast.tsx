"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";

export type AlertToast = {
  id: string;
  listingId: string;
  title: string;
  price: number;
  grade: string;
  discount: number;
};

export function Toast({
  alert,
  index,
  onDismiss,
}: {
  alert: AlertToast;
  index: number;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      dismiss();
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setExiting(true);
    setTimeout(() => onDismiss(alert.id), 300);
  }

  const borderColor =
    alert.grade === "A"
      ? "border-l-emerald-500"
      : "border-l-amber-500";

  const badgeBg =
    alert.grade === "A"
      ? "bg-emerald-500/10 text-emerald-400"
      : "bg-amber-500/10 text-amber-400";

  return (
    <div
      className={`relative w-80 bg-surface/95 backdrop-blur-lg border border-border-subtle ${borderColor} border-l-[3px] rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ease-out ${
        visible && !exiting
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
      style={{ marginTop: index > 0 ? 8 : 0 }}
    >
      <Link
        href={`/listing/${alert.listingId}`}
        className="block p-3 pr-8 hover:bg-surface-2/50 transition-colors"
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeBg}`}
          >
            Grado {alert.grade}
          </span>
          <span className="text-xs text-emerald-400 font-semibold font-mono">
            -{alert.discount}%
          </span>
        </div>
        <p className="text-sm font-medium text-foreground truncate">
          {alert.title}
        </p>
        <p
          className="text-xs text-muted font-mono mt-0.5"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          USD {alert.price.toLocaleString("es-UY")}
        </p>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dismiss();
        }}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
