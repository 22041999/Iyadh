import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

type SiteLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
};

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const dictionary = await getDictionary(locale);
  const navItems = [
    { href: `/${locale}/catalog`, label: dictionary.nav.catalog },
    { href: `/${locale}/dashboard`, label: dictionary.nav.dashboard },
    { href: `/${locale}/admin`, label: dictionary.nav.admin },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8e7,_#fef3c7)] dark:bg-gradient-to-b dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-20 pt-10">
        <header className="flex flex-col gap-4 rounded-2xl border border-amber-100 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href={`/${locale}`} className="text-xl font-semibold text-amber-800">
              BioCommerce
            </Link>
            <nav className="flex flex-wrap gap-3 text-sm font-medium text-amber-700">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-amber-200 px-4 py-2 transition hover:border-amber-400 hover:text-amber-900 dark:border-zinc-700 dark:text-amber-200"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
