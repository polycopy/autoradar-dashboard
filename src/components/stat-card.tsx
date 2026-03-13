import { type LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-5 transition-all duration-300 ${
        accent
          ? "bg-gradient-to-br from-accent/10 via-surface to-surface border border-accent/20 card-glow"
          : "bg-surface border border-border-subtle hover:border-border"
      }`}
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted font-medium mb-2.5">
            {label}
          </p>
          <p
            className={`text-3xl font-bold tracking-tight ${accent ? "text-accent" : "text-foreground"}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {value}
          </p>
          {sub && <p className="text-xs text-muted mt-1.5">{sub}</p>}
        </div>
        {Icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              accent
                ? "bg-accent/10 border border-accent/20"
                : "bg-surface-2 border border-border-subtle"
            }`}
          >
            <Icon className={`w-[18px] h-[18px] ${accent ? "text-accent" : "text-muted"}`} />
          </div>
        )}
      </div>
      {accent && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      )}
    </div>
  );
}
