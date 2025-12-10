import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  const hasLocale = locales.some((locale) => pathname.startsWith(`/${locale}`));
  if (hasLocale) {
    return NextResponse.next();
  }

  const cookieLocale = request.cookies.get("locale")?.value;
  const safeLocale = locales.includes(cookieLocale as (typeof locales)[number])
    ? cookieLocale!
    : defaultLocale;

  const response = NextResponse.redirect(new URL(`/${safeLocale}${pathname}`, request.url));
  if (cookieLocale !== safeLocale) {
    response.cookies.set("locale", safeLocale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
