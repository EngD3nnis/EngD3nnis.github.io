# DNX

Personal engineering journal and intellectual archive. Built with static HTML, CSS, and a tiny Node.js build script — no framework, no database, no runtime JavaScript dependencies beyond KaTeX (loaded from a CDN for mathematics) and a small inline search script.

## Local development

```bash
# Install dependencies
npm install

# Build the site
npm run build

# Preview (requires npx/serve or any static server)
npm run dev
# or: npx -y serve dist
```

The built site is output to `dist/`. Open `dist/index.html` directly or serve `dist/` with any static file server.

## Writing a new entry

The archive lives in `posts/`, one Markdown file per entry, named `YYYY-MM-DD-slug.md`. Templates for every entry type are in `templates/` — copy one, rename it, fill it in, and set `draft: false` when it is ready.

1. Create the file in `posts/`:

```markdown
---
title: "Your Entry Title"
date: 2026-10-15
excerpt: "One or two sentences for lists, search, and the RSS feed."
slug: your-entry-slug
subject: mathematics        # see subjects below
type: note                  # see types below
tags: [linear-algebra, proof]
related: []                 # list of other entry slugs
draft: true                 # flip to false to publish
---

Your content here. Supports **bold**, *italic*, `code`, code blocks, lists,
links, headings, and KaTeX math (`$inline$` and `$$display$$`).
```

2. Run `npm run build` to generate the HTML.
3. Push to `main` — GitHub Actions builds and deploys automatically.

Entries with `draft: true` are skipped at build time (the build log prints each skipped draft).

### Subjects

Each entry belongs to exactly one subject (defaults to `general` if omitted or unrecognised). Subject pages are generated at `/blog/subjects/<subject>/`:

`mathematics` · `probability` · `algorithms` · `data-science` · `quant` · `engineering` · `markets` · `reading` · `general`

The subject list, display names, and blurbs are defined once at the top of `build.js`.

### Entry types

The `type` field maps to a display label (defaults to `note`): `note` (Study note) · `worked-problem` · `derivation` · `essay` · `experiment` · `notebook` (Research notebook) · `reading` · `case-study`.

Templates: `templates/note.md`, `worked-problem.md`, `derivation.md`, `essay.md`, `experiment.md`, `notebook.md`, `reading.md`, `case-study.md`.

### Editorial standards

- Distinguish established results from intuition, exploration, and your own reasoning.
- For statistics: state assumptions, sampling, and limitations; separate in-sample from out-of-sample.
- For experiments: record method and provenance; never report numbers that were not actually produced.
- Label speculative work honestly (`Research notebook`, `In progress`, `Experiment`) rather than inflating it.
- Record corrections openly when an earlier derivation was wrong (use a `## Corrections` section).

## What the build generates

From `posts/`, the build script produces `dist/`:

- `/blog/` — the archive index: profile, subject index, search, and all entries.
- `/blog/<slug>/` — one page per entry, with subject, type, tags, and related entries.
- `/blog/subjects/<subject>/` — a page per subject.
- `/blog/search-index.json` — a small static index (title, summary, subject, type, tags, URL) powering the client-side search.
- `/blog/feed.xml` — RSS feed (entries tagged with their subject).
- `/sitemap.xml`, `/robots.txt`.
- Open Graph and canonical metadata on every generated page.

No API, database, or server is required. Search is client-side over the static index and degrades gracefully if the fetch fails.

## Deployment

The site deploys to GitHub Pages via GitHub Actions.

1. Go to the repository **Settings → Pages**.
2. Under **Source**, select **GitHub Actions**.
3. Push to `main` — the workflow will run automatically.

The site is served from the user-site repository `EngD3nnis/EngD3nnis.github.io` at `https://engd3nnis.github.io/`.

## Structure

```
├── index.html          Homepage (hand-written, minimalist)
├── style.css           All styles (design tokens at the top)
├── build.js            Build script (Markdown → static HTML archive)
├── posts/              Markdown archive entries
├── partials/           journal.html — the profile shown on /blog/
├── templates/          Entry skeletons, one per content type
├── dist/               Build output (gitignored)
├── .github/workflows/  CI/CD (build → deploy to Pages)
└── package.json        Build-time dependencies only (marked, gray-matter)
```
