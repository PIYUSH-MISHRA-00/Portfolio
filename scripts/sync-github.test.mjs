// Self-check for sync-github.mjs. Run: node scripts/sync-github.test.mjs
import assert from "node:assert/strict";
import {
  readmeProse,
  inferRole,
  dedupe,
  sanitise,
  isNoise,
  isExplainable,
  languageShares,
  modelRank,
  isFreeModel,
  isAiWritten,
  NOT_A_WRITER,
  PROVIDERS,
  ROLE_IDS,
} from "./sync-github.mjs";

// --- noise filter: the Monsterrr agent generates dozens of junk repos
assert.equal(isNoise("monsterrr-fallback-20250927-1049"), true);
assert.equal(isNoise("monsterrr-additional-20250926-1832-2"), true);
assert.equal(isNoise(".github"), true);
assert.equal(isNoise("PIYUSH-MISHRA-00"), true);
assert.equal(isNoise("Monsterrr"), false, "the real Monsterrr project must survive");
assert.equal(isNoise("KaalChat"), false);

// --- explainability gate
assert.equal(isExplainable({ description: "A thing", readme: "" }), true);
assert.equal(isExplainable({ description: null, readme: "x".repeat(200) }), true);
assert.equal(isExplainable({ description: null, readme: "too short" }), false);

// --- README cleaning strips badges/links/fences, keeps prose
const cleaned = readmeProse(
  "# Title\n![badge](https://shields.io/x)\n[Docs](http://d.io)\n```js\nconst x=1\n```\nA desktop assistant for live transcription."
);
assert.ok(!cleaned.includes("shields.io"), "badge URLs must go");
assert.ok(!cleaned.includes("const x"), "code fences must go");
assert.ok(cleaned.includes("A desktop assistant for live transcription."));
assert.ok(cleaned.includes("Docs"), "link text is kept, target dropped");

// --- dedupe keeps the copy with more authored commits (NATRAJ lives in two orgs)
const picked = dedupe([
  { name: "NATRAJ", nameWithOwner: "The-Lord-Buddha-Club/NATRAJ", commits: 26, pushedAt: "2023-12-18" },
  { name: "NATRAJ", nameWithOwner: "ni-sh-a-char/NATRAJ", commits: 131, pushedAt: "2025-12-25" },
  { name: "KaalChat", nameWithOwner: "PIYUSH-MISHRA-00/KaalChat", commits: 1, pushedAt: "2026-04-21" },
]);
assert.equal(picked.length, 2);
assert.equal(picked.find((p) => p.name === "NATRAJ").nameWithOwner, "ni-sh-a-char/NATRAJ");

// --- role inference fallback lands in the taxonomy
for (const c of [
  { name: "Kaalka", description: "encryption algorithm", topics: [], readme: "", languages: [] },
  { name: "x", description: "an LLM agent using Groq", topics: [], readme: "", languages: [] },
  { name: "RESENTMENT---kernel", description: "a kernel", topics: [], readme: "", languages: [{ name: "Assembly" }] },
  { name: "blank", description: "", topics: [], readme: "", languages: [] },
]) {
  assert.ok(ROLE_IDS.includes(inferRole(c)), `${c.name} -> valid role`);
}
assert.equal(inferRole({ name: "Kaalka", description: "encryption algorithm", topics: [], readme: "", languages: [] }), "security-engineer");

// --- sanitise rejects hallucinated roles and clamps runaway output
const s = sanitise(
  { roles: ["ceo", "ai-engineer"], headline: "h".repeat(300), highlights: ["a", 5, null, "b", "c", "d", "e"], tech: ["Python"], signal: "amazing" },
  { name: "x", description: "d", topics: [], readme: "", languages: [] }
);
assert.deepEqual(s.roles, ["ai-engineer"], "invalid role ids dropped");
assert.ok(s.headline.length <= 90, "headline clamped");
assert.equal(s.highlights.length, 4, "highlights capped at 4");
assert.equal(s.signal, "solid", "invalid signal falls back");

// roles must never be empty — the site groups by them
const empty = sanitise({ roles: [] }, { name: "Assist", description: "AI assistant", topics: [], readme: "", languages: [] });
assert.equal(empty.roles.length, 1);
assert.ok(ROLE_IDS.includes(empty.roles[0]));

// --- language shares are percentages that ignore trace languages
const shares = languageShares([
  { size: 900, node: { name: "Python" } },
  { size: 100, node: { name: "Shell" } },
  { size: 2, node: { name: "Makefile" } },
]);
assert.deepEqual(shares.map((l) => l.name), ["Python", "Shell"], "sub-1% languages dropped");
assert.equal(shares[0].pct, 89.8, "pct is of all bytes, including the dropped trace ones");

// --- Groq model selection: a retired model id must not silently degrade the site
const catalogue = [
  "whisper-large-v3",
  "llama-guard-4-12b",
  "playai-tts",
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "text-embedding-3",
];
const writers = catalogue.filter((id) => !NOT_A_WRITER.test(id));
assert.deepEqual(writers, ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"], "non-chat models excluded");
assert.equal(
  [...writers].sort((a, b) => modelRank(b) - modelRank(a))[0],
  "llama-3.3-70b-versatile",
  "the larger instruction-tuned model must win"
);
assert.ok(modelRank("llama-3.3-70b-versatile") > modelRank("llama-3.1-8b-instant"));

// --- unicode hyphens must not survive: they break on-page search for "end-to-end"
const dashed = sanitise(
  {
    roles: ["ai-engineer"],
    headline: "Time‑based end‐to–end encryption",
    what: "Uses a non‑breaking space and hyphen.",
    tech: ["1D Convolutional Neural Network Layer", "Node.js"],
    highlights: ["Real‑time transcription"],
    signal: "solid",
  },
  { name: "x", description: "d", topics: [], readme: "", languages: [] }
);
assert.equal(dashed.headline, "Time-based end-to-end encryption", "all hyphen variants become ASCII");
assert.equal(dashed.what, "Uses a non-breaking space and hyphen.", "nbsp becomes a plain space");
assert.equal(dashed.highlights[0], "Real-time transcription");
// Long tech labels are cut at a word boundary, never mid-word.
assert.ok(dashed.tech[0].length <= 28);
assert.ok(!dashed.tech[0].endsWith(" "), "no trailing space from the clamp");
assert.equal(dashed.tech[0], "1D Convolutional Neural", "clamped on a word boundary");
assert.equal(dashed.tech[1], "Node.js", "short labels pass through untouched");

// --- free-model detection: a paid model must never be picked on a freeOnly provider
assert.equal(isFreeModel({ id: "meta-llama/llama-3.3-70b-instruct:free" }), true, ":free suffix");
assert.equal(isFreeModel({ id: "deepseek-v4-flash-free" }), true, "free as a word in the id");
assert.equal(isFreeModel({ id: "big-pickle", pricing: { prompt: "0", completion: "0" } }), true, "zero-priced");
assert.equal(isFreeModel({ id: "anthropic/claude-opus", pricing: { prompt: "0.000015", completion: "0.000075" } }), false);
assert.equal(isFreeModel({ id: "openai/gpt-5" }), false, "unknown pricing is not assumed free");
// "freedom-model" would be a false positive without a word boundary.
assert.equal(isFreeModel({ id: "acme/freedom-13b" }), false, "'free' must match as a whole word");

// --- provider registry sanity
const ids = PROVIDERS.map((p) => p.id);
assert.equal(new Set(ids).size, ids.length, "provider ids are unique");
assert.equal(ids[0], "custom", "an explicitly configured endpoint is tried first");
assert.equal(ids[ids.length - 1], "openrouter", "the smallest free allowance is the last resort");
for (const p of PROVIDERS) {
  assert.ok(p.keyEnv, `${p.id} declares a key env var`);
  if (p.id !== "custom") assert.match(p.base, /^https:\/\//, `${p.id} has an https base URL`);
  assert.ok(!/\/(chat|models)/.test(p.base ?? ""), `${p.id} base URL excludes the path segment`);
}
// Both of these mix free and paid models in one catalogue; picking a paid one
// by accident would bill the account, so freeOnly is not optional for them.
for (const id of ["openrouter", "opencode-zen"]) {
  assert.ok(PROVIDERS.find((p) => p.id === id).freeOnly, `${id} serves paid models too and must be freeOnly`);
}

// --- selection against real catalogue snapshots (captured from the live /models)
const pick = (ids) => [...ids].filter((i) => !NOT_A_WRITER.test(i)).sort((a, b) => modelRank(b) - modelRank(a))[0];

// OpenCode Zen: the paid Claude/GPT ids must be filtered out before ranking.
const zen = [
  "claude-opus-5",
  "gpt-5.5-pro",
  "gemini-3.7-flash",
  "big-pickle",
  "deepseek-v4-flash-free",
  "nemotron-3-ultra-free",
  "laguna-s-2.1-free",
];
const zenFree = zen.filter((id) => isFreeModel({ id }));
assert.ok(!zenFree.includes("claude-opus-5"), "paid Claude must not survive the free filter");
assert.ok(!zenFree.includes("gpt-5.5-pro"), "paid GPT must not survive the free filter");
assert.deepEqual(zenFree.sort(), ["deepseek-v4-flash-free", "laguna-s-2.1-free", "nemotron-3-ultra-free"]);
assert.equal(pick(zenFree), "nemotron-3-ultra-free", "'ultra' outranks 'flash' among free models");

// OpenRouter free slice: a "-mini"/"preview" model should lose to a plain one.
const or = [
  "nvidia/nemotron-3.5-lightning:free",
  "cohere/north-mini-code:free",
  "dots-studio/dots-3-note-preview:free",
  "poolside/laguna-s-2.1:free",
];
assert.ok(or.every((id) => isFreeModel({ id })), "every :free id is detected as free");
assert.ok(["nvidia/nemotron-3.5-lightning:free", "poolside/laguna-s-2.1:free"].includes(pick(or)), "mini/preview lose");

// --- cache reuse: AI text is reusable across syncs, keyword fallbacks are not
assert.equal(isAiWritten({ enrichedBy: "ai" }), true);
assert.equal(isAiWritten({ enrichedBy: "groq" }), true, "narratives from the pre-multi-provider era still count");
assert.equal(isAiWritten({ enrichedBy: "readme" }), false, "a keyword guess must be retried, not cached");
assert.equal(isAiWritten(undefined), false);

console.log("sync-github: all checks passed");
