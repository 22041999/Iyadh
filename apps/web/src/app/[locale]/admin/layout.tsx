import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

type AdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
};

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const resolvedParams = await params;
  const dictionary = await getDictionary(resolvedParams.locale);

  const links = [
    { href: `/${resolvedParams.locale}/admin`, label: dictionary.nav.dashboard },
    { href: `/${resolvedParams.locale}/admin/rules`, label: dictionary.admin.rulesCta },
    { href: `/${resolvedParams.locale}/admin/analytics`, label: dictionary.admin.analyticsCta },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16 pt-10">
      <header className="flex flex-col gap-4 rounded-2xl border border-amber-100 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-800">
            Admin
          </span>
          <p className="text-sm text-zinc-500">RBAC · {resolvedParams.locale.toUpperCase()}</p>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm font-semibold">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-amber-200 px-4 py-2 text-amber-800 transition hover:border-amber-400 hover:text-amber-900 dark:border-zinc-700 dark:text-amber-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <section className="rounded-3xl border border-amber-100 bg-white/80 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {children}
      </section>
    </div>
  );
}
