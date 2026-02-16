// Website Scraper for CFLAR Knowledge Base
// Run with: npm run scrape

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'https://cflar.dream.press';
const MAX_PAGES = 100; // Increased to capture more pages

// URLs to visit (will be populated by crawler)
const toVisit = new Set(['/']);
const visited = new Set();
const knowledgeBase = [];

/**
 * Extract all internal links from a page
 */
function extractLinks($, baseUrl) {
  const links = new Set();
  
  $('a[href]').each((i, el) => {
    let href = $(el).attr('href');
    if (!href) return;
    
    // Handle relative URLs
    try {
      const url = new URL(href, baseUrl);
      
      // Only include links from the same domain
      if (url.hostname === new URL(baseUrl).hostname) {
        // Get just the path, ignore fragments and query params for deduplication
        let path = url.pathname;
        
        // Normalize path (remove trailing slash except for root)
        if (path !== '/' && path.endsWith('/')) {
          path = path.slice(0, -1);
        }
        
        // Skip common non-content pages and individual blog posts
        // Allow /blog page, but exclude /blog/post-title
        if (!path.match(/\.(pdf|jpg|jpeg|png|gif|zip|xml|json|css|js)$/i) &&
            !path.match(/\/wp-admin|\/wp-content|\/wp-includes|\/feed/i) &&
            !path.match(/\/blog\/.+|\/\d{4}\/\d{2}\//i)) {
          links.add(path);
        }
      }
    } catch (e) {
      // Invalid URL, skip it
    }
  });
  
  return links;
}

async function scrapePage(url) {
  try {
    console.log(`Scraping (${visited.size + 1}/${MAX_PAGES}): ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`  ⚠️  Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract links BEFORE removing elements
    const links = extractLinks($, url);

    // Remove scripts, styles, and other non-content elements
    $('script, style, nav, header, footer, iframe, noscript').remove();

    // Extract main content
    const title = $('title').text().trim() || $('h1').first().text().trim();
    const mainContent = $('main').length 
      ? $('main').text() 
      : $('body').text();

    // Clean up the text
    const cleanText = mainContent
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    // Extract key information
    const headings = [];
    $('h1, h2, h3').each((i, el) => {
      const text = $(el).text().trim();
      if (text) headings.push(text);
    });

    console.log(`  ✓ Successfully scraped: ${title}`);

    return {
      url,
      title,
      content: cleanText.substring(0, 5000), // Limit content length
      headings: headings.slice(0, 10),
      scrapedAt: new Date().toISOString(),
      links, // Return discovered links
    };
  } catch (error) {
    console.error(`  ✗ Error scraping ${url}:`, error.message);
    return null;
  }
}

async function scrapeWebsite() {
  console.log('🔍 Starting CFLAR website scrape...');
  console.log(`📍 Target: ${BASE_URL}`);
  console.log(`📊 Max pages: ${MAX_PAGES}\n`);

  while (toVisit.size > 0 && visited.size < MAX_PAGES) {
    const path = toVisit.values().next().value;
    toVisit.delete(path);
    
    // Skip if already visited
    if (visited.has(path)) continue;
    
    visited.add(path);
    const fullUrl = `${BASE_URL}${path}`;
    const pageData = await scrapePage(fullUrl);
    
    if (pageData) {
      // Don't store the links array in the knowledge base
      const { links, ...pageInfo } = pageData;
      knowledgeBase.push(pageInfo);
      
      // Add new links to the toVisit set
      for (const link of links) {
        if (!visited.has(link) && !toVisit.has(link)) {
          toVisit.add(link);
        }
      }
    }

    // Be polite - wait between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Save to public directory for client-side access
  const publicDir = join(__dirname, '../public');
  
  // Ensure public directory exists
  try {
    mkdirSync(publicDir, { recursive: true });
  } catch (err) {
    // Directory might already exist, that's fine
  }
  
  const outputPath = join(publicDir, 'knowledge-base.json');
  
  const output = {
    lastUpdated: new Date().toISOString(),
    baseUrl: BASE_URL,
    pageCount: knowledgeBase.length,
    pages: knowledgeBase,
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n✅ Scraping complete!`);
  console.log(`📝 Scraped ${knowledgeBase.length} pages`);
  console.log(`💾 Saved to: ${outputPath}`);
  console.log(`\nKnowledge base is ready to use!`);
  
  // Show discovered URLs
  console.log(`\n📄 Pages indexed:`);
  knowledgeBase.forEach((page, i) => {
    console.log(`  ${i + 1}. ${page.title}`);
  });
}

// Run the scraper
scrapeWebsite().catch(console.error);