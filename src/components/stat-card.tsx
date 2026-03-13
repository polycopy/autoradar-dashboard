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
    <div className="bg-surface border border-border-subtle rounded-xl p-5 relative overflow-hidden group hover:border-border transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted font-medium mb-2">
            {label}
          </p>
          <p
            className={`text-2xl font-bold tracking-tight ${accent ? "text-accent" : "text-foreground"}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {value}
          </p>
          {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-surface-2 border border-border-subtle flex items-center justify-center">
            <Icon className="w-4 h-4 text-muted" />
          </div>
        )}
      </div>
      {accent && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      )}
    </div>
  );
}
