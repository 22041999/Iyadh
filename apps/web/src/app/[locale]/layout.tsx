import type { ReactNode } from "react";
import { locales, type Locale, normalizeLocale, isRtlLocale } from "@/i18n/config";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const resolvedParams = await params;
  const locale = normalizeLocale(resolvedParams.locale) as Locale;
  const direction = isRtlLocale(locale) ? "rtl" : "ltr";

  return (
    <body
      dir={direction}
      data-locale={locale}
      className="min-h-screen bg-stone-50 text-slate-900 antialiased dark:bg-zinc-950"
    >
      {children}
    </body>
  );
}
