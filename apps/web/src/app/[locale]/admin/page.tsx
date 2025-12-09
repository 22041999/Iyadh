import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { weeklyMetrics, liabilitySnapshot, referralLeaderboard } from "@/data/analytics";
import { MetricCard } from "@/components/metric-card";
import MiniSparkline from "@/components/mini-sparkline";

export default async function AdminOverview({
  params,
}: {
  params: { locale: Locale };
}) {
  const dictionary = await getDictionary(params.locale);
  const totalSales = weeklyMetrics.reduce((sum, day) => sum + day.salesTnd, 0);
  const totalConversions = referralLeaderboard.reduce((sum, entry) => sum + entry.conversions, 0);
  const avgOrder = Math.round(totalSales / (weeklyMetrics.length * 18)) * 18 + 112; // heuristic for demo feel
  const pointSeries = weeklyMetrics.map((day) => day.pointsIssued);
  const salesSeries = weeklyMetrics.map((day) => day.salesTnd);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {dictionary.admin.title}
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400">
          {dictionary.admin.description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Points liability"
          value={`${liabilitySnapshot.outstandingPoints.toLocaleString()} pts`}
          delta={`${(liabilitySnapshot.weekOverWeek * 100).toFixed(1)}% WoW`}
          tone={liabilitySnapshot.weekOverWeek >= 0 ? "positive" : "negative"}
        >
          <MiniSparkline data={pointSeries} />
        </MetricCard>
        <MetricCard
          label="Referral conversions"
          value={totalConversions.toString()}
          delta={`Top affiliate: ${referralLeaderboard[0].affiliate}`}
          tone="positive"
        >
          <MiniSparkline data={referralLeaderboard.map((entry) => entry.conversions)} stroke="#0ea5e9" fill="rgba(14,165,233,0.12)" />
        </MetricCard>
        <MetricCard
          label="Weekly sales"
          value={`${totalSales.toLocaleString()} TND`}
          delta={`Avg order ≈ ${avgOrder} TND`}
          tone="neutral"
        >
          <MiniSparkline data={salesSeries} stroke="#16a34a" fill="rgba(22,163,74,0.12)" />
        </MetricCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-amber-100 bg-amber-50/60 p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            Rule publication timeline
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-amber-900/80 dark:text-amber-50/80">
            <li>• 05 Dec · Holiday booster · 1.3x points on honey.</li>
            <li>• 28 Nov · Loyalty cap increased to 40% per order.</li>
            <li>• 18 Nov · Referral welcome discount switched to 25 TND.</li>
          </ul>
        </section>
        <section className="rounded-2xl border border-zinc-100 bg-white/80 p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Upcoming experiments
          </h2>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Configure A/B cohorts directly in Supabase via the business rules table. Each publish increments the version history for auditing.
          </p>
        </section>
      </div>
    </div>
  );
}
