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
  NOT_A_WRITER,
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

console.log("sync-github: all checks passed");
