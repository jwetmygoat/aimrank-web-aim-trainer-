import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

// Fonts are self-hosted in app/fonts so builds never depend on Google Fonts.
const chakra = localFont({
  src: [
    { path: "./fonts/ChakraPetch-Medium.ttf", weight: "500" },
    { path: "./fonts/ChakraPetch-SemiBold.ttf", weight: "600" },
    { path: "./fonts/ChakraPetch-Bold.ttf", weight: "700" },
  ],
  variable: "--font-chakra",
});

const inter = localFont({
  src: "./fonts/Inter-Variable.ttf",
  variable: "--font-inter",
});

const jet = localFont({
  src: "./fonts/JetBrainsMono-Variable.ttf",
  variable: "--font-jet",
});

export const metadata: Metadata = {
  title: "AimRank — competitive aim training",
  description: "30-second aim challenges. Get a score. Climb the ranks.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${chakra.variable} ${inter.variable} ${jet.variable} font-sans antialiased min-h-screen`}
      >
        <header className="border-b border-edge">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="font-display text-lg font-bold tracking-widest uppercase"
            >
              Aim<span className="text-accent">Rank</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted">
              <Link href="/dashboard" className="hover:text-ink">
                Dashboard
              </Link>
              <Link
                href="/play"
                className="rounded border border-accent px-3 py-1.5 font-display font-semibold uppercase tracking-wider text-accent hover:bg-accent-soft"
              >
                Play
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
