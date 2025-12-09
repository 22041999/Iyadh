import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { previewRewards } from "@/actions/reward-preview";
import RewardPreviewCard from "@/components/reward-preview-card";

type SitePageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function SiteHome({ params }: SitePageProps) {
  const resolvedParams = await params;
  const dictionary = await getDictionary(resolvedParams.locale);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16">
      <section className="grid gap-8 rounded-3xl bg-white/90 p-10 shadow-lg shadow-amber-100 dark:bg-zinc-900/60 dark:shadow-none lg:grid-cols-2">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-600">
            {resolvedParams.locale === "ar" ? "منتجات بيولوجية" : "Bio products"}
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
            {dictionary.hero.title}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300">
            {dictionary.hero.subtitle}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href={`/${resolvedParams.locale}/catalog`}
              className="inline-flex items-center justify-center rounded-full bg-amber-600 px-6 py-3 text-base font-semibold text-white shadow-sm shadow-amber-300/50 transition hover:bg-amber-500"
            >
              {dictionary.hero.primaryCta}
            </Link>
            <Link
              href={`/${resolvedParams.locale}/dashboard`}
              className="inline-flex items-center justify-center rounded-full border border-amber-200 px-6 py-3 text-base font-semibold text-amber-700 transition hover:border-amber-400 hover:text-amber-900"
            >
              {dictionary.hero.secondaryCta}
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100 p-6 dark:from-zinc-800 dark:to-zinc-900">
          <div className="space-y-4 text-sm text-amber-900 dark:text-amber-100">
            <p className="font-semibold uppercase tracking-wide">
              {dictionary.nav.catalog}
            </p>
            <ul className="space-y-3 text-base text-amber-950/80 dark:text-amber-50/80">
              <li>🍯 Miel de thym · 48 TND</li>
              <li>🫒 Huile d&apos;olive extra vierge · 72 TND</li>
              <li>🌿 Sérum figue de barbarie · 110 TND</li>
            </ul>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {dictionary.highlights.referral}
            </p>
          </div>
        </div>
      </section>

      <RewardPreviewCard
        action={previewRewards}
        title={dictionary.hero.previewTitle}
        description={dictionary.hero.previewDescription}
        inputLabel={dictionary.hero.previewInputLabel}
        submitLabel={dictionary.hero.previewSubmit}
      />

      <section className="grid gap-6 md:grid-cols-3">
        {[dictionary.highlights.referral, dictionary.highlights.loyalty, dictionary.highlights.analytics].map(
          (highlight, index) => (
            <article
              key={index}
              className="flex flex-col gap-4 rounded-2xl border border-amber-100/60 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="text-3xl">{index === 0 ? "🤝" : index === 1 ? "🎯" : "📊"}</span>
              <p className="text-base text-zinc-700 dark:text-zinc-300">{highlight}</p>
            </article>
          ),
        )}
      </section>

      <section className="rounded-3xl border border-amber-200 bg-gradient-to-b from-white to-amber-50 p-10 dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-900/60">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.4em] text-amber-600">
              {resolvedParams.locale === "ar" ? "نظام ولاء" : "Rule engine"}
            </p>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {dictionary.admin.title}
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-300">
              {dictionary.admin.description}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${resolvedParams.locale}/admin/rules`}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-amber-700 shadow-sm shadow-amber-200 transition hover:text-amber-900 dark:bg-zinc-800 dark:text-amber-200"
            >
              {dictionary.admin.rulesCta}
            </Link>
            <Link
              href={`/${resolvedParams.locale}/admin/analytics`}
              className="inline-flex items-center justify-center rounded-full border border-transparent bg-amber-700 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-amber-600"
            >
              {dictionary.admin.analyticsCta}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
