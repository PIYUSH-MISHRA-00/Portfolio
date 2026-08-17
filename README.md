# Piyush Mishra — Portfolio

Live: **https://piyush-mishra-00.github.io/Portfolio/**

A self-maintaining portfolio. Projects are not written by hand: a GitHub Action reads every
**public, non-fork** repository across the personal account and the organisations where commits were
actually authored, has a free LLM write the recruiter-facing narrative for each, and commits the
result to `data/portfolio.json`. The site is a static export of that file.

The page is organised by **role** rather than by a single job title — each role section lists the
projects that evidence it, with a live count.

## How it stays current

| Trigger | When |
| --- | --- |
| `schedule` | 05:17 and 17:17 UTC daily — picks up new repos and newly-public repos |
| `push` to `main` | Design or content changes to this repo |
| `repository_dispatch` | On demand from any other repository, for instant reflection |
| `workflow_dispatch` | Manual run, optionally forcing a full narrative regeneration |

To make another repository update this portfolio the moment it is pushed, add this to that repo
(`.github/workflows/notify-portfolio.yml`) with a `PORTFOLIO_DISPATCH` secret holding a PAT that has
`repo` scope:

```yaml
name: Notify portfolio
on:
  push:
    branches: [main]
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -sS -X POST \
            -H "Authorization: Bearer ${{ secrets.PORTFOLIO_DISPATCH }}" \
            -H "Accept: application/vnd.github+json" \
            https://api.github.com/repos/PIYUSH-MISHRA-00/Portfolio/dispatches \
            -d '{"event_type":"repo-updated"}'
```

Without it, the twice-daily schedule still catches everything — just up to 12 hours later.

## What is included, and what is not

- **Included**: public, non-fork repositories with either a description or a README of 200+ characters.
- **Organisations**: listed only where commits were genuinely authored. Membership alone does not
  qualify, so `NVIDIAGameWorks`, `EddieHubCommunity` and `FIXORA` do not appear as contributions.
- **Excluded**: every private repository (enforced by `privacy: PUBLIC` on the query *and* an
  assertion before the file is written), forks, and the machine-generated `monsterrr-*` repos.
- **Nothing is silently dropped.** Projects graded `minor` — coursework, internship deliverables,
  small utilities — appear in a compact Archive list rather than being hidden.

## Configuration

### AI providers (all free tiers)

Narratives are written by whichever free, OpenAI-compatible provider is configured. **Any single key
is enough.** Set several and they act as a failover chain: a provider that hits its free rate limit
hands the next project to another instead of stalling — which is what lets ~90 projects finish in one
pass. With no key at all the sync still succeeds, falling back to README extraction.

Providers are tried in this order, best free allowance first:

| Secret | Provider | Free allowance | Get a key |
| --- | --- | --- | --- |
| `AI_API_KEY` + `AI_BASE_URL` (var) | anything OpenAI-compatible | — | Mistral, Together, DeepInfra, a local Ollama… |
| `CEREBRAS_API_KEY` | Cerebras | ~1M tokens/day, fastest | [cloud.cerebras.ai](https://cloud.cerebras.ai) |
| `GROQ_API_KEY` | Groq | ~30 requests/min | [console.groq.com](https://console.groq.com) |
| `NVIDIA_API_KEY` | NVIDIA NIM | free tier, 100+ models | [build.nvidia.com](https://build.nvidia.com) |
| `OPENCODE_ZEN_API_KEY` | OpenCode Zen | free coding models | [opencode.ai/auth](https://opencode.ai/auth) |
| `OPENROUTER_API_KEY` | OpenRouter | ~20/min, ~50/day | [openrouter.ai/keys](https://openrouter.ai/keys) |

```bash
gh secret set CEREBRAS_API_KEY        # recommended: highest free volume
gh secret set OPENROUTER_API_KEY      # add a second for failover
```

Models are **not hard-coded**. Each provider's `/models` catalogue is queried and the strongest
chat-capable model is chosen, skipping speech, embedding, moderation and image models. OpenRouter is
restricted to zero-cost models (`:free` suffix or zero pricing) so it can never bill you. Pin one
explicitly with a repo variable if you prefer — `GROQ_MODEL`, `CEREBRAS_MODEL`, `OPENROUTER_MODEL`,
`NVIDIA_MODEL`, `OPENCODE_ZEN_MODEL`, `AI_MODEL`.

Adding a provider that is already OpenAI-compatible needs no code change: set `AI_BASE_URL` (e.g.
`https://api.mistral.ai/v1`) and `AI_API_KEY`.

### GitHub access

| Secret | Required | Purpose |
| --- | --- | --- |
| `GH_PAT` | optional | Classic PAT with `read:org`. Unlocks full contribution totals; the default `GITHUB_TOKEN` gives public-only counts. |

Narratives are cached in `data/portfolio.json` and keyed by a content hash of each repo, so a sync
only spends tokens on repositories that are new or have been pushed to since last time. A steady-state
run costs a handful of requests, which fits inside even the smallest free tier.

## Local development

```bash
npm install
npm test                 # self-check for the sync logic
GH_PAT=$(gh auth token) CEREBRAS_API_KEY=... npm run sync
npm run dev              # http://localhost:3000/Portfolio
npm run build            # static export to out/
```

`npm run sync` talks to GitHub through the `gh` CLI rather than `fetch`, because some networks answer
503 to non-CLI clients hitting `api.github.com`.

## Features

- **Role-first structure** — nine role sections, each with its own project set and count; the hero
  headline cycles them instead of claiming one title.
- **Command palette** (`⌘K` / `Ctrl-K` / `/`) — fuzzy search over every project, role and link, with
  a visible button so it works without a keyboard.
- **Brief mode** — condenses the page into a dense recruiter document; `⌘P` then produces a clean
  PDF via the print stylesheet.
- **Live signal** — contribution heatmap and language distribution computed from actual bytes of code.
- **Light and dark themes**, resolved before first paint.
- **Installable** — web manifest with `display: standalone`, so it opens chromeless as an app.
- **Fully responsive with no feature loss** — narrow screens re-layout and scroll rather than hiding
  controls; the mobile sheet carries every section, role and link.

## Stack

Next.js 14 (App Router, static export) · Tailwind CSS · TypeScript · Groq · GitHub Actions.
No animation, state or icon-heavy dependencies — reveals use `IntersectionObserver`, ambience is CSS.
