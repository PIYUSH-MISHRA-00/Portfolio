"use client";

import { Award, BadgeCheck, Briefcase, GraduationCap } from "lucide-react";
import { awards, certifications, education, experience, spokenLanguages } from "@/lib/profile";
import { useReveal } from "@/lib/hooks";

function Panel({ icon: Icon, title, children }: { icon: typeof Award; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-5 flex items-center gap-2.5 font-display text-title font-bold">
        <Icon size={17} className="text-accent" aria-hidden />
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function Journey() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="journey" ref={ref} className="reveal scroll-mt-20 border-t border-line py-16 sm:py-20">
      <div className="shell">
        <header className="max-w-3xl">
          <p className="eyebrow">Journey</p>
          <h2 className="mt-3 font-display text-display font-bold">Where the work happened</h2>
        </header>

        <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
          <Panel icon={Briefcase} title={`Experience (${experience.length} roles)`}>
            {/* Rail on the left, one node per role. */}
            <ol className="relative grid gap-7 border-l border-line pl-6">
              {experience.map((job) => (
                <li key={`${job.company}-${job.duration}`} className="relative">
                  <span
                    className="absolute -left-[1.655rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-accent"
                    aria-hidden
                  />
                  <p className="font-mono text-[0.625rem] uppercase tracking-widest text-faint">{job.duration}</p>
                  <h4 className="mt-1.5 font-display text-base font-semibold">{job.role}</h4>
                  <p className="text-sm text-accent">{job.company}</p>
                  <p className="mt-0.5 font-mono text-[0.625rem] text-faint">{job.location}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{job.description}</p>
                </li>
              ))}
            </ol>
          </Panel>

          <div className="grid gap-12">
            <Panel icon={GraduationCap} title="Education">
              <ul className="grid gap-4">
                {education.map((e) => (
                  <li key={`${e.school}-${e.year}`} className="card p-4">
                    <p className="font-display text-sm font-semibold">{e.degree}</p>
                    <p className="mt-0.5 text-sm text-muted">{e.school}</p>
                    <p className="mt-1.5 font-mono text-[0.625rem] text-faint tnum">
                      {e.year} · {e.grade}
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel icon={BadgeCheck} title="Certifications">
              <ul className="grid gap-2">
                {certifications.map((c) => (
                  <li key={c} className="flex gap-2.5 text-sm text-muted">
                    <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-accent2" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel icon={Award} title="Awards & recognition">
              <ul className="grid gap-2">
                {awards.map((a) => (
                  <li key={a} className="flex gap-2.5 text-sm text-muted">
                    <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </Panel>

            <div>
              <p className="eyebrow mb-3">Languages</p>
              <div className="flex flex-wrap gap-1.5">
                {spokenLanguages.map((l) => (
                  <span key={l} className="chip">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
