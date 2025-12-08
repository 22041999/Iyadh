import type { ReactNode } from "react";
import { locales, type Locale, normalizeLocale, isRtlLocale } from "@/i18n/config";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale = normalizeLocale(params.locale) as Locale;
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
