#!/usr/bin/env node
/**
 * Programmatic SEO Page Generator
 * Generates thousands of landing pages for long-tail keywords
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname, 'dimensions.json'), 'utf-8'));

const outputDir = join(__dirname, '../public/p');
const sitemapProgPath = join(__dirname, '../public/sitemap-programmatic.xml');
const sitemapMainPath = join(__dirname, '../public/sitemap-main.xml');
const sitemapIndexPath = join(__dirname, '../public/sitemap.xml');
const TOOL_URL = config.tool_url;

// Clean and recreate output directory
if (existsSync(outputDir)) rmSync(outputDir, { recursive: true });
mkdirSync(outputDir, { recursive: true });

// Generate all page combinations
function generatePages() {
  const pages = [];
  const seen = new Set();
  const d = config.dimensions;
  
  // Helper to add page if not duplicate
  const add = (slug, data) => {
    if (!seen.has(slug)) {
      seen.add(slug);
      pages.push({ slug, ...data });
    }
  };

  // Comb 1: situation × recipient × tone (2,400)
  for (const sit of d.situation.values) {
    for (const rec of d.recipient.values) {
      for (const t of d.tone.values) {
        add(`${sit.id}-${rec.id}-${t.id}`, { situation: sit, recipient: rec, tone: t });
      }
    }
  }

  // Comb 2: situation × industry × tone (1,920)
  for (const sit of d.situation.values) {
    for (const ind of d.industry.values) {
      for (const t of d.tone.values) {
        add(`${sit.id}-${ind.id}-${t.id}`, { situation: sit, industry: ind, tone: t });
      }
    }
  }

  // Comb 3: situation × recipient × urgency (1,200)
  for (const sit of d.situation.values) {
    for (const rec of d.recipient.values) {
      for (const urg of d.urgency.values) {
        add(`${sit.id}-${rec.id}-${urg.id}`, { situation: sit, recipient: rec, urgency: urg });
      }
    }
  }

  // Comb 4: situation × tone × language (960)
  for (const sit of d.situation.values) {
    for (const t of d.tone.values) {
      for (const lang of d.language.values) {
        add(`${sit.id}-${t.id}-${lang.id}`, { situation: sit, tone: t, language: lang });
      }
    }
  }

  // Comb 5: situation × recipient × tone × urgency (9,600)
  for (const sit of d.situation.values) {
    for (const rec of d.recipient.values) {
      for (const t of d.tone.values) {
        for (const urg of d.urgency.values) {
          add(`${sit.id}-${rec.id}-${t.id}-${urg.id}`, { situation: sit, recipient: rec, tone: t, urgency: urg });
        }
      }
    }
  }

  return pages;
}

// Generate HTML for a page
function generateHTML(page) {
  const { slug, situation, recipient, tone, industry, urgency, language } = page;
  const url = `${TOOL_URL}/p/${slug}/`;
  
  // Build title parts
  const parts = [];
  if (urgency) parts.push(urgency.en);
  if (tone) parts.push(tone.en);
  parts.push(situation.en);
  parts.push('Excuse');
  
  const context = recipient?.en || industry?.en || (language ? `in ${language.en}` : '');
  if (context && !language) parts.push(`for ${context}`);
  if (language) parts.push(`in ${language.en}`);
  
  const h1 = parts.join(' ');
  const title = `${h1} | AI Excuse Generator`;
  
  const toneWord = tone?.en?.toLowerCase() || 'perfect';
  const sitWord = situation.en.toLowerCase();
  const ctxWord = context?.toLowerCase() || 'anyone';
  const description = `Generate ${toneWord} excuses for ${sitWord}. AI-powered excuse generator${recipient ? ` for your ${recipient.en.toLowerCase()}` : ''}. Free & instant!`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${TOOL_URL}/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"WebApplication","name":"${h1}","description":"${description}","url":"${url}","applicationCategory":"UtilityApplication","operatingSystem":"Web","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"author":{"@type":"Organization","name":"DenseMatrix","url":"https://densematrix.ai"}}
  </script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-P4ZLGKH1E1"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-P4ZLGKH1E1');</script>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Courier New',monospace;background:#faf8f5;color:#2d2d2d;line-height:1.7;padding:24px;max-width:720px;margin:0 auto}h1{font-size:1.75rem;margin-bottom:1rem}h2{font-size:1.25rem;margin:1.5rem 0 .75rem}p{margin-bottom:1rem}.cta{background:#e74c3c;color:#fff;padding:14px 28px;text-decoration:none;display:inline-block;margin:20px 0;border-radius:6px;font-weight:700}.cta:hover{background:#c0392b}.related{margin-top:2rem;padding-top:1rem;border-top:1px solid #ddd}.related a{display:inline-block;margin:4px 8px 4px 0;color:#e74c3c;text-decoration:none}.related a:hover{text-decoration:underline}footer{margin-top:2rem;font-size:.85rem;color:#666}</style>
</head>
<body>
  <h1>🎭 ${h1}</h1>
  <p>Need a <strong>${toneWord}</strong> excuse for <strong>${sitWord}</strong>? Our AI generates perfect excuses${recipient ? ` for your <strong>${recipient.en.toLowerCase()}</strong>` : ''}.</p>
  <h2>Why AI Excuse Generator?</h2>
  <p>Sometimes you need a good excuse fast. Our AI understands nuances and creates natural, believable excuses for any situation.</p>
  <h2>How It Works</h2>
  <p>1. Select situation → 2. Choose tone → 3. Get AI excuse → 4. Copy & send!</p>
  <a href="${TOOL_URL}?utm_source=seo&situation=${situation.id}${tone ? '&tone=' + tone.id : ''}" class="cta">Generate Excuse Now →</a>
  <div class="related"><h2>Related</h2>${generateRelated(page)}</div>
  <footer>© 2024 <a href="https://densematrix.ai">DenseMatrix</a> | <a href="${TOOL_URL}">AI Excuse Generator</a></footer>
</body>
</html>`;
}

function generateRelated(page) {
  const d = config.dimensions;
  const links = [];
  const { situation, tone } = page;
  
  // Other tones for same situation
  if (tone) {
    const others = d.tone.values.filter(t => t.id !== tone.id).slice(0, 3);
    for (const t of others) {
      links.push(`<a href="${TOOL_URL}/p/${situation.id}-boss-${t.id}/">${t.en} ${situation.en}</a>`);
    }
  }
  // Other situations
  const otherSits = d.situation.values.filter(s => s.id !== situation.id).slice(0, 3);
  for (const s of otherSits) {
    links.push(`<a href="${TOOL_URL}/p/${s.id}-boss-believable/">${s.en} Excuse</a>`);
  }
  return links.join(' ');
}

function generateSitemaps(pages) {
  const today = new Date().toISOString().split('T')[0];
  
  let progXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const p of pages) {
    progXml += `<url><loc>${TOOL_URL}/p/${p.slug}/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
  }
  progXml += '</urlset>';
  writeFileSync(sitemapProgPath, progXml);
  
  writeFileSync(sitemapMainPath, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${TOOL_URL}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>\n</urlset>`);
  
  writeFileSync(sitemapIndexPath, `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<sitemap><loc>${TOOL_URL}/sitemap-main.xml</loc></sitemap>\n<sitemap><loc>${TOOL_URL}/sitemap-programmatic.xml</loc></sitemap>\n</sitemapindex>`);
}

// Main
console.log('🚀 Generating programmatic SEO pages...');
const pages = generatePages();
console.log(`📊 Total pages: ${pages.length}`);

let count = 0;
for (const page of pages) {
  const pageDir = join(outputDir, page.slug);
  mkdirSync(pageDir, { recursive: true });
  writeFileSync(join(pageDir, 'index.html'), generateHTML(page));
  if (++count % 2000 === 0) console.log(`  ${count}/${pages.length}...`);
}

generateSitemaps(pages);
console.log(`✅ Done! ${count} pages generated`);
