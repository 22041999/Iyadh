import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

const rulePresets = [
  {
    title: "Base earn",
    expression: "subtotal_tnd * 0.08",
    audience: "All customers",
  },
  {
    title: "Referral boost",
    expression: "order_total * 0.15",
    audience: "Affiliates",
  },
];

export default async function RulesStudio({
  params,
}: {
  params: { locale: Locale };
}) {
  const dictionary = await getDictionary(params.locale);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {dictionary.admin.rulesCta}
        </h1>
        <p className="text-sm text-zinc-500">
          Compose JSON definitions that map directly to the `business_rules` table and feed the Supabase Edge Function.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-amber-100 bg-white/80 p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Active rules
          </h2>
          <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
            {rulePresets.map((rule) => (
              <li key={rule.title} className="rounded-xl border border-amber-50/80 p-4 dark:border-zinc-800">
                <p className="text-base font-semibold text-zinc-900 dark:text-white">
                  {rule.title}
                </p>
                <p className="mt-1 font-mono text-xs text-amber-700 dark:text-amber-200">
                  {rule.expression}
                </p>
                <p className="mt-2 text-xs uppercase tracking-wide text-zinc-400">
                  {rule.audience}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-4 rounded-2xl border border-zinc-100 bg-zinc-950/90 p-6 text-zinc-100">
          <h2 className="text-lg font-semibold">Draft configuration</h2>
          <div className="rounded-xl bg-black/40 p-4 font-mono text-xs leading-6">
            {`{
  "point_value": { "tnd_per_point": 0.1 },
  "earn_rules": [
    { "id": "honey-boost", "event": "purchase.completed", "expression": "subtotal_tnd * 0.12", "target": "customer" }
  ]
}`}
          </div>
          <button className="w-full rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400">
            Validate & publish to Supabase
          </button>
        </section>
      </div>
    </div>
  );
}
