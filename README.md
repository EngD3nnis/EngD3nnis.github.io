# DNX

Personal website and blog. Built with static HTML, CSS, and a tiny Node.js build script.

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

## Writing a new post

1. Create a Markdown file in `posts/` with the naming convention `YYYY-MM-DD-slug.md`
2. Add YAML frontmatter:

```markdown
---
title: "Your Post Title"
date: 2025-01-15
excerpt: "A short description for the blog index."
slug: your-post-slug
---

Your content here. Supports **bold**, *italic*, `code`, code blocks, lists, links, and headings.
```

3. Run `npm run build` to generate the HTML
4. Push to `main` — GitHub Actions will build and deploy automatically

## Deployment

The site deploys to GitHub Pages via GitHub Actions.

### One-time setup

1. Go to your repository **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Push to `main` — the workflow will run automatically

The site will be available at `https://EngD3nnis.github.io/`

## Structure

```
├── index.html          Homepage
├── style.css           All styles
├── build.js            Build script (Markdown → HTML)
├── posts/              Markdown blog posts
├── dist/               Build output (gitignored)
├── .github/workflows/  CI/CD
└── package.json        Dependencies (marked, gray-matter)
```
