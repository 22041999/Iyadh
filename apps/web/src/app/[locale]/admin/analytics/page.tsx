import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const chartData = [
  { label: "Mon", sales: 2400, points: 32000 },
  { label: "Tue", sales: 1800, points: 21000 },
  { label: "Wed", sales: 2900, points: 36000 },
  { label: "Thu", sales: 3200, points: 41000 },
  { label: "Fri", sales: 5100, points: 62000 },
  { label: "Sat", sales: 6800, points: 71000 },
];

export default async function AnalyticsPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const dictionary = await getDictionary(params.locale);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {dictionary.admin.analyticsCta}
        </h1>
        <p className="text-sm text-zinc-500">
          Aggregations land in `metrics_daily` via a scheduled Edge Function. Use these tiles to watch trends before promoting new campaigns.
        </p>
      </header>

      <section className="rounded-3xl border border-amber-100 bg-white/90 p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-600">
              Sales vs points
            </p>
            <div className="rounded-2xl border border-amber-50/70 bg-amber-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/70">
              <ul className="space-y-2 text-sm text-amber-900/80 dark:text-amber-50/80">
                {chartData.map((item) => (
                  <li key={item.label} className="flex items-center justify-between font-mono">
                    <span>{item.label}</span>
                    <span>
                      {item.sales} TND / {item.points} pts
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              Alert feed
            </p>
            <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
              <p>• Referral churn exceeded 8% in the last 7 days.</p>
              <p>• Honey booster promo ends in 3 days.</p>
              <p>• Outstanding points liability +6% WoW.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
