import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const cards = [
  { label: "Points liability", value: "124,500 pts", delta: "+4.2%" },
  { label: "Referral conversions", value: "86", delta: "+12" },
  { label: "Average order", value: "118 TND", delta: "-1.8%" },
];

export default async function AdminOverview({
  params,
}: {
  params: { locale: Locale };
}) {
  const dictionary = await getDictionary(params.locale);

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
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-amber-100/80 bg-white/80 p-5 dark:border-zinc-800 dark:bg-zinc-950/40"
          >
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-white">
              {card.value}
            </p>
            <p className="text-xs text-emerald-600">{card.delta}</p>
          </article>
        ))}
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
