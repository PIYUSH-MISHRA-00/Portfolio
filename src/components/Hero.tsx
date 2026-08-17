"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDown, Github, MapPin, Radio } from "lucide-react";
import photo from "../../public/img/piyush.jpeg";
import { activeRoles, portfolio, relativeTime } from "@/lib/data";
import { identity } from "@/lib/profile";
import { useCountUp } from "@/lib/hooks";

const ROTATE_MS = 2800;

/**
 * The headline never claims one job title. It cycles the roles the public code
 * actually evidences, each with its live project count.
 */
function RoleRotator() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || activeRoles.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % activeRoles.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused]);

  const role = activeRoles[i];
  if (!role) return null;

  return (
    <div
      className="mt-6 sm:mt-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <p className="eyebrow mb-3">Proven across {activeRoles.length} roles</p>

      {/*
       * Fixed-height stage so the page does not reflow on every rotation. Sized
       * for the longest role name wrapping to three lines on a 320px screen —
       * "Security & Cryptography Engineer" overflowed a tighter box.
       */}
      <div className="relative h-[8.5rem] xs:h-[7.5rem] sm:h-[7rem] lg:h-[7.5rem]">
        {activeRoles.map((r, n) => (
          <a
            key={r.id}
            href={`#role-${r.id}`}
            aria-hidden={n !== i}
            tabIndex={n === i ? 0 : -1}
            className="absolute inset-0 flex flex-col justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              opacity: n === i ? 1 : 0,
              transform: n === i ? "none" : "translateY(12px)",
              pointerEvents: n === i ? "auto" : "none",
            }}
          >
            <span className="font-display text-[clamp(1.375rem,5.5vw,3rem)] font-bold leading-[1.05] tracking-tight text-accent">
              {r.name}
            </span>
            <span className="mt-1.5 font-mono text-[0.6875rem] leading-snug text-muted sm:text-xs">
              <span className="tnum">
                {r.count} {r.count === 1 ? "project" : "projects"}
              </span>
              {" · "}
              {r.tagline}
            </span>
          </a>
        ))}
      </div>

      {/* Every role stays reachable, not just the one currently on stage. */}
      <div className="rail mt-5" aria-label="Show a role">
        {activeRoles.map((r, n) => (
          <button
            key={r.id}
            aria-pressed={n === i}
            onClick={() => setI(n)}
            className={`chip transition-colors ${n === i ? "!border-accent !text-accent" : "hover:!text-ink"}`}
          >
            {r.name}
            <span className="tnum opacity-60">{r.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const [shown, ref] = useCountUp(value);
  return (
    <div>
      <p className="font-display text-2xl font-bold tnum sm:text-3xl">
        <span ref={ref}>{shown.toLocaleString("en-US")}</span>
        {suffix}
      </p>
      <p className="mt-0.5 font-mono text-[0.625rem] uppercase tracking-widest text-faint">{label}</p>
    </div>
  );
}

export default function Hero() {
  const { stats } = portfolio;

  return (
    <section id="top" className="relative pt-28 pb-16 sm:pt-32 lg:pt-40">
      <div className="shell">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-widest text-muted">
                <Radio size={11} className="animate-pulse text-accent2" aria-hidden />
                Synced {relativeTime(portfolio.syncedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-widest text-faint">
                <MapPin size={11} aria-hidden />
                {identity.location}
              </span>
            </div>

            <h1 className="mt-7 font-display text-hero font-bold">
              Piyush
              <br />
              <span className="text-muted">Mishra</span>
            </h1>

            <RoleRotator />

            <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{identity.summary}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#work" className="btn-solid">
                Browse {stats.projects} projects
                <ArrowDown size={15} />
              </a>
              <a href={identity.resume} target="_blank" rel="noopener noreferrer" className="btn">
                Résumé
              </a>
              <a href="https://github.com/PIYUSH-MISHRA-00" target="_blank" rel="noopener noreferrer" className="btn">
                <Github size={15} />
                GitHub
              </a>
            </div>
          </div>

          {/* Portrait sits above the fold on desktop, below the pitch on mobile. */}
          <div className="brief-hide order-first lg:order-none">
            <div className="relative w-32 sm:w-40 lg:w-56">
              <div className="absolute -inset-3 rounded-3xl bg-accent/10 blur-2xl" aria-hidden />
              <Image
                src={photo}
                alt={`${identity.name}, ${activeRoles.map((r) => r.name).join(", ")}`}
                priority
                sizes="224px"
                className="relative aspect-square w-full rounded-2xl border border-line object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-3 lg:grid-cols-5">
          <Metric value={stats.projects} label="Public projects" />
          {/* activeRoles, not stats.roles: only roles with a full project card count. */}
          <Metric value={activeRoles.length} label="Engineering roles" />
          <Metric value={stats.commitsByMe} label="Commits authored" />
          <Metric value={stats.stars} label="Stars earned" />
          <Metric value={stats.yearsActive} label="Years on GitHub" suffix="+" />
        </div>
      </div>
    </section>
  );
}
