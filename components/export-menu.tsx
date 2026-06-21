"use client";

// "Copy for LLM" export control — a trigger + chevron that opens a small floating menu:
//
//   • Copy for LLM     → Markdown snapshot to clipboard, ready to paste into an LLM
//   • View as Markdown → opens the snapshot as plain text in a new tab
//
// Pure client-side: the Markdown is serialized at build time on the server page (data already in
// scope, nothing fetched — stays SSG/IPFS-publishable) and handed in as a finished string. The
// snapshot's "as of" date is the committed coverage-scan stamp baked into the string, not a
// click-time clock, so the export is deterministic and reproducible.
//
// Grammar (CLAUDE.md): the trigger is a Control — flat rr-850 fill + transparent baseline border
// that lifts to border-brand on hover. The dropdown floats above content, so it uses `glass`.

import { useState, useRef, useEffect } from "react";
import { Copy, Check, FileText, ChevronDown } from "lucide-react";

type Props = {
  /** The finished Markdown snapshot, serialized server-side at build time. */
  markdown: string;
  /** Accessible label for the trigger. */
  ariaLabel?: string;
};

function MenuItem({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitem"
      className="flex w-full cursor-pointer items-start gap-3 px-3 py-2 text-left transition-colors hover:bg-rr-800"
    >
      <span className="mt-0.5 shrink-0 text-rr-500">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-rr-100">{title}</span>
        <span className="block text-xs text-rr-500">{subtitle}</span>
      </span>
    </button>
  );
}

export function ExportMenu({ markdown, ariaLabel = "Copy this page for an LLM" }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      // The menu closes on action, so surface confirmation on the trigger.
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Failed to copy Markdown:", err);
    }
    setOpen(false);
  };

  const viewMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    // Revoke once the new tab has had time to load the blob.
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        className="flex h-8 cursor-pointer items-center gap-2 rounded-md border border-transparent bg-rr-850 px-3 text-xs font-medium text-rr-300 transition-colors hover:border-brand hover:text-rr-50"
      >
        <span>{copied ? "Copied" : "Copy for LLM"}</span>
        {copied ? (
          <Check className="h-3.5 w-3.5 text-status-ok" aria-hidden="true" />
        ) : (
          <ChevronDown
            className={`h-3.5 w-3.5 text-rr-500 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        )}
      </button>

      {open && (
        <div
          className="glass absolute right-0 top-full z-50 mt-2 min-w-[260px] overflow-hidden rounded-xl border border-rr-700 py-1 shadow-2xl"
          role="menu"
        >
          <MenuItem
            icon={<Copy size={16} />}
            title="Copy for LLM"
            subtitle="Copy as Markdown to paste into an LLM"
            onClick={copyMarkdown}
          />
          <MenuItem
            icon={<FileText size={16} />}
            title="View as Markdown"
            subtitle="Open the snapshot as plain text"
            onClick={viewMarkdown}
          />
        </div>
      )}
    </div>
  );
}
