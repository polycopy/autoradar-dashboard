"use client";

interface DealScoreProps {
  discount: number;
  grade: string;
  compact?: boolean;
}

function scoreColor(grade: string) {
  switch (grade) {
    case "A":
      return {
        bar: "bg-gradient-to-r from-emerald-500 to-emerald-400",
        track: "bg-emerald-500/10 dark:bg-emerald-500/5",
        text: "text-emerald-600 dark:text-emerald-400",
        badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      };
    case "B":
      return {
        bar: "bg-gradient-to-r from-amber-500 to-amber-400",
        track: "bg-amber-500/10 dark:bg-amber-500/5",
        text: "text-amber-600 dark:text-amber-400",
        badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      };
    case "C":
      return {
        bar: "bg-gradient-to-r from-zinc-400 to-zinc-300 dark:from-zinc-500 dark:to-zinc-400",
        track: "bg-zinc-500/10 dark:bg-zinc-500/5",
        text: "text-zinc-500 dark:text-zinc-400",
        badge: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
      };
    default:
      return {
        bar: "bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-500",
        track: "bg-gray-500/10 dark:bg-gray-500/5",
        text: "text-gray-400 dark:text-gray-500",
        badge: "bg-gray-500/10 text-gray-500 dark:text-gray-500 border-gray-500/20",
      };
  }
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Excelente oportunidad";
  if (score >= 60) return "Buena oportunidad";
  if (score >= 40) return "Oportunidad moderada";
  return "Por debajo del mercado";
}

export function DealScore({ discount, grade, compact = false }: DealScoreProps) {
  const score = Math.min(100, Math.round(discount * 2.5));
  const colors = scoreColor(grade);
  const pct = Math.max(0, Math.min(100, score));

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`relative w-20 h-1.5 rounded-full overflow-hidden ${colors.track}`}>
          <div
            className={`absolute inset-y-0 left-0 rounded-full ${colors.bar} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className={`text-xs font-semibold tabular-nums ${colors.text}`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {score}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
          Deal Score
        </span>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${colors.badge}`}
        >
          Grado {grade}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className={`relative flex-1 h-2 rounded-full overflow-hidden ${colors.track}`}>
          <div
            className={`absolute inset-y-0 left-0 rounded-full ${colors.bar} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className={`text-sm font-bold tabular-nums ${colors.text}`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {score}/100
        </span>
      </div>

      <p className={`text-xs ${colors.text}`}>
        {scoreLabel(score)}
      </p>
    </div>
  );
}
