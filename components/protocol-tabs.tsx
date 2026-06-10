"use client";

import { useEffect, useState, type ReactNode } from "react";

export interface ProtocolTab {
  id: string;
  label: string;
  content: ReactNode;
}

// Responsive disclosure for the protocol page.
//   Desktop (md+): a real tab bar — only the active panel shows, and the active TAB LABEL serves as
//   that section's heading, so panels carry no duplicate heading of their own.
//   Mobile (<md): the tab bar is dropped entirely; every section stacks into one scrollable column,
//   each titled by its label (the only place the per-section heading appears).
// All panels render into the static HTML, so the full content still ships in the SSG/IPFS page and
// degrades without JS.
export function ProtocolTabs({ tabs, defaultId }: { tabs: ProtocolTab[]; defaultId?: string }) {
  const [active, setActive] = useState(defaultId ?? tabs[0]?.id);

  // Deep-linkable tabs: honour a #tab-id in the URL on load (e.g. /protocol/aave-v3#verify) and
  // keep the hash in step as the reader switches tabs, so the proposal and others can link straight
  // to a specific section. The mobile layout stacks every section, so this only drives the desktop
  // tab bar; the panels all ship in the static HTML regardless.
  useEffect(() => {
    const fromHash = window.location.hash.replace(/^#/, "");
    if (fromHash && tabs.some((t) => t.id === fromHash)) setActive(fromHash);
    // Run once on mount; tabs are stable for the page's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTab = (id: string) => {
    setActive(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(window.history.state, "", `#${id}`);
    }
  };

  return (
    <div className="mt-6">
      {/* Tab bar — desktop only. */}
      <div role="tablist" className="hidden flex-wrap gap-x-2 gap-y-2 md:flex">
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => selectTab(t.id)}
              className={`-mb-px cursor-pointer border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                on
                  ? "border-rr-100 text-rr-50"
                  : "border-transparent text-rr-500 hover:text-rr-200"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Panels. Mobile: stacked + scrollable, each section titled by its label. Desktop: only the
          active panel, with no heading (the tab bar names it). An inactive panel is hidden only at
          md+ — on mobile it stays in the scroll flow. */}
      <div className="flex flex-col gap-10 md:block md:gap-0">
        {tabs.map((t) => (
          <section
            key={t.id}
            role="tabpanel"
            aria-label={t.label}
            className={t.id === active ? "md:pt-6" : "md:hidden"}
          >
            <h2 className="mb-4 section-title text-rr-500 md:hidden">{t.label}</h2>
            {t.content}
          </section>
        ))}
      </div>
    </div>
  );
}
