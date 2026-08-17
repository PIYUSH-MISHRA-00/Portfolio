"use client";

import { useState } from "react";
import { Archive, ExternalLink, GitCommitHorizontal, Github, GitFork, Globe, Star, Users } from "lucide-react";
import { activeRoles, archive, featured, monthYear, projectsForRole, relativeTime, type Project } from "@/lib/data";
import { useReveal } from "@/lib/hooks";

function Meta({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.625rem] text-faint tnum">
      {project.stars > 0 && (
        <span className="inline-flex items-center gap-1">
          <Star size={11} className="text-accent" aria-hidden />
          {project.stars}
        </span>
      )}
      {project.forks > 0 && (
        <span className="inline-flex items-center gap-1">
          <GitFork size={11} aria-hidden />
          {project.forks}
        </span>
      )}
      <span className="inline-flex items-center gap-1">
        <GitCommitHorizontal size={11} aria-hidden />
        {project.commits} commits
      </span>
      <span title={`Last pushed ${monthYear(project.pushedAt)}`}>{relativeTime(project.pushedAt)}</span>
      {project.license && <span>{project.license}</span>}
      {project.isArchived && <span className="text-accent2">archived</span>}
    </div>
  );
}

function ProjectCard({ project, rank }: { project: Project; rank: number }) {
  const ref = useReveal<HTMLElement>();

  return (
    <article
      ref={ref}
      id={`p-${project.id}`}
      className="card reveal flex scroll-mt-24 flex-col p-5 sm:p-6"
      style={{ transitionDelay: `${Math.min(rank, 6) * 55}ms` }}
    >
      <header>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {project.isOrg && (
              <span className="chip !border-accent2/40 !text-accent2">
                <Users size={10} aria-hidden />
                {project.org}
              </span>
            )}
            {project.signal === "flagship" && (
              <span className="chip !border-accent/40 !bg-accent/10 !text-accent">Flagship</span>
            )}
            {project.homepage && (
              <span className="chip !border-accent2/40 !text-accent2">
                <Globe size={10} aria-hidden />
                Live
              </span>
            )}
          </div>
          <span className="shrink-0 font-mono text-[0.625rem] text-faint">{project.primaryLanguage}</span>
        </div>

        <h4 className="font-display text-title font-bold">
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
            {project.name}
          </a>
        </h4>

        {project.headline && <p className="mt-1.5 text-sm leading-snug text-muted">{project.headline}</p>}
      </header>

      {/* The what / why / impact split is what a recruiter is actually scanning for. */}
      <div className="mt-5 grid gap-4 text-sm leading-relaxed">
        {project.what && (
          <div>
            <p className="eyebrow mb-1.5">What it does</p>
            <p className="text-muted">{project.what}</p>
          </div>
        )}
        {project.why && (
          <div>
            <p className="eyebrow mb-1.5">Why it exists</p>
            <p className="text-muted">{project.why}</p>
          </div>
        )}
        {project.impact && (
          <div className="rounded-lg border-l-2 border-accent bg-raised px-3.5 py-2.5">
            <p className="eyebrow mb-1.5">What it demonstrates</p>
            <p className="text-ink">{project.impact}</p>
          </div>
        )}
      </div>

      {project.highlights.length > 0 && (
        <ul className="brief-hide mt-4 grid gap-1.5">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-2 text-[0.8125rem] text-muted">
              <span className="mt-[0.4rem] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
              {h}
            </li>
          ))}
        </ul>
      )}

      {project.tech.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      )}

      <footer className="mt-auto pt-5">
        <Meta project={project} />
        <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-accent"
          >
            <Github size={13} aria-hidden />
            Source
          </a>
          {project.homepage && (
            <a
              href={project.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent2 transition-colors hover:opacity-80"
            >
              <ExternalLink size={13} aria-hidden />
              Visit live site
            </a>
          )}
        </div>
      </footer>
    </article>
  );
}

function ArchiveRow({ project }: { project: Project }) {
  return (
    <div
      id={`p-${project.id}`}
      className="group flex scroll-mt-24 items-start justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 transition-colors hover:border-accent/40"
    >
      <a href={project.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium group-hover:text-accent">{project.name}</span>
        <span className="mt-0.5 block text-xs leading-snug text-muted">{project.headline || project.description}</span>
        <span className="mt-1 block font-mono text-[0.625rem] text-faint tnum">
          {[project.primaryLanguage, relativeTime(project.pushedAt)].filter(Boolean).join(" · ")}
        </span>
      </a>
      {/* A deployed demo is worth surfacing even for archive entries. */}
      {project.homepage && (
        <a
          href={project.homepage}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md border border-line p-1.5 text-accent2 transition-colors hover:border-accent2"
          aria-label={`Open the live site for ${project.name}`}
          title="Live site"
        >
          <Globe size={13} />
        </a>
      )}
    </div>
  );
}

export default function Work() {
  const [only, setOnly] = useState<string | null>(null);
  const shown = only ? activeRoles.filter((r) => r.id === only) : activeRoles;

  return (
    <section id="work" className="scroll-mt-20 border-t border-line py-16 sm:py-20">
      <div className="shell">
        <header className="max-w-3xl">
          <p className="eyebrow">Work</p>
          <h2 className="mt-3 font-display text-display font-bold">Organised by what the code proves</h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Every entry below is a public repository. The role groupings, summaries and “what it demonstrates”
            lines are generated from each repository&apos;s own README and metadata, then refreshed automatically
            whenever code is pushed — so this page cannot drift out of date.
          </p>
        </header>

        <div className="rail mt-8" role="group" aria-label="Filter by role">
          <button
            onClick={() => setOnly(null)}
            className={`chip transition-colors ${!only ? "!border-accent !text-accent" : "hover:!text-ink"}`}
            aria-pressed={!only}
          >
            All roles
            {/* featured, not all projects — matches what the role chips count. */}
            <span className="tnum opacity-60">{featured.length}</span>
          </button>
          {activeRoles.map((r) => (
            <button
              key={r.id}
              onClick={() => setOnly(only === r.id ? null : r.id)}
              className={`chip transition-colors ${only === r.id ? "!border-accent !text-accent" : "hover:!text-ink"}`}
              aria-pressed={only === r.id}
            >
              {r.name}
              <span className="tnum opacity-60">{r.count}</span>
            </button>
          ))}
        </div>

        <div className="mt-14 grid gap-16 sm:gap-20">
          {shown.map((role, roleIndex) => {
            const projects = projectsForRole(role.id);
            return (
              <div key={role.id} id={`role-${role.id}`} className="scroll-mt-24">
                <header className="mb-8 flex items-end justify-between gap-6 border-b border-line pb-5">
                  <div className="min-w-0">
                    <p className="eyebrow mb-2">
                      Role {String((only ? activeRoles.findIndex((r) => r.id === role.id) : roleIndex) + 1).padStart(2, "0")}
                    </p>
                    <h3 className="font-display text-display font-bold">{role.name}</h3>
                    <p className="mt-2 max-w-xl text-sm text-muted">{role.tagline}</p>
                  </div>
                  <p className="shrink-0 text-right font-display text-4xl font-bold text-faint tnum sm:text-5xl">
                    {String(role.count).padStart(2, "0")}
                  </p>
                </header>

                <div className="brief-grid grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {projects.map((p, i) => (
                    <ProjectCard key={`${role.id}-${p.id}`} project={p} rank={i} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {archive.length > 0 && !only && (
          <div className="mt-20 border-t border-line pt-10">
            <header className="mb-6 flex items-center gap-3">
              <Archive size={16} className="text-faint" aria-hidden />
              <h3 className="font-display text-title font-bold">Archive</h3>
              <span className="font-mono text-xs text-faint tnum">{archive.length}</span>
            </header>
            <p className="mb-6 max-w-2xl text-sm text-muted">
              Coursework, internship deliverables, learning exercises and small utilities. Listed for completeness
              rather than hidden — every public repository appears somewhere on this page.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {archive.map((p) => (
                <ArchiveRow key={p.id} project={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
