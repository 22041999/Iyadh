import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const interSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tunisian Bio Products",
  description:
    "A multilingual commerce and loyalty experience for premium Tunisian bio products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${interSans.variable} ${robotoMono.variable} antialiased`}
      suppressHydrationWarning
    >
      {children}
    </html>
  );
}
