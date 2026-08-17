"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Command, Download, FileText, Hash, LayoutGrid, Menu, Moon, Search, Sun, X } from "lucide-react";
import { activeRoles, featured, archive, portfolio, relativeTime } from "@/lib/data";
import { identity, links } from "@/lib/profile";
import { useActiveSection, useHtmlFlag } from "@/lib/hooks";

const SECTIONS = [
  { id: "work", label: "Work" },
  { id: "signal", label: "Signal" },
  { id: "journey", label: "Journey" },
  { id: "contact", label: "Contact" },
];

type Entry = {
  key: string;
  title: string;
  subtitle: string;
  href: string;
  kind: "project" | "role" | "section" | "link";
  meta?: string;
  external?: boolean;
};

/** Flat, searchable index of everything on the page. Built once. */
function buildIndex(): Entry[] {
  return [
    ...SECTIONS.map((s) => ({
      key: `section:${s.id}`,
      title: s.label,
      subtitle: "Jump to section",
      href: `#${s.id}`,
      kind: "section" as const,
    })),
    ...activeRoles.map((r) => ({
      key: `role:${r.id}`,
      title: r.name,
      subtitle: r.tagline,
      href: `#role-${r.id}`,
      kind: "role" as const,
      meta: `${r.count} projects`,
    })),
    ...[...featured, ...archive].map((p) => ({
      key: `project:${p.id}`,
      title: p.name,
      subtitle: p.headline || p.description || "",
      href: `#p-${p.id}`,
      kind: "project" as const,
      meta: [p.primaryLanguage, p.stars ? `${p.stars}★` : null, p.isOrg ? p.org : null].filter(Boolean).join(" · "),
    })),
    ...links.map((l) => ({
      key: `link:${l.label}`,
      title: l.label,
      subtitle: l.handle,
      href: l.href,
      kind: "link" as const,
      external: true,
    })),
  ];
}

/** Subsequence match, so "kaal enc" finds "Kaalka Encryption Algorithm". */
function score(entry: Entry, terms: string[]) {
  const hay = `${entry.title} ${entry.subtitle} ${entry.meta ?? ""}`.toLowerCase();
  let total = 0;
  for (const term of terms) {
    const inTitle = entry.title.toLowerCase().indexOf(term);
    if (inTitle === 0) total += 12;
    else if (inTitle > 0) total += 7;
    else if (hay.includes(term)) total += 3;
    else return -1;
  }
  // Nudge projects above links when scores tie.
  return total + (entry.kind === "project" ? 1 : 0);
}

const KIND_ICON = {
  project: Hash,
  role: LayoutGrid,
  section: FileText,
  link: ArrowUpRight,
} as const;

function Palette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return index.filter((e) => e.kind !== "project").concat(featured.slice(0, 6).map((p) => index.find((e) => e.key === `project:${p.id}`)!)).filter(Boolean);
    return index
      .map((e) => ({ e, s: score(e, terms) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 40)
      .map((r) => r.e);
  }, [query, index]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      // Let the dialog paint before stealing focus, or iOS skips the keyboard.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Keep the highlighted row in view during keyboard navigation.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [cursor, results]);

  const go = useCallback(
    (entry: Entry) => {
      onClose();
      if (entry.external) {
        window.open(entry.href, "_blank", "noopener,noreferrer");
        return;
      }
      // Assign rather than push so the browser handles scroll-padding.
      window.location.hash = entry.href.slice(1);
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Search projects and sections"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={16} className="shrink-0 text-faint" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => (c + 1) % Math.max(results.length, 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => (c - 1 + results.length) % Math.max(results.length, 1));
              } else if (e.key === "Enter" && results[cursor]) {
                e.preventDefault();
                go(results[cursor]);
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
            placeholder={`Search ${featured.length + archive.length} projects, roles, links…`}
            className="w-full bg-transparent py-4 text-base outline-none placeholder:text-faint"
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
          />
          <button onClick={onClose} className="shrink-0 rounded p-1 text-faint hover:text-ink" aria-label="Close search">
            <X size={16} />
          </button>
        </div>

        <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2" role="listbox">
          {results.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted">No matches for “{query}”.</p>}
          {results.map((entry, i) => {
            const Icon = KIND_ICON[entry.kind];
            return (
              <button
                key={entry.key}
                data-active={i === cursor}
                role="option"
                aria-selected={i === cursor}
                onMouseEnter={() => setCursor(i)}
                onClick={() => go(entry)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  i === cursor ? "bg-raised" : ""
                }`}
              >
                <Icon size={14} className={i === cursor ? "shrink-0 text-accent" : "shrink-0 text-faint"} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{entry.title}</span>
                  {entry.subtitle && <span className="block truncate text-xs text-muted">{entry.subtitle}</span>}
                </span>
                {entry.meta && <span className="hidden shrink-0 font-mono text-[0.625rem] text-faint xs:block">{entry.meta}</span>}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-2 font-mono text-[0.625rem] text-faint">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>synced {relativeTime(portfolio.syncedAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default function Chrome() {
  const [theme, setTheme] = useHtmlFlag("theme", "dark");
  const [brief, setBrief] = useHtmlFlag("brief", "off");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Memoised: a fresh array each render would rebuild the observer every time.
  const watched = useMemo(() => [...SECTIONS.map((s) => s.id), ...activeRoles.map((r) => `role-${r.id}`)], []);
  const active = useActiveSection(watched);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      // Bare "/" is the other convention people try.
      if (e.key === "/" && !/^(INPUT|TEXTAREA)$/.test((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Don't let the page scroll behind an open overlay.
  useEffect(() => {
    document.body.style.overflow = paletteOpen || menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [paletteOpen, menuOpen]);

  const isDark = theme === "dark";

  return (
    <>
      <header className="no-print fixed inset-x-0 top-0 z-[80] border-b border-line/80 bg-bg/80 backdrop-blur-xl">
        <nav className="shell flex h-16 items-center gap-3" aria-label="Main">
          <a href="#top" className="group flex shrink-0 items-center gap-2.5" aria-label="Back to top">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink font-display text-sm font-bold text-bg">PM</span>
            <span className="hidden font-display text-sm font-semibold tracking-tight sm:block">{identity.name}</span>
          </a>

          <div className="mx-auto hidden items-center gap-1 lg:flex">
            {SECTIONS.map((s) => {
              // Any role subsection counts as being inside Work.
              const isActive = s.id === "work" ? active === "work" || Boolean(active?.startsWith("role-")) : active === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    isActive ? "text-accent" : "text-muted hover:text-ink"
                  }`}
                >
                  {s.label}
                </a>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-muted transition-colors hover:border-accent hover:text-accent"
              aria-label="Search projects"
            >
              <Search size={15} />
              <span className="hidden font-mono text-[0.625rem] md:inline">⌘K</span>
            </button>

            <button
              onClick={() => setBrief(brief === "on" ? "off" : "on")}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.6875rem] font-medium transition-colors ${
                brief === "on" ? "border-accent bg-accent text-bg" : "border-line bg-surface text-muted hover:text-ink"
              }`}
              aria-pressed={brief === "on"}
              title="Condense the page into a recruiter-ready brief"
            >
              <FileText size={14} />
              <span className="hidden sm:inline">Brief</span>
            </button>

            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="rounded-lg border border-line bg-surface p-2 text-muted transition-colors hover:text-ink"
              aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <a
              href={identity.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-solid hidden !px-3 !py-1.5 !text-[0.8125rem] md:inline-flex"
            >
              <Download size={14} />
              Résumé
            </a>

            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-lg border border-line bg-surface p-2 text-muted lg:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu size={15} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile sheet: carries every nav target, every role and every link. */}
      {menuOpen && (
        <div className="no-print fixed inset-0 z-[95] flex flex-col bg-bg lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
            <span className="font-display text-sm font-semibold">Navigate</span>
            <button onClick={() => setMenuOpen(false)} className="rounded-lg border border-line p-2" aria-label="Close menu">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            <p className="eyebrow mb-3">Sections</p>
            <div className="mb-8 grid gap-1">
              {SECTIONS.map((s) => (
                <a key={s.id} href={`#${s.id}`} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-lg font-display hover:bg-raised">
                  {s.label}
                </a>
              ))}
            </div>

            <p className="eyebrow mb-3">Roles</p>
            <div className="mb-8 grid gap-1">
              {activeRoles.map((r) => (
                <a
                  key={r.id}
                  href={`#role-${r.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-raised"
                >
                  <span className="text-sm">{r.name}</span>
                  <span className="font-mono text-xs text-faint tnum">{r.count}</span>
                </a>
              ))}
            </div>

            <p className="eyebrow mb-3">Elsewhere</p>
            <div className="grid gap-1">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-raised"
                >
                  <span className="text-sm">{l.label}</span>
                  <ArrowUpRight size={14} className="text-faint" />
                </a>
              ))}
            </div>
          </div>

          <div className="shrink-0 border-t border-line p-5">
            <a href={identity.resume} target="_blank" rel="noopener noreferrer" className="btn-solid w-full">
              <Download size={15} />
              Download résumé
            </a>
          </div>
        </div>
      )}

      <Palette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Floating search affordance so the palette is discoverable without a keyboard. */}
      <button
        onClick={() => setPaletteOpen(true)}
        className="no-print fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-full border border-line bg-surface/95 px-4 py-3 shadow-xl backdrop-blur transition-transform hover:scale-105 lg:hidden"
        aria-label="Search projects"
      >
        <Command size={15} className="text-accent" />
        <span className="text-xs font-medium">Search</span>
      </button>
    </>
  );
}

export { SECTIONS };
