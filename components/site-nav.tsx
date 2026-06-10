"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  LayoutGrid,
  Rss,
  BookOpen,
  HelpCircle,
  Info,
  Github,
  Send,
  type LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

/** Animated hamburger — three bars that morph into an X when `active` (port of the rails-web-mig
 *  header burger). Bars use `bg-current`, so the trigger button's text colour (and its hover
 *  lightening) drives them. */
function Hamburger({ active }: { active: boolean }) {
  const base = "absolute h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-in-out";
  return (
    <div className="relative flex h-5 w-7 flex-col justify-center" aria-hidden="true">
      <span className={`${base} ${active ? "translate-y-0 rotate-45" : "-translate-y-[7px]"}`} />
      <span className={`${base} ${active ? "opacity-0" : "opacity-100"}`} />
      <span className={`${base} ${active ? "translate-y-0 -rotate-45" : "translate-y-[7px]"}`} />
    </div>
  );
}

/** Primary navigation. Each destination gets a small colour tile (a navigation-chrome identity cue,
 *  deliberately kept separate from the data colour grammar — coverage/category/status/brand — so it
 *  never reads as a risk or coverage signal). Icons + tile colours are nav decoration only. */
const NAV: { href: string; label: string; icon: LucideIcon; tile: string }[] = [
  { href: "/coverage", label: "Coverage", icon: LayoutGrid, tile: "bg-blue-600" },
  { href: "/feeds", label: "Feed directory", icon: Rss, tile: "bg-teal-600" },
  { href: "/methodology", label: "Methodology", icon: BookOpen, tile: "bg-violet-600" },
  { href: "/faq", label: "FAQ", icon: HelpCircle, tile: "bg-amber-600" },
  { href: "/about", label: "About", icon: Info, tile: "bg-emerald-600" },
];

/** External "Connect" links, shown as a row of icon buttons at the foot of the menu. */
const CONNECT: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "https://github.com/rails-finance/neutral-risk", label: "GitHub", icon: Github },
  // Placeholder handle — swap for the real channel once it exists.
  { href: "https://t.me/neutralrisk", label: "Telegram", icon: Send },
];

/** The menu body — colour-tiled nav links, a theme row, and a connect row. Shared by the desktop
 *  dropdown and the mobile sheet so the same menu rides every breakpoint. */
function MenuContent({ onLinkClick }: { onLinkClick: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon, tile }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={active ? undefined : onLinkClick}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "pointer-events-none bg-rr-800 text-rr-50"
                  : "text-rr-300 hover:bg-rr-800 hover:text-rr-50"
              }`}
            >
              <span className={`flex shrink-0 items-center justify-center rounded-md p-1.5 text-white ${tile}`}>
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="my-4 border-t border-rr-700" />

      {/* Theme row — the standalone header toggle moved in here (matches the reference menu). */}
      <div className="flex items-center justify-between px-2.5">
        <span className="text-sm font-medium text-rr-300">Theme</span>
        <ThemeToggle />
      </div>

      <div className="my-4 border-t border-rr-700" />

      <div className="px-2.5">
        <span className="mb-3 block eyebrow text-rr-500">Connect with us</span>
        <div className="flex items-center gap-2">
          {CONNECT.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="flex items-center justify-center rounded-lg border border-transparent p-2 text-rr-400 transition-colors hover:border-brand hover:text-rr-50"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  // Desktop → anchored dropdown; touch/small screens → full-height sheet.
  useEffect(() => {
    const check = () => {
      const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobile(touch || window.innerWidth < 768);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape, and (desktop) on an outside click.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex cursor-pointer items-center rounded-full p-3 text-rr-300 transition-colors hover:text-rr-50"
      >
        <Hamburger active={open} />
      </button>

      {/* Desktop — dropdown anchored under the button (inline so it tracks the trigger). */}
      {!isMobile && open && (
        <div
          role="menu"
          className="menu-pop glass-strong absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-rr-700 bg-rr-900/95 p-4 shadow-2xl"
        >
          <MenuContent onLinkClick={() => setOpen(false)} />
        </div>
      )}

      {/* Mobile — full-height right sheet, portaled to <body> so the fixed overlay escapes the
          header's backdrop-filter containing block. */}
      {isMobile &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm"
            />
            <div className="absolute right-0 top-0 flex h-full w-[300px] max-w-[85vw] flex-col overflow-y-auto border-l border-rr-700 bg-rr-950 px-5 py-5 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <span className="eyebrow text-rr-500">Navigate</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex cursor-pointer items-center justify-center rounded-full p-1.5 text-rr-400 transition-colors hover:bg-rr-800 hover:text-rr-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <MenuContent onLinkClick={() => setOpen(false)} />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
