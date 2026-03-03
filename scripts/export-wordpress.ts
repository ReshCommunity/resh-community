#!/usr/bin/env tsx

/**
 * WordPress to Next.js Content Exporter v2
 *
 * This script exports WordPress content from the database.sql file
 * and converts it to MDX files with frontmatter for Next.js.
 */

import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  wordpressBackupPath: '/Users/marcangeloh/Desktop/All Desktop/Themes/blogar-blog-magazine-wordpress-theme/resh/backup-resh.community-20221217-dtspppmaiqspumuq',
  databaseFile: 'database.sql',
  outputDir: path.join(process.cwd(), 'content'),
};

interface WordPressPost {
  ID: number;
  post_title: string;
  post_name: string;
  post_date: string;
  post_modified: string;
  post_content: string;
  post_excerpt: string;
  post_author: string;
  post_status: string;
  post_type: string;
  guid: string; // For attachment image URLs
}

// Storage
const posts = new Map<number, WordPressPost>();
const postMeta = new Map<number, Map<string, string>>();
const terms = new Map<number, { name: string; slug: string }>();
const termTaxonomies = new Map<number, { term_id: number; taxonomy: string; description: string; count: number }>();
const termRelationships = new Map<number, number[]>();

/**
 * Main export function
 */
async function exportWordPress(): Promise<void> {
  console.log('🚀 Starting WordPress export...\n');

  const dbPath = path.join(CONFIG.wordpressBackupPath, CONFIG.databaseFile);
  console.log(`📖 Reading database from: ${dbPath}`);

  const sqlContent = fs.readFileSync(dbPath, 'utf-8');

  // Parse all INSERT statements
  parseInsertStatements(sqlContent);

  console.log(`✅ Parsed ${posts.size} posts`);
  console.log(`✅ Parsed ${postMeta.size} posts with meta data`);
  console.log(`✅ Parsed ${terms.size} terms`);

  // Create output directories
  const postsDir = path.join(CONFIG.outputDir, 'posts');
  const pagesDir = path.join(CONFIG.outputDir, 'pages');
  fs.mkdirSync(postsDir, { recursive: true });
  fs.mkdirSync(pagesDir, { recursive: true });

  let postCount = 0;
  let pageCount = 0;

  // Export posts
  for (const [id, post] of posts.entries()) {
    if (post.post_type === 'post') {
      exportPost(post, postsDir);
      postCount++;
    } else if (post.post_type === 'page') {
      exportPost(post, pagesDir);
      pageCount++;
    }
  }

  console.log(`✅ Exported ${postCount} posts to ${postsDir}`);
  console.log(`✅ Exported ${pageCount} pages to ${pagesDir}`);

  // Export taxonomies
  exportTaxonomies();

  console.log('\n✨ Export complete!');
  console.log(`📁 Content directory: ${CONFIG.outputDir}`);
}

/**
 * Parse INSERT statements from SQL
 */
function parseInsertStatements(sqlContent: string): void {
  const statements: Array<{ tableName: string; valuesStr: string }> = [];

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

  console.log(`Found ${statements.length} INSERT statements`);

  for (const { tableName, valuesStr } of statements) {
    const rows = parseValueRows(valuesStr);

    if (rows.length === 0) continue;

    // Route to appropriate handler
    if (tableName === 'wp_posts') {
      processPosts(rows);
    } else if (tableName === 'wp_postmeta') {
      processPostMeta(rows);
    } else if (tableName === 'wp_terms') {
      processTerms(rows);
    } else if (tableName === 'wp_term_taxonomy') {
      processTermTaxonomy(rows);
    } else if (tableName === 'wp_term_relationships') {
      processTermRelationships(rows);
    }
  }
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
      } else if (char === '-' && nextChar === '1') {
        // -1 as special value
        currentValue = '-1';
        i += 2;
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
 * Process wp_posts rows
 * WordPress wp_posts column order: ID, post_author, post_date, post_date_gmt, post_content,
 * post_title, post_excerpt, post_status, comment_status, ping_status, post_password,
 * post_name, to_ping, pinged, post_modified, post_modified_gmt, post_content_filtered,
 * post_parent, guid, menu_order, post_type, post_mime_type, comment_count
 */
function processPosts(rows: string[][]): void {
  for (const row of rows) {
    if (row.length < 22) continue;

    const post: WordPressPost = {
      ID: parseInt(row[0]) || 0,
      post_author: row[1],
      post_date: row[2],
      post_modified: row[14],
      post_content: row[4],
      post_title: row[5],
      post_name: row[11],
      post_status: row[7],
      post_type: row[20],
      post_excerpt: row[6] || '',
      guid: row[18] || '', // For attachment image URLs
    };

    // Store posts, pages, and attachments (attachments needed for featured images)
    if (post.post_type === 'post' || post.post_type === 'page' || post.post_type === 'attachment') {
      posts.set(post.ID, post);
    }
  }
}

/**
 * Process wp_postmeta rows
 */
function processPostMeta(rows: string[][]): void {
  for (const row of rows) {
    if (row.length < 4) continue;

    const postId = parseInt(row[0]) || 0;
    const metaKey = row[1];
    const metaValue = row[2];

    if (!postMeta.has(postId)) {
      postMeta.set(postId, new Map());
    }

    postMeta.get(postId)!.set(metaKey, metaValue);
  }
}

/**
 * Process wp_terms rows
 */
function processTerms(rows: string[][]): void {
  for (const row of rows) {
    if (row.length < 4) continue;

    const termId = parseInt(row[0]) || 0;
    terms.set(termId, {
      name: row[1],
      slug: row[2],
    });
  }
}

/**
 * Process wp_term_taxonomy rows
 */
function processTermTaxonomy(rows: string[][]): void {
  for (const row of rows) {
    if (row.length < 6) continue;

    const termTaxId = parseInt(row[0]) || 0;
    termTaxonomies.set(termTaxId, {
      term_id: parseInt(row[1]) || 0,
      taxonomy: row[2],
      description: row[3],
      count: parseInt(row[5]) || 0,
    });
  }
}

/**
 * Process wp_term_relationships rows
 */
function processTermRelationships(rows: string[][]): void {
  for (const row of rows) {
    if (row.length < 3) continue;

    const objectId = parseInt(row[0]) || 0;
    const termTaxId = parseInt(row[1]) || 0;

    if (!termRelationships.has(objectId)) {
      termRelationships.set(objectId, []);
    }

    termRelationships.get(objectId)!.push(termTaxId);
  }
}

/**
 * Get categories for a post
 */
function getPostCategories(postId: number): string[] {
  const categories: string[] = [];
  const relationships = termRelationships.get(postId) || [];

  for (const termTaxId of relationships) {
    const termTax = termTaxonomies.get(termTaxId);
    if (termTax && termTax.taxonomy === 'category') {
      const term = terms.get(termTax.term_id);
      if (term) categories.push(term.name);
    }
  }

  return categories;
}

/**
 * Get tags for a post
 */
function getPostTags(postId: number): string[] {
  const tags: string[] = [];
  const relationships = termRelationships.get(postId) || [];

  for (const termTaxId of relationships) {
    const termTax = termTaxonomies.get(termTaxId);
    if (termTax && termTax.taxonomy === 'post_tag') {
      const term = terms.get(termTax.term_id);
      if (term) tags.push(term.name);
    }
  }

  return tags;
}

/**
 * Get primary category for a post
 */
function getPrimaryCategory(postId: number): string {
  const meta = postMeta.get(postId);
  if (meta && meta.has('_yoast_wpseo_primary_category')) {
    const catId = parseInt(meta.get('_yoast_wpseo_primary_category')!);
    const termTax = Array.from(termTaxonomies.values()).find(
      tt => tt.term_id === catId && tt.taxonomy === 'category'
    );
    if (termTax) {
      const term = terms.get(termTax.term_id);
      return term ? term.name : '';
    }
  }

  const categories = getPostCategories(postId);
  return categories.length > 0 ? categories[0] : '';
}

/**
 * Get featured image URL
 */
function getFeaturedImage(postId: number): string {
  const meta = postMeta.get(postId);
  if (meta && meta.has('_thumbnail_id')) {
    const thumbnailId = parseInt(meta.get('_thumbnail_id')!);
    // Look up the attachment post directly to get its guid field
    const attachmentPost = posts.get(thumbnailId);
    if (attachmentPost && attachmentPost.post_type === 'attachment' && attachmentPost.guid) {
      // Convert WordPress URL to local path
      return attachmentPost.guid.replace(/https?:\/\/resh\.community\/wp-content\/uploads\//g, '/uploads/');
    }
  }
  return '';
}

/**
 * Get Yoast SEO meta
 */
function getYoastSEO(postId: number, post: WordPressPost) {
  const meta = postMeta.get(postId);
  const seo: any = {};

  if (meta) {
    if (meta.has('_yoast_wpseo_title')) {
      seo.title = meta.get('_yoast_wpseo_title');
    }
    if (meta.has('_yoast_wpseo_metadesc')) {
      seo.description = meta.get('_yoast_wpseo_metadesc');
    }
    if (meta.has('_yoast_wpseo_focuskw')) {
      seo.focus_keyword = meta.get('_yoast_wpseo_focuskw');
    }
    if (meta.has('_yoast_wpseo_canonical')) {
      seo.canonical = meta.get('_yoast_wpseo_canonical');
    }
    if (meta.has('_yoast_wpseo_opengraph-title')) {
      seo.opengraph_title = meta.get('_yoast_wpseo_opengraph-title');
    }
    if (meta.has('_yoast_wpseo_opengraph-description')) {
      seo.opengraph_description = meta.get('_yoast_wpseo_opengraph-description');
    }
    if (meta.has('_yoast_wpseo_opengraph-image')) {
      seo.opengraph_image = meta.get('_yoast_wpseo_opengraph-image');
    }
  }

  // Fallbacks
  if (!seo.title) seo.title = post.post_title;
  if (!seo.description) seo.description = post.post_excerpt || '';
  if (!seo.canonical) seo.canonical = `https://resh.community/${post.post_name}/`;

  return seo;
}

/**
 * Calculate reading time
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanContent.split(' ').length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Export a post to MDX file
 */
function exportPost(post: WordPressPost, outputDir: string): void {
  const categories = getPostCategories(post.ID);
  const tags = getPostTags(post.ID);
  const primaryCategory = getPrimaryCategory(post.ID);
  const featuredImage = getFeaturedImage(post.ID);
  const yoastSEO = getYoastSEO(post.ID, post);
  const readingTime = calculateReadingTime(post.post_content);

  let frontmatter = '---\n';
  frontmatter += `title: "${escapeYaml(post.post_title)}"\n`;
  frontmatter += `slug: "${post.post_name}"\n`;
  frontmatter += `date: "${post.post_date}"\n`;
  frontmatter += `modified: "${post.post_modified}"\n`;
  frontmatter += `excerpt: "${escapeYaml(post.post_excerpt.replace(/\n/g, ' '))}"\n`;
  frontmatter += `author: "Resh Community"\n`;
  frontmatter += `author_id: ${post.post_author}\n`;
  frontmatter += `category: "${primaryCategory}"\n`;
  frontmatter += `categories: [${categories.map(c => `"${escapeYaml(c)}"`).join(', ')}]\n`;
  frontmatter += `tags: [${tags.map(t => `"${escapeYaml(t)}"`).join(', ')}]\n`;
  frontmatter += `featured_image: "${featuredImage}"\n`;
  frontmatter += `reading_time: ${readingTime}\n`;
  frontmatter += `status: "${post.post_status}"\n`;
  frontmatter += `format: "standard"\n`;
  frontmatter += `seo:\n`;
  frontmatter += `  title: "${escapeYaml(yoastSEO.title || '')}"\n`;
  frontmatter += `  description: "${escapeYaml(yoastSEO.description || '')}"\n`;
  frontmatter += `  focus_keyword: "${escapeYaml(yoastSEO.focus_keyword || '')}"\n`;
  frontmatter += `  canonical: "${escapeYaml(yoastSEO.canonical || '')}"\n`;
  frontmatter += `  opengraph:\n`;
  frontmatter += `    title: "${escapeYaml(yoastSEO.opengraph_title || yoastSEO.title || '')}"\n`;
  frontmatter += `    description: "${escapeYaml(yoastSEO.opengraph_description || yoastSEO.description || '')}"\n`;
  frontmatter += `    image: "${escapeYaml(yoastSEO.opengraph_image || featuredImage)}"\n`;
  frontmatter += `  twitter:\n`;
  frontmatter += `    card: "summary_large_image"\n`;
  frontmatter += `    title: "${escapeYaml(yoastSEO.title || '')}"\n`;
  frontmatter += `    description: "${escapeYaml(yoastSEO.description || '')}"\n`;
  frontmatter += `    image: "${escapeYaml(yoastSEO.opengraph_image || featuredImage)}"\n`;
  frontmatter += '---\n\n';

  // Add content (convert HTML to markdown-like format)
  const content = htmlToMarkdown(post.post_content);
  const fullContent = frontmatter + content;

  const filename = path.join(outputDir, `${post.post_name}.mdx`);
  fs.writeFileSync(filename, fullContent, 'utf-8');
}

/**
 * Escape special YAML characters
 */
function escapeYaml(str: string): string {
  if (!str) return '';
  return str
    .replace(/"/g, '\\"')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '');
}

/**
 * Convert HTML to Markdown
 */
function htmlToMarkdown(html: string): string {
  if (!html) return '';

  return html
    .replace(/<!--[^>]*-->/g, '') // Remove HTML comments
    .replace(/<h1[^>]*>(.*?)<\/h1>/gis, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gis, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gis, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gis, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gis, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gis, '###### $1\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]+src="([^"]+)"[^>]+alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Export taxonomies to JSON
 */
function exportTaxonomies(): void {
  const categories: any[] = [];
  const tags: any[] = [];

  for (const [termTaxId, termTax] of termTaxonomies.entries()) {
    const term = terms.get(termTax.term_id);
    if (!term) continue;

    if (termTax.taxonomy === 'category') {
      categories.push({
        id: termTax.term_id,
        name: term.name,
        slug: term.slug,
        description: termTax.description,
        count: termTax.count,
      });
    } else if (termTax.taxonomy === 'post_tag') {
      tags.push({
        id: termTax.term_id,
        name: term.name,
        slug: term.slug,
        count: termTax.count,
      });
    }
  }

  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'categories.json'),
    JSON.stringify(categories, null, 2),
    'utf-8'
  );

  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'tags.json'),
    JSON.stringify(tags, null, 2),
    'utf-8'
  );

  console.log(`✅ Exported ${categories.length} categories`);
  console.log(`✅ Exported ${tags.length} tags`);
}

// Run the export
exportWordPress().catch(console.error);
