import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import {
  weeklyMetrics,
  referralLeaderboard,
  liabilitySnapshot,
} from "@/data/analytics";
import { MetricCard } from "@/components/metric-card";
import MiniSparkline from "@/components/mini-sparkline";

type AnalyticsPageProps = {
  params: Promise<{ locale: Locale }>;
};

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const resolvedParams = await params;
  const dictionary = await getDictionary(resolvedParams.locale);
  const issuedSeries = weeklyMetrics.map((point) => point.pointsIssued);
  const redeemedSeries = weeklyMetrics.map((point) => point.pointsRedeemed);
  const bestDay = weeklyMetrics.reduce((top, point) =>
    point.salesTnd > top.salesTnd ? point : top
  );
  const redemptionRate =
    weeklyMetrics.reduce((sum, point) => sum + point.pointsRedeemed, 0) /
    weeklyMetrics.reduce((sum, point) => sum + point.pointsIssued, 0);

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

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Outstanding liability"
          value={`${liabilitySnapshot.liabilityTnd.toLocaleString()} TND`}
          delta={`${(liabilitySnapshot.weekOverWeek * 100).toFixed(1)}% WoW`}
          tone={liabilitySnapshot.weekOverWeek >= 0 ? "positive" : "negative"}
        >
          <MiniSparkline data={issuedSeries} />
        </MetricCard>
        <MetricCard
          label="Issued vs redeemed"
          value={`${(redemptionRate * 100).toFixed(1)}% redeemed`}
          delta="Healthy when under 80%"
          tone={redemptionRate < 0.8 ? "positive" : "negative"}
        >
          <div className="flex gap-3">
            <MiniSparkline data={issuedSeries} stroke="#f97316" fill="rgba(249,115,22,0.12)" />
            <MiniSparkline data={redeemedSeries} stroke="#6366f1" fill="rgba(99,102,241,0.12)" />
          </div>
        </MetricCard>
        <MetricCard
          label="Peak day"
          value={`${bestDay.date} · ${bestDay.salesTnd} TND`}
          delta={`${bestDay.pointsIssued.toLocaleString()} pts issued`}
        />
      </section>

      <section className="rounded-3xl border border-amber-100 bg-white/90 p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-600">
              Sales vs points
            </p>
            <div className="rounded-2xl border border-amber-50/70 bg-amber-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/70">
              <ul className="space-y-2 text-sm text-amber-900/80 dark:text-amber-50/80">
                {weeklyMetrics.map((item) => (
                  <li key={item.date} className="flex items-center justify-between font-mono">
                    <span>{item.date}</span>
                    <span>
                      {item.salesTnd} TND / {item.pointsIssued} pts
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

      <section className="rounded-3xl border border-amber-100 bg-white/90 p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-600">
          Referral leaderboard
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-100 text-sm dark:divide-zinc-800">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-zinc-500">
                <th className="py-3">Affiliate</th>
                <th className="py-3">Conversions</th>
                <th className="py-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50 dark:divide-zinc-800">
              {referralLeaderboard.map((entry) => (
                <tr key={entry.affiliate} className="text-zinc-800 dark:text-zinc-100">
                  <td className="py-3 font-medium">{entry.affiliate}</td>
                  <td className="py-3">{entry.conversions}</td>
                  <td className="py-3">{entry.revenueTnd.toLocaleString()} TND</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
