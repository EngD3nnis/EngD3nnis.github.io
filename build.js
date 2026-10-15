const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// --- Config ---
const POSTS_DIR = path.join(__dirname, 'posts');
const DIST_DIR = path.join(__dirname, 'dist');
const BLOG_DIR = path.join(DIST_DIR, 'blog');
const SUBJECTS_DIR = path.join(BLOG_DIR, 'subjects');
const JOURNAL_PATH = path.join(__dirname, 'partials', 'journal.html');
const SITE_URL = 'https://engd3nnis.github.io';
const SITE_TITLE = 'DNX';
const SITE_AUTHOR = 'Dennis Muhanji';

// --- Taxonomy ---
// Order here drives the subject index order.
const SUBJECTS = [
  { id: 'mathematics', name: 'Mathematics', blurb: 'Definitions, identities, derivations and worked examples — the mathematics underneath the algorithms.' },
  { id: 'probability', name: 'Probability & Statistics', blurb: 'Probability, distributions, estimation, inference, and the interpretation of statistical evidence.' },
  { id: 'algorithms', name: 'Data Structures & Algorithms', blurb: 'Complexity, correctness, invariants, and the reasoning behind computational choices.' },
  { id: 'data-science', name: 'Data Science & Machine Learning', blurb: 'From mathematical idea to working model, with honest evaluation.' },
  { id: 'quant', name: 'Quantitative Research', blurb: 'Validation, backtesting, calibration, and decision-making under uncertainty.' },
  { id: 'engineering', name: 'Software Engineering', blurb: 'Backend systems, data pipelines, testing, and the engineering that makes ideas reliable.' },
  { id: 'markets', name: 'Markets & Risk', blurb: 'Market and on-chain data studied analytically: costs, bias, tail risk, and the difference between a pattern and an edge.' },
  { id: 'reading', name: 'Books, History & Ideas', blurb: 'Reading notes and reflections on literature, history, strategy and philosophy.' },
  { id: 'general', name: 'General', blurb: 'Archive notes that do not belong to a single discipline.' },
];
const SUBJECT_BY_ID = new Map(SUBJECTS.map(s => [s.id, s]));

const TYPES = {
  note: 'Study note',
  'worked-problem': 'Worked problem',
  derivation: 'Derivation',
  essay: 'Essay',
  experiment: 'Experiment',
  notebook: 'Research notebook',
  reading: 'Reading note',
  'case-study': 'Case study',
};

// --- Marked config ---
marked.setOptions({ gfm: true, breaks: false });

// --- Helpers ---
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, destDir, filename) {
  fs.copyFileSync(src, path.join(destDir, filename || path.basename(src)));
}

function slugFromFilename(filename) {
  return filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function toISODate(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return String(d).slice(0, 10);
  return dt.toISOString().slice(0, 10);
}

function formatRFC822(dateStr) {
  return new Date(dateStr).toUTCString();
}

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function toArray(v) {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (v === undefined || v === null || v === '') return [];
  return [String(v)];
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Protect KaTeX math from the Markdown parser, which strips the backslash
// before ASCII punctuation (turning LaTeX `\,`, `\%`, `\_`, `\{` into `,`,
// `%`, `_`, `{`). Math spans are stashed as opaque tokens, Markdown runs on
// the rest, then the original math is restored (HTML-escaped so KaTeX reads
// it from textContent).
function renderMarkdown(md) {
  const store = [];
  const stash = (s) => `@@DNXMATH${store.push(s) - 1}@@`;

  const parts = String(md).split(/(```[\s\S]*?```|`[^`\n]*`)/g);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) continue; // inside a code span/block — leave untouched
    parts[i] = parts[i]
      .replace(/\$\$([\s\S]+?)\$\$/g, (m) => stash(m))
      .replace(/\$([^$\n]+?)\$/g, (m) => stash(m));
  }

  let html = marked.parse(parts.join(''));
  html = html.replace(/@@DNXMATH(\d+)@@/g, (_, n) => escapeHtml(store[Number(n)]));
  return html;
}

function subjectOf(data) {
  return SUBJECT_BY_ID.has(data.subject) ? data.subject : 'general';
}

function typeOf(data) {
  return Object.prototype.hasOwnProperty.call(TYPES, data.type) ? data.type : 'note';
}

function subjectName(id) {
  return (SUBJECT_BY_ID.get(id) || SUBJECT_BY_ID.get('general')).name;
}

function entryCount(n) {
  return `${n} ${n === 1 ? 'entry' : 'entries'}`;
}

// --- Post parsing ---
function parsePosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).sort();
  const posts = [];
  const drafts = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const slug = data.slug || slugFromFilename(file);

    if (data.draft === true) {
      drafts.push(file);
      continue;
    }

    posts.push({
      title: data.title || slug,
      date: toISODate(data.date || '2024-01-01'),
      excerpt: data.excerpt || '',
      slug,
      subject: subjectOf(data),
      type: typeOf(data),
      tags: toArray(data.tags),
      related: toArray(data.related).filter(s => s !== slug),
      html: renderMarkdown(content),
      file,
    });
  }

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  for (const f of drafts) console.log(`  - draft skipped: ${f}`);
  return posts;
}

function postUrl(post) {
  return `/blog/${post.slug}/`;
}

// --- HTML shell ---
function htmlShell(title, bodyContent, { description = '', cssPath = '../style.css', urlPath = '/blog/' } = {}) {
  const canonical = SITE_URL + urlPath;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#e6e3db">
<meta name="description" content="${escapeXml(description || title)}">
<meta name="author" content="${escapeXml(SITE_AUTHOR)}">
<meta name="color-scheme" content="light dark">
<meta property="og:site_name" content="${escapeXml(SITE_TITLE)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeXml(title)}">
<meta property="og:description" content="${escapeXml(description || title)}">
<meta property="og:url" content="${escapeXml(canonical)}">
<meta name="twitter:card" content="summary">
<title>${escapeXml(title)} — ${SITE_TITLE}</title>
<link rel="canonical" href="${escapeXml(canonical)}">
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

// --- Shared fragments ---
function entryItem(post, { showSubject = true } = {}) {
  const metaBits = [];
  if (showSubject) metaBits.push(subjectName(post.subject));
  metaBits.push(TYPES[post.type]);
  const excerpt = post.excerpt ? `<span class="excerpt">${escapeXml(post.excerpt)}</span>` : '';
  return `    <li>
      <time>${formatDate(post.date)}</time>
      <div>
        <a href="${postUrl(post)}">${escapeXml(post.title)}</a>
        <span class="pmeta">${escapeXml(metaBits.join(' · '))}</span>
        ${excerpt}
      </div>
    </li>`;
}

function entriesList(posts, opts = {}) {
  return `<ul class="posts">\n${posts.map(p => entryItem(p, opts)).join('\n')}\n  </ul>`;
}

function subjectLinks() {
  const counts = new Map(SUBJECTS.map(s => [s.id, 0]));
  for (const p of state.posts) counts.set(p.subject, (counts.get(p.subject) || 0) + 1);
  return `<ul class="subjects">\n${SUBJECTS.map(s => {
    const n = counts.get(s.id) || 0;
    return `    <li>
      <a href="/blog/subjects/${s.id}/">
        <span class="sname">${escapeXml(s.name)}</span>
        <span class="scount">${entryCount(n)}</span>
        <span class="sblurb">${escapeXml(s.blurb)}</span>
      </a>
    </li>`;
  }).join('\n')}\n  </ul>`;
}

// --- Pages ---
function blogIndexPage() {
  if (!fs.existsSync(JOURNAL_PATH)) {
    throw new Error(`Missing journal partial: ${JOURNAL_PATH}`);
  }
  const journal = fs.readFileSync(JOURNAL_PATH, 'utf8').trimEnd();
  const posts = state.posts;

  const body = `<div class="page">
  <a class="back" href="/">← DNX</a>
  <h1>Engineer Dennis</h1>
  <p class="lede">Dennis Muhanji (DNX) — Data Science undergraduate at the University of Nairobi. This is my engineering journal: what I'm building, what I'm learning, and how I think about the work.</p>

${journal}

  <h2 class="label">Archive</h2>
  <p class="lede archive-note">Study notes, derivations, essays, worked problems and research notebooks — organised by subject, searchable by concept.</p>
  <div class="search">
    <input type="search" id="archive-search" placeholder="Search the archive — titles, tags, summaries…" aria-label="Search the archive" autocomplete="off">
    <ul class="results" id="archive-results" aria-live="polite" hidden></ul>
  </div>

  <h2 class="label">Subjects</h2>
${subjectLinks()}

  <h2 class="label">All entries</h2>
${entriesList(posts)}

  <p class="feed-links"><a class="rss" href="/blog/feed.xml">RSS feed ↗</a> · <a class="rss" href="/sitemap.xml">Sitemap ↗</a></p>
</div>
<script>
(function(){
  var input = document.getElementById('archive-search');
  var list = document.getElementById('archive-results');
  if (!input || !list) return;

  function esc(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  var index = [];
  fetch('search-index.json').then(function(r){ return r.json(); }).then(function(data){ index = data; }).catch(function(){});

  function render(matches, query){
    list.innerHTML = '';
    if (!query){ list.hidden = true; return; }
    list.hidden = false;
    if (!matches.length){
      var li = document.createElement('li');
      li.className = 'rempty';
      li.textContent = 'No entries match "' + query + '".';
      list.appendChild(li);
      return;
    }
    matches.slice(0, 20).forEach(function(p){
      var li = document.createElement('li');
      li.innerHTML = '<a href="' + esc(p.url) + '">' + esc(p.title) + '</a>' +
        '<span class="rmeta">' + esc(p.subject + ' · ' + p.type + ' · ' + p.date) + '</span>';
      list.appendChild(li);
    });
  }

  input.addEventListener('input', function(){
    var q = input.value.trim().toLowerCase();
    if (!q || !index.length){ render([], q); return; }
    var matches = index.filter(function(p){
      return (p.title + ' ' + p.summary + ' ' + p.tags + ' ' + p.subject + ' ' + p.type).toLowerCase().indexOf(q) !== -1;
    });
    render(matches, q);
  });
})();
</script>`;

  return htmlShell('Archive', body, {
    description: "Dennis Muhanji (DNX) — engineering journal and intellectual archive. Mathematics, probability, algorithms, machine learning, quantitative research, and software built from first principles.",
    cssPath: '../style.css',
    urlPath: '/blog/',
  });
}

function subjectPage(subject) {
  const posts = state.posts.filter(p => p.subject === subject.id);
  const list = posts.length
    ? entriesList(posts, { showSubject: false })
    : `  <p class="empty">No entries published yet. Notes for this section appear here as they are written.</p>`;

  const body = `<div class="page">
  <a class="back" href="/blog/">← Archive</a>
  <h1>${escapeXml(subject.name)}</h1>
  <p class="lede">${escapeXml(subject.blurb)}</p>
  <h2 class="label">${entryCount(posts.length)}</h2>
${list}
  <p class="feed-links"><a class="rss" href="/blog/feed.xml">RSS feed ↗</a></p>
</div>`;

  return htmlShell(subject.name, body, {
    description: `${subject.name} — ${subject.blurb} Archive entries by Dennis Muhanji (DNX).`,
    cssPath: '../../../style.css',
    urlPath: `/blog/subjects/${subject.id}/`,
  });
}

function postPage(post, related) {
  const metaBits = [`<time>${formatDate(post.date)}</time>`, `<a href="/blog/subjects/${post.subject}/">${escapeXml(subjectName(post.subject))}</a>`, escapeXml(TYPES[post.type])];
  const tags = post.tags.length
    ? `\n  <ul class="tags">${post.tags.map(t => `<li>${escapeXml(t)}</li>`).join('')}</ul>`
    : '';

  const relatedBlock = related.length
    ? `\n  <h2 class="label">Related</h2>\n${entriesList(related)}`
    : '';

  const body = `<div class="page">
  <a class="back" href="/blog/">← Archive</a>
  <h1>${escapeXml(post.title)}</h1>
  <p class="meta-line">${metaBits.join(' · ')}</p>${tags}
  <div class="article">
${post.html}
  </div>${relatedBlock}
</div>`;

  return htmlShell(post.title, body, {
    description: post.excerpt || '',
    cssPath: '../../style.css',
    urlPath: postUrl(post),
  });
}

function searchIndex(posts) {
  return JSON.stringify(posts.map(p => ({
    title: p.title,
    summary: p.excerpt,
    subject: subjectName(p.subject),
    type: TYPES[p.type],
    tags: p.tags.join(', '),
    date: formatDate(p.date),
    url: postUrl(p),
  })));
}

function generateRSS(posts) {
  const items = posts.slice(0, 20).map(p => {
    return `  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${SITE_URL}${postUrl(p)}</link>
    <guid>${SITE_URL}${postUrl(p)}</guid>
    <category>${escapeXml(subjectName(p.subject))}</category>
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

function generateSitemap(posts) {
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: null },
    { loc: `${SITE_URL}/blog/`, lastmod: posts[0] ? posts[0].date : null },
    ...posts.map(p => ({ loc: `${SITE_URL}${postUrl(p)}`, lastmod: p.date })),
    ...SUBJECTS.map(s => ({ loc: `${SITE_URL}/blog/subjects/${s.id}/`, lastmod: null })),
  ];

  const body = urls.map(u => {
    const lastmod = u.lastmod ? `\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>` : '';
    return `  <url>\n    <loc>${escapeXml(u.loc)}</loc>${lastmod}\n  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

// --- Main build ---
const state = { posts: [] };

function build() {
  console.log('Building DNX site...');

  try {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  } catch (e) {
    if (fs.existsSync(DIST_DIR)) {
      for (const entry of fs.readdirSync(DIST_DIR)) {
        const p = path.join(DIST_DIR, entry);
        try { fs.rmSync(p, { recursive: true, force: true }); } catch (_) {}
      }
    }
  }
  ensureDir(DIST_DIR);
  ensureDir(BLOG_DIR);
  ensureDir(SUBJECTS_DIR);

  // Static files
  copyFile(path.join(__dirname, 'index.html'), DIST_DIR);
  copyFile(path.join(__dirname, 'style.css'), DIST_DIR);

  // Parse content
  state.posts = parsePosts();
  const bySlug = new Map(state.posts.map(p => [p.slug, p]));

  // Individual post pages
  for (const post of state.posts) {
    const postDir = path.join(BLOG_DIR, post.slug);
    ensureDir(postDir);
    const related = post.related.map(s => bySlug.get(s)).filter(Boolean);
    fs.writeFileSync(path.join(postDir, 'index.html'), postPage(post, related));
    console.log(`  ✓ ${postUrl(post)}`);
  }

  // Archive index
  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), blogIndexPage());
  console.log('  ✓ /blog/');

  // Subject pages
  for (const subject of SUBJECTS) {
    const dir = path.join(SUBJECTS_DIR, subject.id);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'index.html'), subjectPage(subject));
  }
  console.log(`  ✓ /blog/subjects/ (${SUBJECTS.length} subjects)`);

  // Search index
  fs.writeFileSync(path.join(BLOG_DIR, 'search-index.json'), searchIndex(state.posts));
  console.log('  ✓ /blog/search-index.json');

  // RSS
  fs.writeFileSync(path.join(BLOG_DIR, 'feed.xml'), generateRSS(state.posts));
  console.log('  ✓ /blog/feed.xml');

  // Sitemap + robots
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), generateSitemap(state.posts));
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  console.log('  ✓ /sitemap.xml, /robots.txt');

  console.log(`\nDone. ${state.posts.length} entries built to dist/`);
}

build();
