import raw from "../../data/portfolio.json";

export type Signal = "flagship" | "solid" | "minor";

export type Project = {
  id: string;
  name: string;
  owner: string;
  nameWithOwner: string;
  url: string;
  homepage: string | null;
  description: string | null;
  topics: string[];
  languages: { name: string; bytes: number; pct: number }[];
  primaryLanguage: string | null;
  license: string | null;
  stars: number;
  forks: number;
  commits: number;
  createdAt: string;
  pushedAt: string;
  isArchived: boolean;
  isOrg: boolean;
  org: string | null;
  roles: string[];
  primaryRole: string;
  headline: string;
  what: string;
  why: string;
  impact: string;
  highlights: string[];
  tech: string[];
  signal: Signal;
  enrichedBy: "groq" | "readme";
};

export type RoleGroup = { id: string; name: string; tagline: string; count: number };

export type Portfolio = {
  syncedAt: string;
  profile: {
    login: string;
    name: string;
    avatarUrl: string;
    location: string | null;
    company: string | null;
    followers: number;
    publicRepos: number;
    joinedAt: string;
  };
  stats: {
    projects: number;
    flagships: number;
    commitsByMe: number;
    stars: number;
    roles: number;
    orgs: number;
    yearsActive: number;
    contributionsLastYear: number;
    totalCommitContributions: number;
    totalIssueContributions: number;
    totalPullRequestContributions: number;
    privateContributions: number;
    /** `projects` = how many projects use the language; `pct` = share of all projects. */
    languages: { name: string; projects: number; bytes: number; pct: number }[];
  };
  /** One entry per calendar week; first and last weeks may be partial. */
  calendar: { date: string; contributionCount: number }[][];
  roles: RoleGroup[];
  roleCatalog: { id: string; name: string; tagline: string }[];
  orgs: { login: string; name?: string; description?: string; url: string; avatarUrl?: string; projects: number; commits: number }[];
  projects: Project[];
};

export const portfolio = raw as unknown as Portfolio;

/** Projects worth a full card, in ranked order. */
export const featured = portfolio.projects.filter((p) => p.signal !== "minor");

/** Coursework, assignments and small utilities — shown compactly, never dropped. */
export const archive = portfolio.projects.filter((p) => p.signal === "minor");

export const projectsForRole = (roleId: string) => featured.filter((p) => p.roles.includes(roleId));

/** Roles that have at least one non-archive project, in catalog order. */
export const activeRoles: RoleGroup[] = portfolio.roles
  .map((r) => ({ ...r, count: projectsForRole(r.id).length }))
  .filter((r) => r.count > 0);

export const roleName = (id: string) => portfolio.roleCatalog.find((r) => r.id === id)?.name ?? id;

export function relativeTime(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

/** 12.4k rather than 12400 — stat tiles have to stay narrow on phones. */
export function compact(n: number) {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
}
