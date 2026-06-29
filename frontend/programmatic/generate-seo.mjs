#!/usr/bin/env node
/**
 * Programmatic SEO Page Generator for VoiceMargin.
 * Generates search landing pages for article annotation, voice notes, and Notion sync use cases.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname, 'dimensions.json'), 'utf-8'));
const outputDir = join(__dirname, '../public/p');
const TOOL_URL = config.tool_url;

if (existsSync(outputDir)) rmSync(outputDir, { recursive: true });
mkdirSync(outputDir, { recursive: true });

const contentGuides = {
  'research-paper': 'dense PDFs and academic articles where the insight often appears in a single paragraph you do not want to lose',
  newsletter: 'fast-moving analysis where you need to capture reactions before the next issue arrives',
  'blog-post': 'web essays and practical posts that deserve more than a bookmark',
  'longform-essay': 'long reading sessions where written notes interrupt flow and voice annotations preserve momentum',
  'technical-doc': 'implementation details, API constraints, and architecture decisions that need precise context',
  'market-report': 'charts, claims, and market signals that should become structured notes instead of screenshots',
  'legal-brief': 'arguments, caveats, and evidence trails where context matters as much as the highlighted text',
  'product-spec': 'requirements, tradeoffs, and edge cases that product teams need to revisit later',
  'course-reading': 'assigned readings where students need recall, synthesis, and discussion-ready notes',
  'book-chapter': 'chapter-level ideas that are too nuanced for a simple highlight'
};

const workflowGuides = {
  'voice-notes': 'record the thought immediately, keep reading, and transcribe it into searchable text afterward',
  'margin-notes': 'attach commentary beside the exact passage that triggered it',
  'active-reading': 'turn reading from passive consumption into a capture workflow',
  'article-annotation': 'combine highlights, comments, and source URLs into one reusable record',
  'notion-sync': 'send the selected text and transcribed note into Notion without rebuilding the context manually',
  'reading-workflow': 'standardize how web articles become durable knowledge',
  'audio-comments': 'speak nuance faster than you can type it',
  'knowledge-capture': 'move insights from browser tabs into a system you can search later'
};

const audienceGuides = {
  students: 'need notes that survive exams, seminars, and writing assignments',
  researchers: 'need traceable evidence and comments tied to the original source',
  founders: 'need to turn articles into strategy notes without slowing down market scanning',
  'product-managers': 'need to connect customer signals, competitor notes, and product decisions',
  lawyers: 'need careful annotations that preserve source context and reasoning',
  consultants: 'need reusable client insights from many sources',
  writers: 'need to capture reactions before they become generic summaries',
  analysts: 'need source-backed observations that can be reused in memos',
  engineers: 'need implementation notes tied to docs, specs, and examples',
  'knowledge-workers': 'need fewer forgotten bookmarks and more usable notes'
};

function generatePages() {
  const pages = [];
  const seen = new Set();
  const d = config.dimensions;
  const add = (slug, data) => {
    if (!seen.has(slug)) {
      seen.add(slug);
      pages.push({ slug, ...data });
    }
  };

  for (const content of d.content_type.values) {
    for (const workflow of d.workflow.values) {
      for (const audience of d.audience.values) {
        add(`${content.id}-${workflow.id}-${audience.id}`, { content, workflow, audience });
      }
    }
  }

  for (const content of d.content_type.values) {
    for (const workflow of d.workflow.values) {
      for (const destination of d.destination.values) {
        add(`${content.id}-${workflow.id}-${destination.id}`, { content, workflow, destination });
      }
    }
  }

  for (const audience of d.audience.values) {
    for (const workflow of d.workflow.values) {
      for (const destination of d.destination.values) {
        add(`${audience.id}-${workflow.id}-${destination.id}`, { audience, workflow, destination });
      }
    }
  }

  for (const content of d.content_type.values) {
    for (const audience of d.audience.values) {
      for (const destination of d.destination.values) {
        add(`${content.id}-${audience.id}-${destination.id}`, { content, audience, destination });
      }
    }
  }

  return pages;
}

function getRelatedPages(page) {
  const d = config.dimensions;
  const content = page.content || d.content_type.values[0];
  const workflow = page.workflow || d.workflow.values[0];
  const audience = page.audience || d.audience.values[0];
  const destination = page.destination || d.destination.values[0];
  const links = [];
  for (const nextWorkflow of d.workflow.values.filter((item) => item.id !== workflow.id).slice(0, 2)) {
    links.push({ slug: `${content.id}-${nextWorkflow.id}-${audience.id}`, label: `${nextWorkflow.en} for ${content.en}` });
  }
  for (const nextContent of d.content_type.values.filter((item) => item.id !== content.id).slice(0, 2)) {
    links.push({ slug: `${nextContent.id}-${workflow.id}-${audience.id}`, label: `${workflow.en} for ${nextContent.en}` });
  }
  for (const nextDestination of d.destination.values.filter((item) => item.id !== destination.id).slice(0, 2)) {
    links.push({ slug: `${content.id}-${workflow.id}-${nextDestination.id}`, label: `${workflow.en} to ${nextDestination.en}` });
  }
  return links;
}

function generateHTML(page) {
  const { slug, content, workflow, audience, destination } = page;
  const url = `${TOOL_URL}/p/${slug}/`;
  const contentText = content?.en || 'Articles';
  const workflowText = workflow?.en || 'Voice Notes';
  const audienceText = audience?.en || 'Knowledge Workers';
  const destinationText = destination?.en || 'Notion';
  const h1 = `${workflowText} for ${contentText}${audience ? ` for ${audienceText}` : ''}`;
  const title = `${h1} | VoiceMargin`;
  const desc = `Capture ${workflowText.toLowerCase()} while reading ${contentText.toLowerCase()}${audience ? ` as ${audienceText.toLowerCase()}` : ''}. Highlight text, speak your thoughts, and sync notes to ${destinationText}.`;
  const contentGuide = contentGuides[content?.id] || 'reading material where context matters';
  const workflowGuide = workflowGuides[workflow?.id] || 'capture notes without breaking reading flow';
  const audienceGuide = audienceGuides[audience?.id] || 'need source-backed notes they can reuse later';
  const relatedHtml = getRelatedPages(page).map((item) =>
    `<a href="${TOOL_URL}/p/${item.slug}/">${item.label}</a>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${TOOL_URL}/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"${h1}","description":"${desc}","url":"${url}","applicationCategory":"ProductivityApplication","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"publisher":{"@type":"Organization","name":"DenseMatrix","url":"https://densematrix.ai"}}</script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-P4ZLGKH1E1"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-P4ZLGKH1E1',{'custom_map':{'dimension1':'tool_name'}});gtag('event','page_view',{'tool_name':'voicemargin'});</script>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f8fafc;color:#111827;line-height:1.7;padding:28px;max-width:860px;margin:0 auto}h1{font-size:2rem;line-height:1.2;margin-bottom:1rem}h2{font-size:1.2rem;margin:1.5rem 0 .65rem}.panel{background:white;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:18px 0}.flow{display:grid;gap:10px}.step{background:#eef2ff;border-left:4px solid #4f46e5;padding:12px}.cta{background:#111827;color:white;padding:14px 24px;text-decoration:none;display:inline-block;margin:20px 0;border-radius:6px;font-weight:700}.cta:hover{background:#374151}.related a{display:inline-block;margin:4px 8px 4px 0;color:#4f46e5;text-decoration:none}.related a:hover{text-decoration:underline}footer{margin-top:2rem;font-size:.85rem;color:#64748b}</style>
</head>
<body>
  <h1>${h1}</h1>
  <p>VoiceMargin helps you annotate ${contentText.toLowerCase()} without stopping to type. Highlight a passage, record what you are thinking, and turn spoken margin notes into searchable text that can be sent to ${destinationText}.</p>
  <section class="panel">
    <h2>Why this workflow works</h2>
    <p>${contentText} often means ${contentGuide}. ${workflowText} works because you can ${workflowGuide}. ${audienceText} ${audienceGuide}, so the note has to stay attached to the passage that caused it.</p>
  </section>
  <section class="panel flow">
    <h2>Reading workflow</h2>
    <div class="step"><strong>1. Paste an article URL.</strong> VoiceMargin extracts the readable content and keeps the source URL.</div>
    <div class="step"><strong>2. Highlight the exact passage.</strong> The selected text becomes the anchor for your note.</div>
    <div class="step"><strong>3. Speak the margin note.</strong> Capture nuance faster than typing, especially when you are in the middle of reading.</div>
    <div class="step"><strong>4. Sync the record.</strong> Store the highlight, transcript, and source context in ${destinationText} or your knowledge workflow.</div>
  </section>
  <section class="panel">
    <h2>Best for</h2>
    <p>This page is designed for ${audienceText.toLowerCase()} working with ${contentText.toLowerCase()}, especially when a normal bookmark is too shallow and a full written summary takes too long.</p>
  </section>
  <a href="${TOOL_URL}?utm_source=seo&content=${content?.id || ''}&workflow=${workflow?.id || ''}&audience=${audience?.id || ''}" class="cta">Start Annotating</a>
  <section class="related"><h2>Related annotation workflows</h2>${relatedHtml}</section>
  <footer>© 2026 <a href="https://densematrix.ai">DenseMatrix</a> | <a href="${TOOL_URL}">VoiceMargin</a></footer>
</body>
</html>`;
}

function generateSitemaps(pages) {
  const today = new Date().toISOString().split('T')[0];
  let progXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const p of pages) {
    progXml += `<url><loc>${TOOL_URL}/p/${p.slug}/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
  }
  progXml += '</urlset>';
  writeFileSync(join(__dirname, '../public/sitemap-programmatic.xml'), progXml);
  writeFileSync(join(__dirname, '../public/sitemap-main.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${TOOL_URL}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>\n</urlset>`);
  writeFileSync(join(__dirname, '../public/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<sitemap><loc>${TOOL_URL}/sitemap-main.xml</loc></sitemap>\n<sitemap><loc>${TOOL_URL}/sitemap-programmatic.xml</loc></sitemap>\n</sitemapindex>`);
}

console.log('Generating VoiceMargin programmatic SEO pages...');
const pages = generatePages();
console.log(`Total pages: ${pages.length}`);
let count = 0;
for (const page of pages) {
  const pageDir = join(outputDir, page.slug);
  mkdirSync(pageDir, { recursive: true });
  writeFileSync(join(pageDir, 'index.html'), generateHTML(page));
  if (++count % 2000 === 0) console.log(`  ${count}/${pages.length}...`);
}
generateSitemaps(pages);
console.log(`Done. ${count} pages generated`);
