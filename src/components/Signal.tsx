"use client";

import { compact, portfolio } from "@/lib/data";
import { useReveal } from "@/lib/hooks";

/**
 * Real language distribution, weighted by bytes of code across every public
 * repository — not a hand-picked list of logos.
 */
function StackWeight() {
  const langs = portfolio.stats.languages.slice(0, 10);
  const max = langs[0]?.projects ?? 1;

  return (
    <div>
      <p className="eyebrow mb-4">Languages by projects used in</p>
      <ul className="grid gap-2.5">
        {langs.map((l, i) => (
          <li key={l.name} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 sm:grid-cols-[9rem_1fr_3rem]">
            <span className="truncate text-[0.8125rem] font-medium">{l.name}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-raised" role="presentation">
              <span
                className="block h-full rounded-full transition-[width] duration-1000 ease-out"
                style={{
                  width: `${(l.projects / max) * 100}%`,
                  transitionDelay: `${i * 70}ms`,
                  background:
                    i === 0
                      ? "var(--accent)"
                      : `color-mix(in oklab, var(--accent) ${Math.max(20, 90 - i * 9)}%, var(--accent-2))`,
                }}
              />
            </span>
            <span
              className="text-right font-mono text-[0.6875rem] text-faint tnum"
              title={`Used in ${l.projects} of ${portfolio.stats.projects} projects`}
            >
              {l.projects}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const LEVELS = ["bg-raised", "bg-accent/25", "bg-accent/45", "bg-accent/70", "bg-accent"];

/**
 * A year of contributions. Scrolls horizontally on narrow screens rather than
 * dropping days — the whole year stays inspectable on a phone.
 */
function Heatmap() {
  const weeks = portfolio.calendar;
  if (!weeks.length) return null;

  const peak = Math.max(...weeks.flat().map((d) => d.contributionCount), 1);
  const level = (n: number) => (n === 0 ? 0 : Math.min(4, Math.ceil((n / peak) * 4)));

  // A partial first week has to be offset so weekday rows stay aligned.
  const leadingBlanks = weeks[0] ? new Date(weeks[0][0].date).getUTCDay() : 0;

  const months: { label: string; index: number }[] = [];
  weeks.forEach((week, i) => {
    const first = week[0];
    if (!first) return;
    const label = new Date(first.date).toLocaleDateString("en-GB", { month: "short" });
    // Label a column only when its month differs from the previous column's.
    if (months[months.length - 1]?.label !== label) months.push({ label, index: i });
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow">Contributions, last 12 months</p>
        <p className="font-mono text-xs text-muted tnum">
          {portfolio.stats.contributionsLastYear.toLocaleString("en-US")} total · peak {peak} in a day
        </p>
      </div>

      <div className="rail pb-2">
        <div className="min-w-fit">
          <div className="mb-1 flex gap-[3px]">
            {weeks.map((_, i) => {
              const month = months.find((m) => m.index === i);
              return (
                <span key={i} className="w-[10px] shrink-0 font-mono text-[0.5rem] text-faint">
                  {month?.label ?? ""}
                </span>
              );
            })}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid shrink-0 gap-[3px]">
                {wi === 0 &&
                  Array.from({ length: leadingBlanks }, (_, i) => <span key={`pad${i}`} className="h-[10px] w-[10px]" />)}
                {week.map((day) => (
                  <span
                    key={day.date}
                    className={`h-[10px] w-[10px] rounded-[2px] ${LEVELS[level(day.contributionCount)]}`}
                    title={`${day.contributionCount} contribution${day.contributionCount === 1 ? "" : "s"} on ${day.date}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 font-mono text-[0.5625rem] text-faint">
        <span>less</span>
        {LEVELS.map((c) => (
          <span key={c} className={`h-[9px] w-[9px] rounded-[2px] ${c}`} />
        ))}
        <span>more</span>
      </div>
    </div>
  );
}

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="font-display text-2xl font-bold tnum sm:text-3xl">{value}</p>
      <p className="mt-1 text-[0.8125rem] font-medium">{label}</p>
      {note && <p className="mt-0.5 font-mono text-[0.625rem] text-faint">{note}</p>}
    </div>
  );
}

export default function Signal() {
  const ref = useReveal<HTMLElement>();
  const { stats, orgs } = portfolio;

  return (
    <section id="signal" ref={ref} className="reveal scroll-mt-20 border-t border-line py-16 sm:py-20">
      <div className="shell">
        <header className="max-w-3xl">
          <p className="eyebrow">Signal</p>
          <h2 className="mt-3 font-display text-display font-bold">The numbers, straight from the source</h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Pulled live from the GitHub API on every sync. Nothing here is typed by hand, which is the point — you can
            verify all of it against the profile itself.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Tile label="Commits authored" value={compact(stats.totalCommitContributions)} note="public repositories" />
          <Tile label="Issues & discussions" value={compact(stats.totalIssueContributions)} note="opened across GitHub" />
          <Tile
            label="Private contributions"
            value={compact(stats.privateContributions)}
            note="client work, not shown here"
          />
          <Tile label="Organisations" value={String(stats.orgs)} note="with authored commits" />
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <StackWeight />
          <Heatmap />
        </div>

        {orgs.length > 0 && (
          <div className="mt-14 border-t border-line pt-10">
            <p className="eyebrow mb-2">Organisations</p>
            <p className="mb-6 max-w-2xl text-sm text-muted">
              Listed only where commits were actually authored — membership alone is not a contribution.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {orgs.map((org) => (
                <a
                  key={org.login}
                  href={org.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card flex items-center gap-4 p-4"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-semibold">{org.name || org.login}</span>
                    <span className="mt-0.5 block font-mono text-[0.625rem] text-faint tnum">
                      {org.projects} project{org.projects === 1 ? "" : "s"} · {org.commits.toLocaleString("en-US")} commits
                    </span>
                    {org.description && <span className="mt-1.5 block text-xs leading-snug text-muted">{org.description}</span>}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
