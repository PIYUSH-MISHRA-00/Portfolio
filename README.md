# Piyush Mishra — Portfolio

Live: **https://piyush-mishra-00.github.io/Portfolio/**

A self-maintaining portfolio. Projects are not written by hand: a GitHub Action reads every
**public, non-fork** repository across the personal account and the organisations where commits were
actually authored, asks Groq to write the recruiter-facing narrative for each, and commits the result
to `data/portfolio.json`. The site is a static export of that file.

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

| Secret / variable | Required | Purpose |
| --- | --- | --- |
| `GROQ_API_KEY` | recommended | Writes the what / why / demonstrates copy. Missing → falls back to README extraction. |
| `GH_PAT` | optional | Classic PAT with `read:org`. Unlocks full contribution totals; the default `GITHUB_TOKEN` gives public-only counts. |
| `GROQ_MODEL` (variable) | optional | Model override. Defaults to `llama-3.3-70b-versatile`. |

Narratives are cached in `data/portfolio.json` and keyed by a content hash of each repo, so a sync
only spends Groq tokens on repositories that are new or have been pushed to since last time.

## Local development

```bash
npm install
npm test                 # self-check for the sync logic
GH_PAT=$(gh auth token) GROQ_API_KEY=... npm run sync
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
