import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { StatusBar } from "@/components/status-bar";

// Two typefaces, self-hosted at build (no runtime fetch — stays IPFS-publishable). Inter carries
// all prose/UI; JetBrains Mono is reserved for numerics. Exposed as CSS vars that globals.css
// feeds into the --font-sans / --font-mono theme tokens.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

/** Set the theme attribute before first paint so there's no light/dark flash. Default: dark. */
const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

/**
 * Brand mark — two overlapping rounded squares (the intersecting-squares "venn" geometry of the
 * old SquaresIntersect glyph), both in the brand blue: a solid square behind, a semi-opaque square
 * in front so the overlap deepens to a distinct tone. Echoes the aggregator's "intersection" idea.
 */
function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <rect x="5" y="5" width="18" height="18" rx="6" fill="var(--color-brand)" fillOpacity="0.85" />
      {/* Front square: same brand blue, more transparent so the overlap blends to a distinct tone. */}
      <rect x="13" y="13" width="18" height="18" rx="6" fill="var(--color-brand)" fillOpacity="0.55" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Neutral Risk — Neutral DeFi Risk Intelligence Aggregator",
  description:
    "A neutral, open aggregator of what DeFi risk feeds say about Ethereum protocols — side by side, verbatim, no composite scoring.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <header className="bg-rr-950">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <BrandMark className="h-11 w-11 shrink-0" />
              {/* Brand + strapline. Inline (name · divider · strapline) on sm+; stacked on mobile. */}
              <span className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                <span className="text-xl font-bold tracking-tight">
                  Neutral Risk
                </span>
                <span className="hidden h-4 w-px bg-rr-700 sm:block" aria-hidden="true" />
                <span className="text-xs font-medium text-rr-400 sm:text-sm">
                  Aggregated DeFi Risk Intelligence
                </span>
              </span>
            </Link>
            {/* Assets removed from the UI — asset coverage is an out-of-scope future milestone
                (see proposal/FUTURE-MILESTONES.md §2–§3), not core RFP scope. The lib/data/assets*
                data files are retained to back that future milestone. */}
            <div className="flex items-center gap-2">
              <SiteNav />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-6 py-10 lg:px-8">{children}</main>
        <footer className="mt-20 border-t border-rr-700 bg-rr-850">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
            {/* Registry status + coverage counts — formerly the fixed top strip, now the footer's top row. */}
            <div className="border-b border-rr-700 py-4">
              <StatusBar />
            </div>
          </div>
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-8 text-xs text-rr-500 lg:px-8">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span>
                <span className="font-semibold text-rr-400">Neutral Risk</span> — a neutral public
                good by{" "}
                <a href="https://rails.finance" className="font-semibold text-brand hover:underline">
                  Rails
                </a>
                . We aggregate; we never score.
              </span>
              <span className="text-rr-600">·</span>
              <span>AGPL-3.0</span>
            </div>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-medium">
              <Link href="/about" className="transition-colors hover:text-rr-50">About</Link>
              <Link href="/methodology" className="transition-colors hover:text-rr-50">Methodology</Link>
              <Link href="/faq" className="transition-colors hover:text-rr-50">FAQ</Link>
              <a
                href="https://github.com/rails-finance/neutral-risk"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-rr-50"
              >
                GitHub
              </a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
