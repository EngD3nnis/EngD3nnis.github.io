const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// --- Config ---
const POSTS_DIR = path.join(__dirname, 'posts');
const DIST_DIR = path.join(__dirname, 'dist');
const BLOG_DIR = path.join(DIST_DIR, 'blog');
const SITE_URL = 'https://engd3nnis.github.io';
const SITE_TITLE = 'DNX';

// --- Marked config ---
marked.setOptions({
  gfm: true,
  breaks: false,
});

// --- Helpers ---
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, destDir, filename) {
  fs.copyFileSync(src, path.join(destDir, filename || path.basename(src)));
}

function slugFromFilename(filename) {
  // 2024-03-27-welcome.md → welcome
  return filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatRFC822(dateStr) {
  return new Date(dateStr).toUTCString();
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// --- HTML Templates ---
function htmlShell(title, bodyContent, { description = '', cssPath = '../style.css' } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#e6e3db">
<meta name="description" content="${escapeXml(description || title)}">
<meta name="color-scheme" content="light dark">
<title>${escapeXml(title)} — ${SITE_TITLE}</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23141311'/%3E%3Ccircle cx='16' cy='16' r='5' fill='%23ba1f24'/%3E%3C/svg%3E">
<link rel="alternate" type="application/rss+xml" title="DNX Blog" href="/blog/feed.xml">
<link rel="stylesheet" href="${cssPath}">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous">
</head>
<body>
${bodyContent}
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" crossorigin="anonymous"
  onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]})"></script>
</body>
</html>`;
}

function blogIndexPage(posts) {
  const listItems = posts.map(p => {
    return `    <li>
      <time>${formatDate(p.date)}</time>
      <div><a href="/blog/${p.slug}/">${escapeXml(p.title)}</a>${p.excerpt ? `<span class="excerpt">${escapeXml(p.excerpt)}</span>` : ''}</div>
    </li>`;
  }).join('\n');

  const body = `<div class="page">
  <a class="back" href="/">← DNX</a>
  <h1>Blog</h1>
  <p class="lede">Notes on AI engineering, mathematics, machine learning, and building things.</p>
  <ul class="posts">
${listItems}
  </ul>
  <a class="rss" href="/blog/feed.xml">RSS feed ↗</a>
</div>`;

  return htmlShell('Blog', body, { description: 'DNX blog — AI engineering, mathematics, and machine learning notes.', cssPath: '../style.css' });
}

function postPage(post, prevPost, nextPost) {
  let nav = '';
  if (prevPost || nextPost) {
    const prevLink = prevPost ? `<a class="prev" href="/blog/${prevPost.slug}/">← ${escapeXml(prevPost.title)}</a>` : '<span></span>';
    const nextLink = nextPost ? `<a class="next" href="/blog/${nextPost.slug}/">${escapeXml(nextPost.title)} →</a>` : '<span></span>';
    nav = `\n  <nav class="post-nav">${prevLink}${nextLink}</nav>`;
  }

  const body = `<div class="page">
  <a class="back" href="/blog/">← Blog</a>
  <h1>${escapeXml(post.title)}</h1>
  <time>${formatDate(post.date)}</time>
  <div class="article">
${post.html}
  </div>${nav}
</div>`;

  return htmlShell(post.title, body, { description: post.excerpt || '', cssPath: '../../style.css' });
}

function generateRSS(posts) {
  const items = posts.slice(0, 20).map(p => {
    return `  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${SITE_URL}/blog/${p.slug}/</link>
    <guid>${SITE_URL}/blog/${p.slug}/</guid>
    <pubDate>${formatRFC822(p.date)}</pubDate>
    <description>${escapeXml(p.excerpt || '')}</description>
  </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(SITE_TITLE)} Blog</title>
  <link>${SITE_URL}/blog/</link>
  <description>AI Engineering, Machine Learning, and Intelligent Systems.</description>
${items}
</channel>
</rss>`;
}

// --- Main Build ---
function build() {
  console.log('Building DNX site...');

  // Clean dist — handle locked directory gracefully
  try {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  } catch (e) {
    // Directory may be locked (e.g. open in file explorer); empty contents instead
    if (fs.existsSync(DIST_DIR)) {
      for (const entry of fs.readdirSync(DIST_DIR)) {
        const p = path.join(DIST_DIR, entry);
        try { fs.rmSync(p, { recursive: true, force: true }); } catch (_) {}
      }
    }
  }
  ensureDir(DIST_DIR);
  ensureDir(BLOG_DIR);

  // Copy static files
  copyFile(path.join(__dirname, 'index.html'), DIST_DIR);
  copyFile(path.join(__dirname, 'style.css'), DIST_DIR);

  // Read and parse posts
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('No posts/ directory found. Creating blog index with no posts.');
    fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), blogIndexPage([]));
    console.log('Done.');
    return;
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).sort();
  const posts = files.map(file => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const slug = data.slug || slugFromFilename(file);
    const html = marked.parse(content);
    return {
      title: data.title || slug,
      date: data.date || '2024-01-01',
      excerpt: data.excerpt || '',
      slug,
      html,
      file,
    };
  });

  // Sort newest first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Generate individual post pages
  posts.forEach((post, i) => {
    // Navigation: in the sorted (newest-first) array,
    // "newer" = i-1, "older" = i+1
    const newerPost = i > 0 ? posts[i - 1] : null;
    const olderPost = i < posts.length - 1 ? posts[i + 1] : null;

    const postDir = path.join(BLOG_DIR, post.slug);
    ensureDir(postDir);
    fs.writeFileSync(
      path.join(postDir, 'index.html'),
      postPage(post, olderPost, newerPost)
    );
    console.log(`  ✓ /blog/${post.slug}/`);
  });

  // Generate blog index
  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), blogIndexPage(posts));
  console.log('  ✓ /blog/');

  // Generate RSS feed
  fs.writeFileSync(path.join(BLOG_DIR, 'feed.xml'), generateRSS(posts));
  console.log('  ✓ /blog/feed.xml');

  console.log(`\nDone. ${posts.length} posts built to dist/`);
}

build();
