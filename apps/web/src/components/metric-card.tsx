type MetricCardProps = {
  label: string;
  value: string;
  delta?: string;
  tone?: "positive" | "negative" | "neutral";
  children?: React.ReactNode;
};

const toneClassMap: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  positive: "text-emerald-600 dark:text-emerald-400",
  negative: "text-rose-600 dark:text-rose-400",
  neutral: "text-zinc-500 dark:text-zinc-400",
};

export function MetricCard({ label, value, delta, tone = "neutral", children }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-amber-100/60 bg-white/85 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-white">{value}</p>
      {delta && <p className={`text-xs ${toneClassMap[tone]}`}>{delta}</p>}
      {children && <div className="mt-4">{children}</div>}
    </article>
  );
}
