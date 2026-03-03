#!/usr/bin/env tsx

/**
 * WordPress to Next.js Export Script
 * Exports posts, pages, categories, and tags from WordPress database.sql
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DB_PATH = '/Users/marcangeloh/Desktop/All Desktop/Themes/blogar-blog-magazine-wordpress-theme/resh/backup-resh.community-20221217-dtspppmaiqspumuq/database.sql';
const CONTENT_DIR = path.join(__dirname, '../content');
const UPLOADS_BASE_URL = 'https://resh.community/wp-content/uploads';

// Type definitions
interface WPPost {
  ID: string;
  guid: string;
  post_title: string;
  post_content: string;
  post_excerpt: string;
  post_date: string;
  post_name: string;
  post_type: 'post' | 'page' | 'revision' | 'attachment' | 'nav_menu_item' | 'custom_css' | 'customize_changeset';
  post_status: string;
}

interface WPPostMeta {
  post_id: string;
  meta_key: string;
  meta_value: string;
}

interface WPTerm {
  term_id: string;
  name: string;
  slug: string;
  description: string;
}

interface WPTermTaxonomy {
  term_id: string;
  taxonomy: string;
  description: string;
  count: number;
}

interface WPTermRelationship {
  object_id: string;
  term_taxonomy_id: string;
}

// In-memory storage
const posts = new Map<string, WPPost>();
const postMeta = new Map<string, WPPostMeta[]>();
const terms = new Map<string, WPTerm>();
const termTaxonomy = new Map<string, WPTermTaxonomy>();
const termRelationships = new Map<string, string[]>(); // post_id -> term_taxonomy_ids

/**
 * Parse SQL INSERT statement and extract values
 */
function parseInsertStatement(sql: string, tableName: string): any[] | null {
  // Match INSERT INTO statements
  const pattern = 'INSERT INTO `' + tableName + '` VALUES ([\\s\\S]+?);';
  const insertRegex = new RegExp(pattern, 'gi');

  const match = insertRegex.exec(sql);
  if (!match) return null;

  const valuesStr = match[1];
  const rows: any[] = [];

  // Parse each row
  let depth = 0;
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];
    const nextChar = valuesStr[i + 1];

    // Handle string escapes
    if (char === '\\' && inString) {
      current += char + nextChar;
      i++;
      continue;
    }

    // Handle string boundaries
    if ((char === "'" || char === '"') && (i === 0 || valuesStr[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
      current += char;
      continue;
    }

    if (inString) {
      current += char;
      continue;
    }

    // Handle parentheses
    if (char === '(') {
      depth++;
      current += char;
    } else if (char === ')') {
      depth--;
      current += char;
      if (depth === 0) {
        // End of row
        rows.push(parseRow(current.trim()));
        current = '';
        // Skip comma
        if (nextChar === ',') i++;
      }
    } else {
      current += char;
    }
  }

  return rows;
}

/**
 * Parse a single row of values
 */
function parseRow(row: string): string[] {
  // Remove outer parentheses
  row = row.replace(/^\(|\)$/g, '');

  const values: string[] = [];
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];

    if (char === '\\' && inString) {
      current += char + nextChar;
      i++;
      continue;
    }

    if ((char === "'" || char === '"') && (i === 0 || row[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
      current += char;
      continue;
    }

    if (inString) {
      current += char;
      continue;
    }

    if (char === ',') {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    values.push(current.trim());
  }

  // Clean up values (remove quotes, unescape)
  return values.map(v => {
    if ((v.startsWith("'") && v.endsWith("'")) ||
        (v.startsWith('"') && v.endsWith('"'))) {
      v = v.slice(1, -1);
    }
    // Unescape SQL strings
    return v
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\\\/g, '\\');
  });
}

/**
 * Convert HTML to Markdown
 */
function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let markdown = html;

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

  // Links
  markdown = markdown.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Images
  markdown = markdown.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '![$2]($1)');
  markdown = markdown.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, '![]($1)');

  // Unordered lists
  markdown = markdown.replace(/<ul[^>]*>/gi, '');
  markdown = markdown.replace(/<\/ul>/gi, '\n');
  markdown = markdown.replace(/<li[^>]*>/gi, '- ');
  markdown = markdown.replace(/<\/li>/gi, '\n');

  // Ordered lists
  markdown = markdown.replace(/<ol[^>]*>/gi, '');
  markdown = markdown.replace(/<\/ol>/gi, '\n');
  markdown = markdown.replace(/<li[^>]*>/gi, '1. ');
  markdown = markdown.replace(/<\/li>/gi, '\n');

  // Paragraphs
  markdown = markdown.replace(/<p[^>]*>/gi, '');
  markdown = markdown.replace(/<\/p>/gi, '\n\n');

  // Line breaks
  markdown = markdown.replace(/<br[^>]*>/gi, '\n');

  // Blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>/gi, '\n> ');
  markdown = markdown.replace(/<\/blockquote>/gi, '\n\n');

  // Code blocks
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>/gi, '```\n');
  markdown = markdown.replace(/<\/code><\/pre>/gi, '\n```\n');
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Divs and spans (remove but keep content)
  markdown = markdown.replace(/<(div|span)[^>]*>/gi, '');
  markdown = markdown.replace(/<\/(div|span)>/gi, '');

  // Clean up excessive whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n');

  return markdown.trim();
}

/**
 * Convert WordPress image URLs to local paths
 */
function convertImageUrl(url: string): string {
  if (!url) return '';

  // Convert WordPress uploads URL to local path
  return url.replace(
    /https?:\/\/resh\.community\/wp-content\/uploads\//g,
    '/uploads/'
  );
}

/**
 * Export posts to MDX files
 */
function exportPosts() {
  const postsDir = path.join(CONTENT_DIR, 'posts');
  const pagesDir = path.join(CONTENT_DIR, 'posts');

  // Create directories
  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
  if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });

  let exportedPosts = 0;
  let exportedPages = 0;

  for (const [id, post] of posts) {
    // Skip drafts, revisions, attachments
    if (post.post_status !== 'publish') continue;
    if (post.post_type === 'revision' || post.post_type === 'attachment') continue;

    // Get post metadata
    const metadata = postMeta.get(id) || [];

    // Extract metadata
    const meta = {
      featuredImage: '',
      seoTitle: '',
      seoDescription: '',
      canonical: '',
      ogImage: '',
      ogTitle: '',
      ogDescription: '',
    };

    for (const m of metadata) {
      if (m.meta_key === '_thumbnail_id') {
        // Look up the attachment post to get the actual image URL
        const attachmentPost = posts.get(m.meta_value);
        if (attachmentPost && attachmentPost.post_type === 'attachment') {
          // Convert WordPress URL to local path
          meta.featuredImage = convertImageUrl(attachmentPost.guid);
        }
      } else if (m.meta_key === '_yoast_wpseo_title') {
        meta.seoTitle = m.meta_value;
      } else if (m.meta_key === '_yoast_wpseo_metadesc') {
        meta.seoDescription = m.meta_value;
      } else if (m.meta_key === '_yoast_wpseo_canonical') {
        meta.canonical = m.meta_value;
      } else if (m.meta_key === '_yoast_wpseo_opengraph-image') {
        meta.ogImage = m.meta_value;
      } else if (m.meta_key === '_yoast_wpseo_opengraph-title') {
        meta.ogTitle = m.meta_value;
      } else if (m.meta_key === '_yoast_wpseo_opengraph-description') {
        meta.ogDescription = m.meta_value;
      }
    }

    // Get categories and tags
    const termTaxIds = termRelationships.get(id) || [];
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

    // Convert content
    const content = htmlToMarkdown(post.post_content);
    const excerpt = post.post_excerpt ? htmlToMarkdown(post.post_excerpt) : '';

    // Generate frontmatter
    const frontmatter = {
      title: post.post_title,
      date: post.post_date,
      slug: post.post_name,
      excerpt: excerpt,
      categories: categories,
      tags: tags,
      featuredImage: meta.featuredImage || undefined,
      seo: {
        title: meta.seoTitle || undefined,
        description: meta.seoDescription || undefined,
        canonical: meta.canonical || undefined,
      },
      openGraph: {
        image: meta.ogImage || undefined,
        title: meta.ogTitle || undefined,
        description: meta.ogDescription || undefined,
      },
    };

    // Write MDX file
    const dir = post.post_type === 'page' ? pagesDir : postsDir;
    const filename = `${post.post_name}.mdx`;
    const filepath = path.join(dir, filename);

    const mdx = `---
title: "${frontmatter.title.replace(/"/g, '\\"')}"
date: "${frontmatter.date}"
slug: "${frontmatter.slug}"
${frontmatter.excerpt ? `excerpt: "${frontmatter.excerpt.replace(/"/g, '\\"')}"` : ''}
${frontmatter.categories.length ? `categories: [${frontmatter.categories.map(c => `"${c}"`).join(', ')}]` : ''}
${frontmatter.tags.length ? `tags: [${frontmatter.tags.map(t => `"${t}"`).join(', ')}]` : ''}
${frontmatter.featuredImage ? `featuredImage: "${frontmatter.featuredImage}"` : ''}
${frontmatter.seo.title ? `seoTitle: "${frontmatter.seo.title.replace(/"/g, '\\"')}"` : ''}
${frontmatter.seo.description ? `seoDescription: "${frontmatter.seo.description.replace(/"/g, '\\"')}"` : ''}
${frontmatter.seo.canonical ? `canonical: "${frontmatter.seo.canonical}"` : ''}
${frontmatter.openGraph.image ? `ogImage: "${frontmatter.openGraph.image}"` : ''}
${frontmatter.openGraph.title ? `ogTitle: "${frontmatter.openGraph.title.replace(/"/g, '\\"')}"` : ''}
${frontmatter.openGraph.description ? `ogDescription: "${frontmatter.openGraph.description.replace(/"/g, '\\"')}"` : ''}
---

${content}
`;

    fs.writeFileSync(filepath, mdx);

    if (post.post_type === 'post') {
      exportedPosts++;
    } else {
      exportedPages++;
    }
  }

  console.log(`✓ Exported ${exportedPosts} posts`);
  console.log(`✓ Exported ${exportedPages} pages`);
}

/**
 * Export categories and tags to JSON
 */
function exportTaxonomies() {
  const categories: any[] = [];
  const tags: any[] = [];

  for (const [id, tt] of termTaxonomy) {
    const term = terms.get(id);
    if (!term) continue;

    if (tt.taxonomy === 'category') {
      categories.push({
        id: term.term_id,
        name: term.name,
        slug: term.slug,
        description: term.description,
        count: tt.count,
      });
    } else if (tt.taxonomy === 'post_tag') {
      tags.push({
        id: term.term_id,
        name: term.name,
        slug: term.slug,
        description: term.description,
        count: tt.count,
      });
    }
  }

  // Sort by name
  categories.sort((a, b) => a.name.localeCompare(b.name));
  tags.sort((a, b) => a.name.localeCompare(b.name));

  // Write to files
  fs.writeFileSync(
    path.join(CONTENT_DIR, 'categories.json'),
    JSON.stringify(categories, null, 2)
  );

  fs.writeFileSync(
    path.join(CONTENT_DIR, 'tags.json'),
    JSON.stringify(tags, null, 2)
  );

  console.log(`✓ Exported ${categories.length} categories`);
  console.log(`✓ Exported ${tags.length} tags`);
}

/**
 * Main export function
 */
async function exportWordPress() {
  console.log('Starting WordPress export...\n');

  // Read database.sql
  console.log('Reading database.sql...');
  const sqlContent = fs.readFileSync(DB_PATH, 'utf-8');
  console.log(`✓ Loaded ${sqlContent.length} bytes\n`);

  // Parse wp_posts
  console.log('Parsing wp_posts...');
  const postsData = parseInsertStatement(sqlContent, 'wp_posts');
  if (postsData) {
    for (const row of postsData) {
      const post: WPPost = {
        ID: row[0],
        guid: row[2],
        post_title: row[5],
        post_content: row[6],
        post_excerpt: row[7],
        post_date: row[8],
        post_name: row[12],
        post_type: row[20],
        post_status: row[21],
      };
      posts.set(post.ID, post);
    }
    console.log(`✓ Found ${posts.size} posts\n`);
  }

  // Parse wp_postmeta
  console.log('Parsing wp_postmeta...');
  const postmetaData = parseInsertStatement(sqlContent, 'wp_postmeta');
  if (postmetaData) {
    for (const row of postmetaData) {
      const meta: WPPostMeta = {
        post_id: row[1],
        meta_key: row[2],
        meta_value: row[3],
      };
      if (!postMeta.has(meta.post_id)) {
        postMeta.set(meta.post_id, []);
      }
      postMeta.get(meta.post_id)!.push(meta);
    }
    console.log(`✓ Found ${postmetaData?.length || 0} postmeta entries\n`);
  }

  // Parse wp_terms
  console.log('Parsing wp_terms...');
  const termsData = parseInsertStatement(sqlContent, 'wp_terms');
  if (termsData) {
    for (const row of termsData) {
      const term: WPTerm = {
        term_id: row[0],
        name: row[2],
        slug: row[3],
        description: row[4],
      };
      terms.set(term.term_id, term);
    }
    console.log(`✓ Found ${terms.size} terms\n`);
  }

  // Parse wp_term_taxonomy
  console.log('Parsing wp_term_taxonomy...');
  const termTaxData = parseInsertStatement(sqlContent, 'wp_term_taxonomy');
  if (termTaxData) {
    for (const row of termTaxData) {
      const tt: WPTermTaxonomy = {
        term_id: row[2],
        taxonomy: row[4],
        description: row[5],
        count: parseInt(row[7], 10),
      };
      termTaxonomy.set(row[0], tt);
    }
    console.log(`✓ Found ${termTaxData?.length || 0} taxonomies\n`);
  }

  // Parse wp_term_relationships
  console.log('Parsing wp_term_relationships...');
  const relData = parseInsertStatement(sqlContent, 'wp_term_relationships');
  if (relData) {
    for (const row of relData) {
      const rel: WPTermRelationship = {
        object_id: row[1],
        term_taxonomy_id: row[2],
      };
      if (!termRelationships.has(rel.object_id)) {
        termRelationships.set(rel.object_id, []);
      }
      termRelationships.get(rel.object_id)!.push(rel.term_taxonomy_id);
    }
    console.log(`✓ Found ${relData?.length || 0} relationships\n`);
  }

  // Export content
  console.log('\nExporting content...\n');
  exportPosts();
  exportTaxonomies();

  console.log('\n✓ Export complete!');
}

// Run export
exportWordPress().catch(console.error);
