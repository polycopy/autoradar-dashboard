export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatKm(km: number): string {
  if (km >= 1000) return `${Math.round(km / 1000)}k km`;
  return `${km} km`;
}

export function timeAgo(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`;
  return `hace ${Math.floor(diff / 604800)}sem`;
}

export function gradeColor(grade: string): string {
  switch (grade) {
    case "A":
      return "text-emerald-700 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-400/30";
    case "B":
      return "text-amber-700 bg-amber-500/10 border-amber-500/30 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/30";
    case "C":
      return "text-zinc-600 bg-zinc-500/10 border-zinc-500/30 dark:text-zinc-400 dark:bg-zinc-400/10 dark:border-zinc-400/30";
    default:
      return "text-zinc-500 bg-zinc-400/10 border-zinc-400/30 dark:text-zinc-600 dark:bg-zinc-600/10 dark:border-zinc-600/30";
  }
}

export function discountToGrade(
  discountPct: number,
  marginUsd: number,
): string {
  if (discountPct >= 30 && marginUsd >= 1500) return "A";
  if (discountPct >= 20 && marginUsd >= 800) return "B";
  if (discountPct >= 10 && marginUsd > 200) return "C";
  return "D";
}
