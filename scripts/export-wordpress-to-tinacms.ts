#!/usr/bin/env tsx

/**
 * WordPress to TinaCMS Export Script
 *
 * This script exports WordPress content from the database.sql file
 * and converts it to TinaCMS-compatible MDX files with proper frontmatter.
 * Images are downloaded and stored locally in public/uploads/YYYY/MM/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Path to WordPress database.sql backup
  dbPath: '/Users/marcangeloh/Desktop/All Desktop/Themes/blogar-blog-magazine-wordpress-theme/resh/backup-resh.community-20221217-dtspppmaiqspumuq/database.sql',

  // Output directories
  contentDir: path.join(__dirname, '../content'),
  uploadsDir: path.join(__dirname, '../public/uploads'),

  // WordPress URLs
  wpUploadsUrl: 'https://resh.community/wp-content/uploads',

  // TinaCMS category options (must match config.ts)
  validCategories: [
    'Blockchain Technology',
    'News',
    'Crypto 101',
    'DeFi',
  ],

  // Concurrency settings
  downloadConcurrency: 5,
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface WPPost {
  ID: string;
  post_author: string;
  post_date: string;
  post_date_gmt: string;
  post_content: string;
  post_title: string;
  post_excerpt: string;
  post_status: string;
  post_name: string;
  post_modified: string;
  post_modified_gmt: string;
  post_parent: string;
  guid: string;
  menu_order: string;
  post_type: string;
  post_mime_type: string;
  comment_count: string;
}

interface WPPostMeta {
  meta_id: string;
  post_id: string;
  meta_key: string;
  meta_value: string;
}

interface WPTerm {
  term_id: string;
  name: string;
  slug: string;
  term_group: string;
}

interface WPTermTaxonomy {
  term_taxonomy_id: string;
  term_id: string;
  taxonomy: string;
  description: string;
  parent: string;
  count: string;
}

interface WPTermRelationship {
  object_id: string;
  term_taxonomy_id: string;
  term_order: string;
}

interface TinaCMSPost {
  title: string;
  slug: string;
  date: string;
  modified?: string;
  excerpt?: string;
  author?: string;
  author_id?: number;
  category?: string;
  categories?: string;
  tags?: string;
  featured_image?: string;
  reading_time?: number;
  status: string;
  format?: string;
  seo?: {
    title?: string;
    canonical?: string;
  };
  body: string;
}

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

const posts = new Map<string, WPPost>();
const postMeta = new Map<string, WPPostMeta[]>();
const terms = new Map<string, WPTerm>();
const termTaxonomy = new Map<string, WPTermTaxonomy>();
const termRelationships = new Map<string, string[]>(); // post_id -> term_taxonomy_ids

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Escape YAML special characters
 */
function escapeYaml(str: string): string {
  if (!str) return '';
  return str
    .replace(/"/g, '\\"')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
    .replace(/\t/g, ' ');
}

/**
 * Calculate reading time in minutes
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const cleanContent = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = cleanContent.split(' ').length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Convert WordPress image URL to local path
 */
function convertImageUrlToLocal(url: string): string {
  if (!url) return '';

  return url.replace(
    /https?:\/\/resh\.community\/wp-content\/uploads\//gi,
    '/uploads/'
  );
}

/**
 * Extract year/month from WordPress upload URL
 */
function extractUploadPath(url: string): { year: string; month: string; filename: string } | null {
  if (!url) return null;

  // Match URLs like https://resh.community/wp-content/uploads/2022/12/filename.jpg
  const match = url.match(/\/uploads\/(\d{4})\/(\d{2})\/([^/]+\.\w+)$/);
  if (!match) return null;

  return {
    year: match[1],
    month: match[2],
    filename: match[3],
  };
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ============================================================================
// IMAGE DOWNLOAD FUNCTIONS
// ============================================================================

/**
 * Download a single image from WordPress to local storage
 */
async function downloadImage(url: string, localPath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  ⚠ Failed to download ${url}: ${response.status}`);
      return false;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    ensureDir(path.dirname(localPath));
    fs.writeFileSync(localPath, buffer);
    return true;
  } catch (error) {
    console.warn(`  ⚠ Error downloading ${url}:`, error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Extract all image URLs from post content
 */
function extractImageUrls(content: string): string[] {
  const urls: string[] = [];

  // Match <img> tags with src attribute
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    if (match[1]) {
      urls.push(match[1]);
    }
  }

  // Also match WordPress-style image URLs in content
  const wpUrlRegex = /https?:\/\/resh\.community\/wp-content\/uploads\/[^\s"')>\]]+/gi;
  while ((match = wpUrlRegex.exec(content)) !== null) {
    if (match[0]) {
      urls.push(match[0]);
    }
  }

  return [...new Set(urls)]; // Deduplicate
}

/**
 * Download all images from posts (featured + inline)
 */
async function downloadAllImages(postMap: Map<string, WPPost>): Promise<{ downloaded: number; failed: number }> {
  console.log('\n📥 Downloading images...');

  const imageUrls = new Set<string>();
  let downloaded = 0;
  let failed = 0;

  // Collect all image URLs
  for (const [id, post] of postMap) {
    // Get featured image from postmeta
    const metadata = postMeta.get(id) || [];
    for (const meta of metadata) {
      if (meta.meta_key === '_thumbnail_id') {
        const attachmentPost = posts.get(meta.meta_value);
        if (attachmentPost?.guid) {
          imageUrls.add(attachmentPost.guid);
        }
      }
    }

    // Extract images from post content
    const contentImages = extractImageUrls(post.post_content);
    contentImages.forEach(url => imageUrls.add(url));
  }

  console.log(`  Found ${imageUrls.size} unique images to download`);

  // Download images in batches
  const urls = Array.from(imageUrls);
  for (let i = 0; i < urls.length; i += CONFIG.downloadConcurrency) {
    const batch = urls.slice(i, i + CONFIG.downloadConcurrency);
    const promises = batch.map(async (url) => {
      const uploadPath = extractUploadPath(url);
      if (!uploadPath) return { success: false, url };

      const localPath = path.join(
        CONFIG.uploadsDir,
        uploadPath.year,
        uploadPath.month,
        uploadPath.filename
      );

      // Skip if already exists
      if (fs.existsSync(localPath)) {
        return { success: true, url, cached: true };
      }

      const success = await downloadImage(url, localPath);
      return { success, url };
    });

    const results = await Promise.all(promises);
    for (const result of results) {
      if (result.success) {
        if (!result.cached) downloaded++;
      } else {
        failed++;
      }
    }

    // Show progress
    const completed = Math.min(i + CONFIG.downloadConcurrency, urls.length);
    if (completed % 20 === 0 || completed === urls.length) {
      console.log(`  Progress: ${completed}/${urls.length} images processed`);
    }
  }

  console.log(`  ✓ Downloaded: ${downloaded} new images`);
  if (failed > 0) {
    console.log(`  ⚠ Failed: ${failed} images`);
  }

  return { downloaded, failed };
}

// ============================================================================
// SQL PARSING FUNCTIONS
// ============================================================================

interface InsertStatement {
  tableName: string;
  valuesStr: string;
}

/**
 * Find all INSERT statements in SQL content
 * Uses character-by-character scanning for robustness
 */
function findAllInsertStatements(sqlContent: string): InsertStatement[] {
  const statements: InsertStatement[] = [];

  // Find all INSERT statements by scanning character by character
  let i = 0;
  while (i < sqlContent.length) {
    // Find next INSERT INTO
    const insertStart = sqlContent.indexOf('INSERT INTO `', i);
    if (insertStart === -1) break;

    // Extract table name
    const tableMatch = sqlContent.substring(insertStart).match(/INSERT INTO `([^`]+)`/);
    if (!tableMatch) {
      i = insertStart + 1;
      continue;
    }

    const tableName = tableMatch[1];
    const valuesStart = insertStart + tableMatch[0].length + ' VALUES '.length;

    // Find the end of the statement by tracking parentheses and string literals
    let parenDepth = 0;
    let inString = false;
    let stringChar = '';
    let j = valuesStart;
    let endOfStatement = -1;

    while (j < sqlContent.length) {
      const char = sqlContent[j];
      const nextChar = sqlContent[j + 1];

      if (!inString) {
        if (char === '(') {
          parenDepth++;
        } else if (char === ')') {
          parenDepth--;
          // When we close all parens and see a semicolon, that's the end
          if (parenDepth === 0 && (j + 1 < sqlContent.length && sqlContent[j + 1] === ';')) {
            endOfStatement = j + 2; // Include the semicolon
            break;
          }
        } else if (char === '"' || char === "'") {
          inString = true;
          stringChar = char;
        }
      } else {
        // Inside a string literal
        if (char === '\\' && nextChar === stringChar) {
          j++; // Skip escaped quote
        } else if (char === stringChar) {
          inString = false;
        }
      }

      j++;
    }

    if (endOfStatement === -1) {
      i = insertStart + 1;
      continue;
    }

    const valuesStr = sqlContent.substring(valuesStart, endOfStatement - 1);
    statements.push({ tableName, valuesStr });

    i = endOfStatement;
  }

  return statements;
}

/**
 * Parse value rows from VALUES clause
 * Uses a state machine to properly handle quoted strings with commas, newlines, and special characters
 */
function parseValueRows(valuesStr: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = '';
  let inString = false;
  let stringChar = '';
  let parenDepth = 0;
  let i = 0;

  while (i < valuesStr.length) {
    const char = valuesStr[i];
    const nextChar = valuesStr[i + 1];

    if (!inString) {
      if (char === '(') {
        // Start of a new row
        parenDepth++;
        if (parenDepth === 1) {
          currentRow = [];
          currentValue = '';
          i++;
          continue;
        }
      } else if (char === ')') {
        // End of current row
        parenDepth--;
        if (parenDepth === 0) {
          // Add the last value
          currentRow.push(currentValue);
          rows.push(currentRow);

          // Skip to next row (handle comma and whitespace between rows)
          currentValue = '';
          i++;
          while (i < valuesStr.length && (valuesStr[i] === ',' || valuesStr[i] === ' ' || valuesStr[i] === '\n' || valuesStr[i] === '\t' || valuesStr[i] === '\r')) {
            i++;
          }
          continue;
        }
      } else if (char === ',' && parenDepth === 1) {
        // Comma separator between values within a row
        currentRow.push(currentValue);
        currentValue = '';
        i++;
        continue;
      } else if ((char === '"' || char === "'")) {
        // Start of string value
        inString = true;
        stringChar = char;
        i++;
        continue;
      } else if (char === 'N' && nextChar === 'U' && valuesStr[i + 2] === 'L' && valuesStr[i + 3] === 'L') {
        // NULL value
        currentValue = '';
        i += 4;
        continue;
      } else if (char === '0' && nextChar === ',') {
        // Handle 0 as value
        currentValue = '0';
        i++;
        continue;
      } else if (char >= '0' && char <= '9') {
        // Number value
        currentValue = char;
        i++;
        while (i < valuesStr.length && valuesStr[i] >= '0' && valuesStr[i] <= '9') {
          currentValue += valuesStr[i];
          i++;
        }
        // Don't increment i again, the loop will continue
        continue;
      }
    } else {
      // Inside a string literal
      if (char === '\\' && nextChar === stringChar) {
        // Escaped quote
        currentValue += stringChar;
        i += 2;
        continue;
      } else if (char === stringChar) {
        // End of string literal
        inString = false;
        i++;
        continue;
      } else {
        // Regular character in string
        currentValue += char;
        i++;
        continue;
      }
    }

    // Default: just move to next character
    i++;
  }

  return rows;
}

/**
 * Parse INSERT statement and extract values for a specific table
 */
function parseInsertStatement(sql: string, tableName: string): any[] | null {
  const allStatements = findAllInsertStatements(sql);
  const tableStatements = allStatements.filter(s => s.tableName === tableName);

  if (tableStatements.length === 0) return null;

  const allRows: any[] = [];
  for (const stmt of tableStatements) {
    const rows = parseValueRows(stmt.valuesStr);
    allRows.push(...rows);
  }

  return allRows;
}

// ============================================================================
// HTML TO MARKDOWN CONVERSION
// ============================================================================

/**
 * Convert HTML to Markdown format
 */
function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let markdown = html;

  // Remove WordPress shortcodes
  markdown = markdown.replace(/\[caption[^\]]*\](.*?)\[\/caption\]/gi, '$1');
  markdown = markdown.replace(/\[embed[^\]]*\](.*?)\[\/embed\]/gi, '$1');
  markdown = markdown.replace(/\[gallery[^\]]*\]/gi, '');
  markdown = markdown.replace(/\[\/gallery\]/gi, '');

  // Headers
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

  // Bold and italic
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Links - convert to local URLs if internal
  markdown = markdown.replace(
    /<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi,
    (match, href, text) => {
      // Convert internal WordPress links to local slugs
      const localHref = href.replace(/https?:\/\/resh\.community\//gi, '/');
      return `[${text}](${localHref})`;
    }
  );

  // Images - convert to local paths
  markdown = markdown.replace(
    /<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi,
    (match, src, alt) => {
      const localSrc = convertImageUrlToLocal(src);
      return `![${alt}](${localSrc})`;
    }
  );
  markdown = markdown.replace(
    /<img[^>]*src=["']([^"']*)["'][^>]*>/gi,
    (match, src) => {
      const localSrc = convertImageUrlToLocal(src);
      return `![](${localSrc})`;
    }
  );

  // Unordered lists
  markdown = markdown.replace(/<ul[^>]*>/gi, '');
  markdown = markdown.replace(/<\/ul>/gi, '\n');
  markdown = markdown.replace(/<li[^>]*>/gi, '- ');
  markdown = markdown.replace(/<\/li>/gi, '\n');

  // Ordered lists (note: this is a simplification)
  markdown = markdown.replace(/<ol[^>]*>/gi, '');
  markdown = markdown.replace(/<\/ol>/gi, '\n');

  // Paragraphs
  markdown = markdown.replace(/<p[^>]*>/gi, '');
  markdown = markdown.replace(/<\/p>/gi, '\n\n');

  // Line breaks
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');

  // Blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>/gi, '\n> ');
  markdown = markdown.replace(/<\/blockquote>/gi, '\n\n');

  // Code blocks
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>/gi, '```\n');
  markdown = markdown.replace(/<\/code><\/pre>/gi, '\n```\n');
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Handle <figure> elements (WordPress captions)
  markdown = markdown.replace(/<figure[^>]*>/gi, '');
  markdown = markdown.replace(/<\/figure>/gi, '\n\n');
  markdown = markdown.replace(/<figcaption[^>]*>(.*?)<\/figcaption>/gi, '\n*$1*\n');

  // Remove other block elements
  markdown = markdown.replace(/<(div|span|section|article)[^>]*>/gi, '');
  markdown = markdown.replace(/<\/(div|span|section|article)>/gi, '');

  // Handle <sup> and <sup> tags
  markdown = markdown.replace(/<sup[^>]*>(.*?)<\/sup>/gi, '^$1^');
  markdown = markdown.replace(/<sub[^>]*>(.*?)<\/sub>/gi, '~$1~');

  // Handle embedded content
  markdown = markdown.replace(/<iframe[^>]*>/gi, '');
  markdown = markdown.replace(/<\/iframe>/gi, '');

  // Remove HTML comments
  markdown = markdown.replace(/<!--[\s\S]*?-->/g, '');

  // Clean up excessive whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.replace(/^[ \t]+$/gm, '');

  return markdown.trim();
}

// ============================================================================
// CATEGORY MAPPING
// ============================================================================

/**
 * Map WordPress category to TinaCMS category option
 */
function mapCategoryToTinaCMS(categoryName: string): string {
  const validCategories = CONFIG.validCategories;

  // Direct match
  if (validCategories.includes(categoryName)) {
    return categoryName;
  }

  // Case-insensitive match
  const lowerCategory = categoryName.toLowerCase();
  for (const valid of validCategories) {
    if (valid.toLowerCase() === lowerCategory) {
      return valid;
    }
  }

  // Partial match for common variations
  if (lowerCategory.includes('blockchain') || lowerCategory.includes('crypto')) {
    return 'Blockchain Technology';
  }
  if (lowerCategory.includes('news') || lowerCategory.includes('update')) {
    return 'News';
  }
  if (lowerCategory.includes('defi') || lowerCategory.includes('finance')) {
    return 'DeFi';
  }
  if (lowerCategory.includes('101') || lowerCategory.includes('guide') || lowerCategory.includes('tutorial')) {
    return 'Crypto 101';
  }

  // Default to first category
  return 'Blockchain Technology';
}

// ============================================================================
// POST EXPORT FUNCTIONS
// ============================================================================

/**
 * Generate frontmatter for TinaCMS
 */
function generateFrontmatter(post: WPPost): string {
  // Get metadata
  const metadata = postMeta.get(post.ID) || [];

  // Extract metadata values
  let featuredImage = '';
  let seoTitle = '';
  let canonical = '';

  for (const m of metadata) {
    if (m.meta_key === '_thumbnail_id') {
      const attachmentPost = posts.get(m.meta_value);
      if (attachmentPost && attachmentPost.post_type === 'attachment') {
        featuredImage = convertImageUrlToLocal(attachmentPost.guid);
      }
    } else if (m.meta_key === '_yoast_wpseo_title') {
      seoTitle = m.meta_value;
    } else if (m.meta_key === '_yoast_wpseo_canonical') {
      canonical = m.meta_value;
    }
  }

  // Get categories and tags
  const termTaxIds = termRelationships.get(post.ID) || [];
  const categories: string[] = [];
  const tags: string[] = [];

  for (const ttId of termTaxIds) {
    const tt = termTaxonomy.get(ttId);
    if (!tt) continue;

    const term = terms.get(tt.term_id);
    if (!term) continue;

    if (tt.taxonomy === 'category') {
      categories.push(term.name);
    } else if (tt.taxonomy === 'post_tag') {
      tags.push(term.name);
    }
  }

  // Map primary category
  const primaryCategory = categories.length > 0
    ? mapCategoryToTinaCMS(categories[0])
    : 'Blockchain Technology';

  // Convert to comma-separated strings for TinaCMS
  const categoriesStr = categories.join(', ');
  const tagsStr = tags.join(', ');

  // Reading time
  const readingTime = calculateReadingTime(post.post_content);

  // Post format (default to standard)
  const format = 'standard';

  // Build frontmatter
  let fm = '---\n';
  fm += `title: "${escapeYaml(post.post_title)}"\n`;
  fm += `slug: "${post.post_name}"\n`;
  fm += `date: "${post.post_date}"\n`;
  fm += `modified: "${post.post_modified}"\n`;
  fm += `excerpt: "${escapeYaml(post.post_excerpt)}"\n`;
  fm += `author: "Resh Community"\n`;
  fm += `author_id: ${post.post_author}\n`;
  fm += `category: "${primaryCategory}"\n`;
  fm += `categories: "${escapeYaml(categoriesStr)}"\n`;
  fm += `tags: "${escapeYaml(tagsStr)}"\n`;
  if (featuredImage) {
    fm += `featured_image: "${featuredImage}"\n`;
  }
  fm += `reading_time: ${readingTime}\n`;
  fm += `status: "${post.post_status}"\n`;
  fm += `format: "${format}"\n`;
  fm += `seo:\n`;
  if (seoTitle) {
    fm += `  title: "${escapeYaml(seoTitle)}"\n`;
  }
  if (canonical) {
    fm += `  canonical: "${canonical}"\n`;
  }
  fm += '---\n\n';

  return fm;
}

/**
 * Export posts to MDX files
 */
function exportPosts(): { posts: number; pages: number } {
  console.log('\n📝 Exporting posts and pages...');

  const postsDir = path.join(CONFIG.contentDir, 'posts');
  const pagesDir = path.join(CONFIG.contentDir, 'pages');

  // Clear existing content directories (fresh export)
  if (fs.existsSync(postsDir)) {
    fs.rmSync(postsDir, { recursive: true });
  }
  if (fs.existsSync(pagesDir)) {
    fs.rmSync(pagesDir, { recursive: true });
  }

  ensureDir(postsDir);
  ensureDir(pagesDir);

  let postCount = 0;
  let pageCount = 0;

  for (const [id, post] of posts) {
    // Skip drafts, revisions, attachments, nav items
    if (post.post_status !== 'publish') continue;
    if (['revision', 'attachment', 'nav_menu_item', 'custom_css', 'customize_changeset'].includes(post.post_type)) {
      continue;
    }

    // Generate frontmatter and content
    const frontmatter = generateFrontmatter(post);
    const content = htmlToMarkdown(post.post_content);
    const mdx = frontmatter + content;

    // Write to appropriate directory
    const dir = post.post_type === 'page' ? pagesDir : postsDir;
    const filename = `${post.post_name}.mdx`;
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, mdx, 'utf-8');

    if (post.post_type === 'post') {
      postCount++;
    } else if (post.post_type === 'page') {
      pageCount++;
    }
  }

  console.log(`  ✓ Exported ${postCount} posts`);
  console.log(`  ✓ Exported ${pageCount} pages`);

  return { posts: postCount, pages: pageCount };
}

/**
 * Export categories and tags to JSON
 */
function exportTaxonomies(): { categories: number; tags: number } {
  console.log('\n📂 Exporting taxonomies...');

  const categories: any[] = [];
  const tags: any[] = [];

  for (const [ttId, tt] of termTaxonomy) {
    const term = terms.get(tt.term_id);
    if (!term) continue;

    if (tt.taxonomy === 'category') {
      categories.push({
        id: tt.term_id,
        name: term.name,
        slug: term.slug,
        description: tt.description,
        count: parseInt(tt.count, 10) || 0,
        tinaCategory: mapCategoryToTinaCMS(term.name),
      });
    } else if (tt.taxonomy === 'post_tag') {
      tags.push({
        id: tt.term_id,
        name: term.name,
        slug: term.slug,
        count: parseInt(tt.count, 10) || 0,
      });
    }
  }

  // Sort by name
  categories.sort((a, b) => a.name.localeCompare(b.name));
  tags.sort((a, b) => a.name.localeCompare(b.name));

  // Write to files
  fs.writeFileSync(
    path.join(CONFIG.contentDir, 'categories.json'),
    JSON.stringify(categories, null, 2),
    'utf-8'
  );

  fs.writeFileSync(
    path.join(CONFIG.contentDir, 'tags.json'),
    JSON.stringify(tags, null, 2),
    'utf-8'
  );

  console.log(`  ✓ Exported ${categories.length} categories`);
  console.log(`  ✓ Exported ${tags.length} tags`);

  return { categories: categories.length, tags: tags.length };
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Main export function
 */
async function exportWordPressToTinaCMS(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   WordPress to TinaCMS Export Script                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Step 1: Read database.sql
  console.log('📖 Step 1: Reading database.sql...');
  if (!fs.existsSync(CONFIG.dbPath)) {
    console.error(`❌ Database file not found: ${CONFIG.dbPath}`);
    process.exit(1);
  }
  const sqlContent = fs.readFileSync(CONFIG.dbPath, 'utf-8');
  console.log(`  ✓ Loaded ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB\n`);

  // Step 2: Parse wp_posts
  console.log('📊 Step 2: Parsing wp_posts...');
  const postsData = parseInsertStatement(sqlContent, 'wp_posts');
  if (postsData) {
    for (const row of postsData) {
      const post: WPPost = {
        ID: row[0],
        post_author: row[1],
        post_date: row[2],
        post_date_gmt: row[3],
        post_content: row[4],
        post_title: row[5],
        post_excerpt: row[6],
        post_status: row[7],
        post_name: row[11],
        post_modified: row[14],
        post_modified_gmt: row[15],
        post_parent: row[16],
        guid: row[18],
        menu_order: row[19],
        post_type: row[20],
        post_mime_type: row[21],
        comment_count: row[22],
      };
      posts.set(post.ID, post);
    }
    console.log(`  ✓ Found ${posts.size} posts\n`);
  }

  // Step 3: Parse wp_postmeta
  console.log('📊 Step 3: Parsing wp_postmeta...');
  const postmetaData = parseInsertStatement(sqlContent, 'wp_postmeta');
  if (postmetaData) {
    for (const row of postmetaData) {
      const meta: WPPostMeta = {
        meta_id: row[0],
        post_id: row[1],
        meta_key: row[2],
        meta_value: row[3],
      };
      if (!postMeta.has(meta.post_id)) {
        postMeta.set(meta.post_id, []);
      }
      postMeta.get(meta.post_id)!.push(meta);
    }
    console.log(`  ✓ Found ${postmetaData.length} postmeta entries\n`);
  }

  // Step 4: Parse wp_terms
  console.log('📊 Step 4: Parsing wp_terms...');
  const termsData = parseInsertStatement(sqlContent, 'wp_terms');
  if (termsData) {
    for (const row of termsData) {
      const term: WPTerm = {
        term_id: row[0],
        name: row[2],
        slug: row[3],
        term_group: row[4],
      };
      terms.set(term.term_id, term);
    }
    console.log(`  ✓ Found ${terms.size} terms\n`);
  }

  // Step 5: Parse wp_term_taxonomy
  console.log('📊 Step 5: Parsing wp_term_taxonomy...');
  const termTaxData = parseInsertStatement(sqlContent, 'wp_term_taxonomy');
  if (termTaxData) {
    for (const row of termTaxData) {
      const tt: WPTermTaxonomy = {
        term_taxonomy_id: row[0],
        term_id: row[2],
        taxonomy: row[4],
        description: row[5],
        parent: row[6],
        count: row[7],
      };
      termTaxonomy.set(tt.term_taxonomy_id, tt);
    }
    console.log(`  ✓ Found ${termTaxData.length} taxonomy entries\n`);
  }

  // Step 6: Parse wp_term_relationships
  console.log('📊 Step 6: Parsing wp_term_relationships...');
  const relData = parseInsertStatement(sqlContent, 'wp_term_relationships');
  if (relData) {
    for (const row of relData) {
      const rel: WPTermRelationship = {
        object_id: row[0],
        term_taxonomy_id: row[1],
        term_order: row[2],
      };
      if (!termRelationships.has(rel.object_id)) {
        termRelationships.set(rel.object_id, []);
      }
      termRelationships.get(rel.object_id)!.push(rel.term_taxonomy_id);
    }
    console.log(`  ✓ Found ${relData.length} relationships\n`);
  }

  // Step 7: Download images
  const imageStats = await downloadAllImages(posts);

  // Step 8: Export posts and pages
  const contentStats = exportPosts();

  console.log('\n🔍 Debug: Term Relationships Map size:', termRelationships.size);
  console.log('🔍 Debug: Term Taxonomy Map size:', termTaxonomy.size);
  console.log('🔍 Debug: Terms Map size:', terms.size);

  // Step 9: Export taxonomies
  const taxonomyStats = exportTaxonomies();

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   Export Summary                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📄 Content:`);
  console.log(`   • Posts exported:  ${contentStats.posts}`);
  console.log(`   • Pages exported:  ${contentStats.pages}`);
  console.log(`\n📂 Taxonomies:`);
  console.log(`   • Categories:      ${taxonomyStats.categories}`);
  console.log(`   • Tags:           ${taxonomyStats.tags}`);
  console.log(`\n🖼️  Images:`);
  console.log(`   • Downloaded:     ${imageStats.downloaded}`);
  console.log(`   • Failed:        ${imageStats.failed}`);
  console.log(`\n📁 Output directories:`);
  console.log(`   • Posts:         ${path.join(CONFIG.contentDir, 'posts')}`);
  console.log(`   • Pages:         ${path.join(CONFIG.contentDir, 'pages')}`);
  console.log(`   • Uploads:       ${CONFIG.uploadsDir}`);
  console.log('\n✨ Export complete!\n');
}

// Run export
exportWordPressToTinaCMS().catch(console.error);
