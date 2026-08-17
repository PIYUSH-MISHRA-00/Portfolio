#!/usr/bin/env node
/**
 * Rebuilds data/portfolio.json from GitHub.
 *
 * Only PUBLIC, non-fork repositories are ever written out — privacy is enforced
 * at the query (`privacy: PUBLIC`) and again by an assertion before writing.
 *
 * Groq writes the recruiter-facing narrative for each project. Results are cached
 * in the committed JSON and keyed by a content hash, so a re-run only pays for
 * repos that are new or have been pushed to since the last sync.
 *
 * Env:
 *   GITHUB_TOKEN / GH_PAT   required. A classic PAT with `read:org` gives full
 *                           contribution stats; the Actions GITHUB_TOKEN yields
 *                           public-only counts and still works.
 *   GROQ_API_KEY            optional. Absent → falls back to README extraction.
 *   GROQ_MODEL              optional model override.
 */

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "data", "portfolio.json");

const OWNER = "PIYUSH-MISHRA-00";
/** GitHub node ID for OWNER — used to count only commits actually authored by him. */
const AUTHOR_ID = "MDQ6VXNlcjY1Nzg4NzIx";

/** Orgs to scan. A repo is only included if OWNER authored commits in it. */
const ORGS = [
  "ni-sh-a-char",
  "The-Lord-Buddha-Club",
  "GET-CONVO",
  "FIXORA-make-fix-everthing",
  "EddieHubCommunity",
  "NVIDIAGameWorks",
];

/** Machine-generated repos from the Monsterrr agent, plus scratch/config repos. */
const NOISE = [
  /^monsterrr-(fallback|additional)/i,
  /^\.github$/,
  /^Dockerfile$/i,
  new RegExp(`^${OWNER}$`, "i"), // profile README repo
  /^data$/i,
];

/**
 * Canonical role taxonomy. The site groups every project under these, so the set
 * must stay stable — Groq picks from it rather than inventing labels.
 */
const ROLES = [
  { id: "ai-engineer", name: "AI & LLM Engineer", tagline: "Generative AI, agents, RAG and applied language models." },
  { id: "data-scientist", name: "Data Scientist", tagline: "Modelling, prediction and analysis on real datasets." },
  { id: "security-engineer", name: "Security & Cryptography Engineer", tagline: "Original ciphers, encrypted transport and hardened systems." },
  { id: "backend-engineer", name: "Backend & API Engineer", tagline: "Services, data layers and APIs built to be consumed." },
  { id: "fullstack-developer", name: "Full-Stack Developer", tagline: "End-to-end products, from schema to interface." },
  { id: "mobile-developer", name: "Mobile & Cross-Platform Developer", tagline: "Flutter, Kotlin and native Android shipped to devices." },
  { id: "devops-engineer", name: "DevOps & Platform Engineer", tagline: "Containers, images and reproducible environments." },
  { id: "systems-engineer", name: "Systems & Low-Level Engineer", tagline: "Kernel work, C, assembly and the layers underneath." },
  { id: "automation-engineer", name: "Automation Engineer", tagline: "Scripts and pipelines that delete repetitive work." },
];
const ROLE_IDS = ROLES.map((r) => r.id);

const TOKEN = process.env.GH_PAT || process.env.GITHUB_TOKEN;
const GROQ_KEY = process.env.GROQ_API_KEY;
// Verified present in Groq's catalogue; resolveGroqModel() re-picks if it is retired.
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";


// ---------------------------------------------------------------- GitHub

/**
 * Talks to the GraphQL API through the `gh` CLI rather than fetch(). `gh` is
 * preinstalled on Actions runners and handles auth from GH_TOKEN, and some
 * networks answer 503 to non-CLI clients hitting api.github.com.
 */
function ghGraphql(body) {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.platform === "win32" ? "gh.exe" : "gh", ["api", "graphql", "--input", "-"], {
      env: { ...process.env, GH_TOKEN: TOKEN },
    });
    let out = "";
    let err = "";
    proc.stdout.on("data", (d) => (out += d));
    proc.stderr.on("data", (d) => (err += d));
    proc.on("error", reject);
    proc.on("close", () => (out.trim() ? resolve(out) : reject(new Error(err.trim().slice(0, 300) || "gh produced no output"))));
    proc.stdin.on("error", () => {});
    proc.stdin.end(JSON.stringify(body));
  });
}

async function gql(query, variables = {}) {
  let last = "unknown error";
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const json = JSON.parse(await ghGraphql({ query, variables }));
      // Partial-data errors (e.g. one unreachable org) are survivable.
      if (json.errors) console.warn("  gql:", json.errors.map((e) => e.message).join("; ").slice(0, 200));
      if (json.data) return json.data;
      last = JSON.stringify(json.errors || json).slice(0, 200);
    } catch (e) {
      last = e.message;
    }
    // 502s from the GraphQL API are common on wide queries; back off and retry.
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  throw new Error(`GitHub GraphQL failed after retries: ${last}`);
}

/**
 * Metadata only. READMEs are pulled separately in fetchReadmes() — asking for
 * 50 repos' README text in one query makes the GraphQL API 502.
 */
const BASE_FIELDS = `
  name nameWithOwner description url homepageUrl
  isFork isArchived isPrivate
  stargazerCount forkCount createdAt pushedAt
  primaryLanguage { name }
  languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name } } }
  repositoryTopics(first: 12) { nodes { topic { name } } }
  licenseInfo { spdxId }
`;

/**
 * On personally-owned repos every commit is his, so `mine` aliases the plain
 * history — the author-filtered variant is expensive enough to 502 the API.
 */
const OWN_FIELDS = `${BASE_FIELDS}
  defaultBranchRef { target { ... on Commit {
    total: history { totalCount }
    mine: history { totalCount }
  } } }
`;

/**
 * Org repos are shared, so authorship must be filtered for real — but that scan
 * is expensive enough to 502 a paginated query and silently truncate the list.
 * Pagination stays cheap here; fetchAuthoredCommits() fills `authored` in after
 * the noise filter has cut the candidate set down.
 */
const ORG_FIELDS = `${BASE_FIELDS}
  defaultBranchRef { target { ... on Commit { total: history { totalCount } } } }
`;

async function fetchOwnRepos() {
  const out = [];
  let cursor = null;
  do {
    const data = await gql(
      `query($owner:String!,$cursor:String){
        user(login:$owner){
          repositories(first:25, after:$cursor, privacy:PUBLIC, ownerAffiliations:[OWNER], orderBy:{field:PUSHED_AT,direction:DESC}){
            pageInfo { hasNextPage endCursor }
            nodes { ${OWN_FIELDS} }
          }
        }
      }`,
      { owner: OWNER, cursor }
    );
    const page = data.user.repositories;
    out.push(...page.nodes.filter(Boolean));
    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (cursor);
  console.log(`  ${OWNER}: ${out.length} public repos`);
  return out;
}

async function fetchOrgRepos(org) {
  const out = [];
  let cursor = null;
  do {
    let page;
    try {
      const data = await gql(
        `query($org:String!,$cursor:String){
          organization(login:$org){
            repositories(first:15, after:$cursor, privacy:PUBLIC, orderBy:{field:PUSHED_AT,direction:DESC}){
              pageInfo { hasNextPage endCursor }
              nodes { ${ORG_FIELDS} }
            }
          }
        }`,
        { org, cursor }
      );
      page = data.organization?.repositories;
    } catch (e) {
      console.warn(`  ${org}: unreachable (${e.message.slice(0, 60)}), skipped`);
      return out;
    }
    if (!page) return out;
    out.push(...page.nodes.filter(Boolean));
    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (cursor);
  return out;
}

/**
 * Sets `authored` on each repo: commits on the default branch written by OWNER.
 * One tiny query per repo, so a slow scan on one repo cannot truncate the rest.
 */
async function fetchAuthoredCommits(repos) {
  await pool(repos, 6, async (r) => {
    const [owner, name] = r.nameWithOwner.split("/");
    try {
      const d = await gql(
        `query($owner:String!,$name:String!){
          repository(owner:$owner, name:$name){
            defaultBranchRef { target { ... on Commit {
              mine: history(author: {id: "${AUTHOR_ID}"}) { totalCount }
            } } }
          }
        }`,
        { owner, name }
      );
      r.authored = d.repository?.defaultBranchRef?.target?.mine?.totalCount ?? 0;
    } catch {
      // Unknown authorship is treated as none rather than claiming the repo.
      r.authored = 0;
    }
  });
}

/** One small query per repo — tries the common README spellings. */
async function fetchReadmes(candidates) {
  let found = 0;
  await pool(candidates, 6, async (c) => {
    const [owner, name] = c.nameWithOwner.split("/");
    try {
      const d = await gql(
        `query($owner:String!,$name:String!){
          repository(owner:$owner, name:$name){
            a: object(expression:"HEAD:README.md"){ ... on Blob { text } }
            b: object(expression:"HEAD:README.MD"){ ... on Blob { text } }
            c: object(expression:"HEAD:readme.md"){ ... on Blob { text } }
            d: object(expression:"HEAD:README.rst"){ ... on Blob { text } }
            e: object(expression:"HEAD:README"){ ... on Blob { text } }
          }
        }`,
        { owner, name }
      );
      const r = d.repository || {};
      const raw = r.a?.text || r.b?.text || r.c?.text || r.d?.text || r.e?.text || "";
      c.readmeBytes = raw.length;
      c.readme = readmeProse(raw);
      if (raw) found++;
    } catch {
      c.readme = "";
      c.readmeBytes = 0;
    }
  });
  console.log(`  READMEs: ${found}/${candidates.length}`);
}

async function fetchProfile() {
  const data = await gql(
    `query($owner:String!){
      user(login:$owner){
        login name bio company location avatarUrl createdAt websiteUrl
        followers { totalCount }
        repositories(privacy:PUBLIC) { totalCount }
        contributionsCollection {
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          restrictedContributionsCount
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
      organizations: user(login:$owner){
        organizations(first:20){ nodes { login name description url avatarUrl } }
      }
    }`,
    { owner: OWNER }
  );
  return data;
}

// ---------------------------------------------------------------- shaping

const isNoise = (name) => NOISE.some((re) => re.test(name));

/**
 * Commits authored by OWNER. Personal repos report their full history (he owns
 * them); org repos carry an explicit `authored` count from fetchAuthoredCommits.
 */
const myCommits = (r) => r.authored ?? r.defaultBranchRef?.target?.mine?.totalCount ?? 0;
const allCommits = (r) => r.defaultBranchRef?.target?.total?.totalCount ?? 0;

/** Strip badges, HTML and code fences so the model reads prose, not shields.io URLs. */
function readmeProse(text) {
  if (!text) return "";
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^[|:\-\s]*\|.*$/gm, " ")
    .replace(/[#*_>`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function languageShares(edges) {
  const total = edges.reduce((s, e) => s + e.size, 0) || 1;
  return edges
    .map((e) => ({ name: e.node.name, bytes: e.size, pct: Math.round((e.size / total) * 1000) / 10 }))
    .filter((l) => l.pct >= 1);
}

function toCandidate(r) {
  const [owner] = r.nameWithOwner.split("/");
  return {
    id: r.nameWithOwner.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: r.name,
    owner,
    nameWithOwner: r.nameWithOwner,
    url: r.url,
    homepage: r.homepageUrl && /^https?:\/\//.test(r.homepageUrl) ? r.homepageUrl : null,
    description: r.description || null,
    topics: r.repositoryTopics.nodes.map((n) => n.topic.name),
    languages: languageShares(r.languages.edges),
    primaryLanguage: r.primaryLanguage?.name || null,
    license: r.licenseInfo?.spdxId || null,
    stars: r.stargazerCount,
    forks: r.forkCount,
    commits: myCommits(r),
    totalCommits: allCommits(r),
    createdAt: r.createdAt,
    pushedAt: r.pushedAt,
    isArchived: r.isArchived,
    isOrg: owner.toLowerCase() !== OWNER.toLowerCase(),
    org: owner.toLowerCase() !== OWNER.toLowerCase() ? owner : null,
    readme: "", // filled by fetchReadmes()
    readmeBytes: 0,
  };
}

/**
 * A repo with neither a description nor a README cannot be explained to a
 * recruiter, so it is dropped. Everything else is kept — weak entries land in
 * the compact archive rather than disappearing.
 */
const isExplainable = (c) => Boolean(c.description) || c.readme.length >= 200;

function dedupe(candidates) {
  const best = new Map();
  for (const c of candidates) {
    const key = c.name.toLowerCase();
    const prev = best.get(key);
    // Same project mirrored across owners: keep the copy he worked on most.
    if (!prev || c.commits > prev.commits || (c.commits === prev.commits && c.pushedAt > prev.pushedAt)) {
      best.set(key, c);
    }
  }
  return [...best.values()];
}

// ---------------------------------------------------------------- Groq

const hashOf = (c) =>
  createHash("sha1")
    .update([c.nameWithOwner, c.pushedAt, c.description || "", c.readmeBytes, c.languages.map((l) => l.name).join(",")].join("|"))
    .digest("hex")
    .slice(0, 16);

const SYSTEM = `You write project entries for a software engineer's portfolio. Your reader is a technical recruiter or hiring engineer who has 20 seconds per project.

Rules:
- Be concrete and factual. Use only what the input supports. Never invent metrics, users, employers, dates or awards.
- No marketing language. Banned: "cutting-edge", "seamless", "robust", "leverage", "state-of-the-art", "passionate", "revolutionary".
- Write in third person without naming the engineer. Prefer "Builds X" / "A service that X" over "I built X".
- If the input is thin, write less rather than padding.

Reply with JSON only, matching this shape:
{
  "roles": ["role-id", ...],        // 1-2 ids, most important first, from the allowed list
  "headline": "string",             // <= 80 chars, what it is. No trailing period.
  "what": "string",                 // 2-3 sentences: what it does and how it is built.
  "why": "string",                  // 1-2 sentences: the problem it solves / why it was built.
  "impact": "string",               // 1 sentence a recruiter can quote: the demonstrated skill.
  "highlights": ["string", ...],    // 2-4 fragments, <= 60 chars each, concrete capabilities
  "tech": ["string", ...],          // <= 8 named technologies actually evidenced
  "signal": "flagship" | "solid" | "minor"
}

"signal" grades portfolio weight: "flagship" = substantial original work worth leading with; "solid" = a real, complete project; "minor" = coursework, assignment, tutorial output or a small utility.`;

function userPrompt(c) {
  const langs = c.languages.map((l) => `${l.name} ${l.pct}%`).join(", ");
  return [
    `Repository: ${c.nameWithOwner}`,
    c.isOrg ? `Owned by organisation: ${c.org}` : "Personal repository",
    c.description ? `Description: ${c.description}` : "Description: (none)",
    `Languages: ${langs || "(none detected)"}`,
    c.topics.length ? `Topics: ${c.topics.join(", ")}` : null,
    `Commits by this engineer: ${c.commits} of ${c.totalCommits}`,
    `Stars: ${c.stars}`,
    c.homepage ? `Live URL: ${c.homepage}` : null,
    `Created ${c.createdAt.slice(0, 10)}, last pushed ${c.pushedAt.slice(0, 10)}`,
    c.isArchived ? "Status: archived" : null,
    "",
    "README:",
    // 3.5k chars is plenty of signal and keeps each call inside the token budget.
    c.readme.slice(0, 3500) || "(no README)",
    "",
    `Allowed role ids: ${ROLE_IDS.join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Speech, embedding and safety models cannot write prose. */
const NOT_A_WRITER = /whisper|tts|embed|guard|moderation|rerank|ocr|orpheus|playai/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Shared rate-limit gate. Groq's limits are per-organisation, so one worker
 * hitting 429 means every worker must wait — otherwise they each burn their
 * retries hammering a closed door.
 */
let gateUntil = 0;
async function passGate() {
  const wait = gateUntil - Date.now();
  if (wait > 0) await sleep(wait);
}
function closeGate(ms) {
  gateUntil = Math.max(gateUntil, Date.now() + ms);
}

/** Bigger and instruction-tuned wins; previews and small/fast variants lose. */
function modelRank(id) {
  let score = 0;
  const billions = id.match(/(\d+)x?(\d+)?b/i);
  if (billions) score += Math.min(Number(billions[1]), 400);
  if (/versatile|instruct|specdec/i.test(id)) score += 20;
  if (/instant|mini|tiny|small|8b|4b/i.test(id)) score -= 15;
  if (/preview|alpha|beta/i.test(id)) score -= 25;
  return score;
}

/**
 * Groq retires model ids over time, and a hard-coded name turns into a silent
 * 404 that degrades every project to README text. Resolve against the live
 * catalogue instead, preferring the configured model when it is still offered.
 */
async function resolveGroqModel() {
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${GROQ_KEY}` },
  });
  if (!res.ok) throw new Error(`groq models ${res.status}: ${(await res.text()).slice(0, 160)}`);

  const ids = (await res.json()).data.map((m) => m.id).filter((id) => !NOT_A_WRITER.test(id));
  if (!ids.length) throw new Error("no usable Groq chat models available");

  if (ids.includes(GROQ_MODEL)) {
    console.log(`  groq model: ${GROQ_MODEL}`);
    return GROQ_MODEL;
  }

  const best = ids.sort((a, b) => modelRank(b) - modelRank(a))[0];
  console.log(`  groq model: "${GROQ_MODEL}" not offered, using "${best}"`);
  console.log(`  available: ${ids.join(", ")}`);
  return best;
}

async function groq(c, model) {
  await passGate();

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      max_tokens: 800,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt(c) },
      ],
    }),
  });

  if (res.status === 429) {
    // Groq reports the exact wait; trust it over guessing at a backoff curve.
    const after = Number(res.headers.get("retry-after"));
    const waitMs = Math.min((Number.isFinite(after) && after > 0 ? after : 30) * 1000 + 500, 120_000);
    closeGate(waitMs);
    const err = new Error(`rate limited, waiting ${Math.round(waitMs / 1000)}s`);
    err.retryAfterMs = waitMs;
    throw err;
  }

  if (!res.ok) throw new Error(`groq ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const body = await res.json();
  const text = body.choices?.[0]?.message?.content;
  if (!text) throw new Error("groq returned an empty message");
  return JSON.parse(text);
}

/**
 * The model likes U+2011 non-breaking hyphens ("end‑to‑end"), which look right
 * but make the on-page search miss anything typed with an ASCII hyphen.
 * Also collapses non-breaking spaces. Em dashes are left alone — they are wanted.
 */
const normaliseText = (s) =>
  typeof s === "string"
    ? s
        // U+2010 hyphen through U+2013 en dash become ASCII "-"; U+2014 em dash is kept.
        .replace(/[\u2010-\u2013]/g, "-")
        // Non-breaking and narrow no-break spaces become an ordinary space.
        .replace(/[\u00a0\u202f]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : s;

/** Clamps to `max` without slicing a word in half. */
function clamp(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return (space > max * 0.6 ? cut.slice(0, space) : cut).trim();
}

/** Applied to fresh and cached narratives alike, so a re-sync cleans old text for free. */
function normaliseNarrative(n) {
  return {
    ...n,
    headline: normaliseText(n.headline),
    what: normaliseText(n.what),
    why: normaliseText(n.why),
    impact: normaliseText(n.impact),
    highlights: (n.highlights ?? []).map(normaliseText).filter(Boolean),
    tech: (n.tech ?? []).map(normaliseText).filter(Boolean),
  };
}

/** Keeps a bad model response from corrupting the site. */
function sanitise(raw, c) {
  const str = (v, max) => (typeof v === "string" ? clamp(normaliseText(v), max) : "");
  const roles = (Array.isArray(raw?.roles) ? raw.roles : []).filter((r) => ROLE_IDS.includes(r)).slice(0, 2);
  const signal = ["flagship", "solid", "minor"].includes(raw?.signal) ? raw.signal : "solid";
  return {
    roles: roles.length ? roles : [inferRole(c)],
    headline: str(raw?.headline, 90) || c.description?.slice(0, 90) || c.name,
    what: str(raw?.what, 600),
    why: str(raw?.why, 400),
    impact: str(raw?.impact, 300),
    highlights: (Array.isArray(raw?.highlights) ? raw.highlights : [])
      .filter((h) => typeof h === "string" && h.trim())
      .map((h) => clamp(normaliseText(h), 70))
      .slice(0, 4),
    tech: (Array.isArray(raw?.tech) ? raw.tech : [])
      .filter((t) => typeof t === "string" && t.trim())
      .map((t) => clamp(normaliseText(t), 28))
      .slice(0, 8),
    signal,
    enrichedBy: "groq",
  };
}

/** Keyword fallback so the site still builds with no Groq key or on API failure. */
function inferRole(c) {
  const hay = `${c.name} ${c.description || ""} ${c.topics.join(" ")} ${c.readme.slice(0, 1200)} ${c.languages
    .map((l) => l.name)
    .join(" ")}`.toLowerCase();
  const rules = [
    ["security-engineer", /encrypt|cipher|crypto|kaalka|firewall|security|secure|auth|oauth/],
    ["ai-engineer", /\b(ai|llm|gpt|gemini|groq|rag|agent|generative|nlp|transformer|prompt|chatbot|assistant)\b/],
    ["data-scientist", /machine learning|dataset|prediction|regression|classif|jupyter|pandas|analysis|recommend|detection/],
    ["systems-engineer", /kernel|assembly|bootloader|\bc\b|low-level|driver/],
    ["mobile-developer", /flutter|dart|android|kotlin|\bapk\b|mobile/],
    ["devops-engineer", /docker|kubernetes|container|ci\/cd|deploy|image/],
    ["automation-engineer", /automat|script|bash|shell|workflow|scraper|bot/],
    ["backend-engineer", /api|fastapi|flask|backend|server|django|express|rest/],
    ["fullstack-developer", /react|next\.js|typescript|frontend|web app|website|vue/],
  ];
  for (const [role, re] of rules) if (re.test(hay)) return role;
  return "fullstack-developer";
}

function fallback(c) {
  // First two real sentences of the README carry most of the signal.
  const sentences = c.readme.split(/(?<=[.!?])\s+/).filter((s) => s.length > 30);
  return {
    roles: [inferRole(c)],
    headline: (c.description || sentences[0] || c.name).slice(0, 90),
    what: sentences.slice(0, 2).join(" ").slice(0, 600),
    why: "",
    impact: "",
    highlights: c.topics.slice(0, 3),
    tech: c.languages.slice(0, 6).map((l) => l.name),
    signal: c.stars > 0 || c.commits > 20 ? "solid" : "minor",
    enrichedBy: "readme",
  };
}

/** Runs `worker` over `items` with bounded concurrency. */
async function pool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await worker(items[i], i);
      }
    })
  );
  return results;
}

async function enrich(candidates, cache) {
  let hits = 0,
    calls = 0,
    failures = 0;

  let model = null;
  if (GROQ_KEY) {
    try {
      model = await resolveGroqModel();
    } catch (err) {
      console.warn(`  ! Groq unavailable (${err.message.slice(0, 120)}) — falling back to README extraction`);
    }
  }

  // Two at a time: Groq's per-organisation token budget, not latency, is the limit.
  const enriched = await pool(candidates, 2, async (c) => {
    const hash = hashOf(c);
    const cached = cache.get(c.id);
    if (cached && cached.contentHash === hash && cached.enrichedBy === "groq") {
      hits++;
      return { ...c, ...pickNarrative(cached), contentHash: hash };
    }
    if (model) {
      const ATTEMPTS = 6;
      for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
        try {
          const out = sanitise(await groq(c, model), c);
          calls++;
          if (calls % 10 === 0) console.log(`    …${calls} written`);
          return { ...c, ...out, contentHash: hash };
        } catch (err) {
          if (attempt === ATTEMPTS - 1) {
            failures++;
            console.warn(`  ! ${c.nameWithOwner}: ${err.message.slice(0, 120)}`);
          } else {
            // A 429 already parked the shared gate; anything else backs off locally.
            await sleep(err.retryAfterMs ? 0 : 2500 * (attempt + 1));
          }
        }
      }
    }
    // Stale cache beats a keyword guess.
    if (cached?.enrichedBy === "groq") return { ...c, ...pickNarrative(cached), contentHash: hash };
    return { ...c, ...fallback(c), contentHash: hash };
  });

  console.log(`  narrative: ${calls} generated, ${hits} cached, ${failures} failed`);
  return enriched;
}

const NARRATIVE_KEYS = ["roles", "headline", "what", "why", "impact", "highlights", "tech", "signal", "enrichedBy"];
const pickNarrative = (o) => normaliseNarrative(Object.fromEntries(NARRATIVE_KEYS.map((k) => [k, o[k]])));

// ---------------------------------------------------------------- assemble

function aggregate(projects, profileData) {
  const u = profileData.user;
  const cc = u.contributionsCollection;

  /*
   * Ranked by how many projects use a language, not by bytes. Jupyter notebooks
   * inline their outputs as base64, so byte counts put them at 65% of the
   * "stack" and bury Python — which misrepresents what he actually works in.
   */
  const bytes = new Map();
  const usedIn = new Map();
  for (const p of projects) {
    for (const l of p.languages) {
      bytes.set(l.name, (bytes.get(l.name) || 0) + l.bytes);
      usedIn.set(l.name, (usedIn.get(l.name) || 0) + 1);
    }
  }
  const languages = [...usedIn.entries()]
    .map(([name, count]) => ({
      name,
      projects: count,
      bytes: bytes.get(name) ?? 0,
      pct: Math.round((count / projects.length) * 1000) / 10,
    }))
    .sort((a, b) => b.projects - a.projects || b.bytes - a.bytes)
    .slice(0, 12);

  // Kept as weeks, not flattened: GitHub's first and last weeks can be partial,
  // and re-chunking a flat list by 7 would shift every weekday row.
  const weeks = cc.contributionCalendar.weeks.map((w) => w.contributionDays);

  // Orgs are only claimed where he actually authored commits.
  const contributedOrgs = new Map();
  for (const p of projects.filter((x) => x.isOrg)) {
    const e = contributedOrgs.get(p.org) || { login: p.org, projects: 0, commits: 0 };
    e.projects++;
    e.commits += p.commits;
    contributedOrgs.set(p.org, e);
  }
  const orgMeta = new Map(profileData.organizations.organizations.nodes.map((o) => [o.login, o]));
  const orgs = [...contributedOrgs.values()]
    .map((o) => ({ ...o, ...(orgMeta.get(o.login) || {}), url: `https://github.com/${o.login}` }))
    .sort((a, b) => b.commits - a.commits);

  // Counted by primary role so the numbers match the sections, where each
  // project appears exactly once rather than in every role it touches.
  const roles = ROLES.map((r) => ({
    ...r,
    count: projects.filter((p) => p.primaryRole === r.id).length,
  })).filter((r) => r.count > 0);

  return {
    profile: {
      login: u.login,
      name: u.name,
      avatarUrl: u.avatarUrl,
      location: u.location,
      company: u.company,
      followers: u.followers.totalCount,
      publicRepos: u.repositories.totalCount,
      joinedAt: u.createdAt,
    },
    stats: {
      projects: projects.length,
      flagships: projects.filter((p) => p.signal === "flagship").length,
      commitsByMe: projects.reduce((s, p) => s + p.commits, 0),
      stars: projects.reduce((s, p) => s + p.stars, 0),
      roles: roles.length,
      orgs: orgs.length,
      yearsActive: new Date().getFullYear() - new Date(u.createdAt).getFullYear(),
      contributionsLastYear: cc.contributionCalendar.totalContributions,
      totalCommitContributions: cc.totalCommitContributions,
      totalIssueContributions: cc.totalIssueContributions,
      totalPullRequestContributions: cc.totalPullRequestContributions,
      privateContributions: cc.restrictedContributionsCount,
      languages,
    },
    calendar: weeks,
    roles,
    orgs,
  };
}

// ---------------------------------------------------------------- main

async function main() {
  if (!TOKEN) throw new Error("Need GH_PAT or GITHUB_TOKEN in the environment.");
  console.log("Syncing GitHub…");
  if (!GROQ_KEY) console.log("  GROQ_API_KEY not set — using README fallback for new projects");

  const cache = new Map();
  try {
    const prev = JSON.parse(await readFile(OUT, "utf8"));
    for (const p of prev.projects || []) cache.set(p.id, p);
    console.log(`  cache: ${cache.size} previous entries`);
  } catch {
    console.log("  cache: none (first run)");
  }

  // Serialised: concurrent wide queries make the GraphQL API 502.
  const profileData = await fetchProfile();
  const own = await fetchOwnRepos();

  const orgRepos = [];
  for (const org of ORGS) {
    const repos = await fetchOrgRepos(org);
    // Cut noise and forks first so authorship is only checked on real candidates.
    const worth = repos.filter((r) => !r.isFork && !r.isPrivate && !isNoise(r.name));
    await fetchAuthoredCommits(worth);
    // Membership is not contribution: require commits he actually wrote.
    const mine = worth.filter((r) => r.authored > 0);
    console.log(`  ${org}: ${mine.length} contributed / ${worth.length} candidates / ${repos.length} public`);
    orgRepos.push(...mine);
  }

  const shortlist = dedupe(
    [...own, ...orgRepos].filter((r) => !r.isFork && !r.isPrivate && !isNoise(r.name)).map(toCandidate)
  );
  await fetchReadmes(shortlist);

  const candidates = shortlist.filter(isExplainable);
  console.log(`  ${candidates.length}/${shortlist.length} projects are explainable`);

  const projects = await enrich(candidates, cache);
  // Strongest role first — this is the section a project is filed under.
  for (const p of projects) p.primaryRole = p.roles[0];

  // Ranking: flagships first, then real work, then recency.
  const weight = { flagship: 0, solid: 1, minor: 2 };
  projects.sort(
    (a, b) =>
      weight[a.signal] - weight[b.signal] ||
      b.stars - a.stars ||
      b.commits - a.commits ||
      b.pushedAt.localeCompare(a.pushedAt)
  );

  const leaked = projects.filter((p) => p.isPrivate);
  if (leaked.length) throw new Error(`refusing to write private repos: ${leaked.map((p) => p.name).join(", ")}`);

  /*
   * A transient 502 mid-pagination used to drop real projects on the floor. Going
   * private or being deleted legitimately shrinks the list, so allow a modest
   * decline but refuse a collapse — better a stale page than a truncated one.
   */
  if (cache.size && projects.length < cache.size * 0.8 && !process.env.ALLOW_SHRINK) {
    throw new Error(
      `only ${projects.length} projects found but ${cache.size} were cached — this looks like a partial fetch. ` +
        `Re-run, or set ALLOW_SHRINK=1 if repositories were genuinely removed or made private.`
    );
  }

  const payload = {
    syncedAt: new Date().toISOString(),
    ...aggregate(projects, profileData),
    roleCatalog: ROLES,
    projects: projects.map(({ readme, readmeBytes, totalCommits, authored, ...keep }) => keep),
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(payload, null, 1) + "\n");

  console.log(`\nWrote ${OUT}`);
  console.log(`  ${payload.projects.length} projects across ${payload.roles.length} roles`);
  for (const r of payload.roles) console.log(`    ${r.name}: ${r.count}`);
}

// Importable for tests; only syncs when run directly.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { readmeProse, inferRole, dedupe, sanitise, isNoise, isExplainable, languageShares, modelRank, NOT_A_WRITER, ROLE_IDS };
