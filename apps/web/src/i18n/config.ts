export const locales = ["ar", "fr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";
export const rtlLocales: Locale[] = ["ar"];

export function normalizeLocale(input?: string): Locale {
  if (!input) return defaultLocale;
  const match = locales.find((locale) => locale === input);
  return match ?? defaultLocale;
}

export function isRtlLocale(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}
