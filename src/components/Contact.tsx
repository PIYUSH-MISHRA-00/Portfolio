"use client";

import { ArrowUpRight, Download, Mail } from "lucide-react";
import { activeRoles, portfolio, relativeTime } from "@/lib/data";
import { identity, links } from "@/lib/profile";
import { useReveal } from "@/lib/hooks";

export default function Contact() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="contact" ref={ref} className="reveal scroll-mt-20 border-t border-line py-16 sm:py-20">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="eyebrow">Contact</p>
            <h2 className="mt-3 font-display text-display font-bold">
              Let&apos;s build
              <br />
              something.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              Open to roles and collaboration across {activeRoles.length} disciplines — AI engineering, data science,
              backend, security and platform work. The fastest way to reach me is email.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${identity.email}`} className="btn-solid">
                <Mail size={15} />
                {identity.email}
              </a>
              <a href={identity.resume} target="_blank" rel="noopener noreferrer" className="btn">
                <Download size={15} />
                Résumé
              </a>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-4">Elsewhere</p>
            <ul className="grid gap-px overflow-hidden rounded-xl border border-line bg-line">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 bg-surface px-4 py-3 transition-colors hover:bg-raised"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{l.label}</span>
                      <span className="block truncate font-mono text-[0.625rem] text-faint">{l.handle}</span>
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="shrink-0 text-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                      aria-hidden
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="mt-16 flex flex-col gap-3 border-t border-line pt-8 font-mono text-[0.625rem] text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date(portfolio.syncedAt).getFullYear()} {identity.name}. Built with Next.js, generated from the
            GitHub API.
          </p>
          <p className="tnum">
            {portfolio.projects.length} projects · {activeRoles.length} roles · last synced{" "}
            {relativeTime(portfolio.syncedAt)}
          </p>
        </footer>
      </div>
    </section>
  );
}
