#!/usr/bin/env node

/**
 * WordPress to TinaCMS Migration Script
 *
 * This script migrates content from a WordPress SQL dump to TinaCMS format.
 * It handles:
 * - Posts and pages
 * - Categories and tags
 * - Featured images and media
 * - Post metadata (excerpt, author, dates, etc.)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // Paths
  wordpressBackupPath: path.resolve(process.env.HOME, 'Desktop/All Desktop/Themes/blogar-blog-magazine-wordpress-theme/resh/backup-resh.community-20221217-dtspppmaiqspumuq'),
  tinaProjectPath: path.resolve(process.env.HOME, 'Desktop/resh-community'),
  databaseFile: 'database.sql',
  wordpressUploadsPath: 'wp-content/uploads',
  tinaUploadsPath: 'public/uploads',

  // Content settings
  defaultAuthor: 'Resh Community',
  defaultCategory: 'News',
  readingTimeWpm: 200, // Words per minute for reading time calculation
};

// WordPress post types
const POST_TYPES = {
  POST: 'post',
  PAGE: 'page',
  ATTACHMENT: 'attachment',
  REVISION: 'revision',
};

// WordPress post statuses
const POST_STATUS = {
  PUBLISH: 'publish',
  DRAFT: 'draft',
  FUTURE: 'future',
  INHERIT: 'inherit',
};

/**
 * Parse SQL value string, handling escaped quotes
 */
function parseSQLValue(str) {
  if (!str) return '';
  // Remove surrounding quotes if present
  if (str.startsWith("'") && str.endsWith("'")) {
    str = str.slice(1, -1);
  }
  // Unescape SQL characters
  return str
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\\\/g, '\\');
}

/**
 * Parse SQL INSERT VALUES into array of arrays
 * Handles complex SQL with escaped quotes and multi-line content
 */
function parseSQLValues(sqlText) {
  const values = [];
  let current = '';
  let inString = false;
  let escapeNext = false;
  let parenDepth = 0;
  let valueStart = false;

  for (let i = 0; i < sqlText.length; i++) {
    const char = sqlText[i];
    const nextChar = sqlText[i + 1];

    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      current += char;
      continue;
    }

    if (char === "'") {
      inString = !inString;
      current += char;
      continue;
    }

    if (inString) {
      current += char;
      continue;
    }

    if (char === '(') {
      parenDepth++;
      if (parenDepth === 1) {
        valueStart = true;
        current = '';
      }
      current += char;
      continue;
    }

    if (char === ')') {
      parenDepth--;
      current += char;
      if (parenDepth === 0) {
        // Found a complete value tuple
        const tuple = current.substring(1, current.length - 1); // Remove outer parens
        const parts = splitSQLTuple(tuple);
        values.push(parts);
        current = '';
        valueStart = false;
      }
      continue;
    }

    if (valueStart) {
      current += char;
    }
  }

  return values;
}

/**
 * Split SQL tuple into individual values
 */
function splitSQLTuple(tuple) {
  const values = [];
  let current = '';
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < tuple.length; i++) {
    const char = tuple[i];

    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      current += char;
      continue;
    }

    if (char === "'") {
      inString = !inString;
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
      continue;
    }

    // Handle NULL
    if (char === 'N' && tuple.substring(i, i + 4) === 'NULL') {
      values.push('NULL');
      current = '';
      i += 3;
      continue;
    }

    // Skip whitespace outside strings
    if (!/\s/.test(char) || current.length > 0) {
      current += char;
    }
  }

  if (current.trim() || current === '') {
    values.push(current.trim());
  }

  return values;
}

/**
 * Parse WordPress SQL dump file and extract data
 */
function parseWordPressSQL(sqlContent) {
  console.log('Parsing WordPress SQL dump...');

  const data = {
    posts: [],
    postmeta: {},
    terms: [],
    termTaxonomy: {},
    termRelationships: {},
  };

  // Parse wp_posts
  const postsMatch = sqlContent.match(/INSERT INTO `wp_posts` VALUES ([\s\S]+?);\n/);
  if (postsMatch) {
    const rows = parseSQLValues(postsMatch[1]);
    console.log(`  Found ${rows.length} wp_posts rows`);

    for (const row of rows) {
      if (row.length < 20) continue;

      const post = {
        id: row[0],
        author: parseSQLValue(row[1]),
        date: parseSQLValue(row[2]),
        dateGmt: parseSQLValue(row[3]),
        content: parseSQLValue(row[4]),
        title: parseSQLValue(row[5]),
        excerpt: parseSQLValue(row[6]),
        status: parseSQLValue(row[7]),
        commentStatus: parseSQLValue(row[8]),
        pingStatus: parseSQLValue(row[9]),
        password: parseSQLValue(row[10]),
        name: parseSQLValue(row[11]), // slug (post_name)
        modified: parseSQLValue(row[14]),
        modifiedGmt: parseSQLValue(row[15]),
        parent: parseSQLValue(row[17]),
        guid: parseSQLValue(row[18]),
        menuOrder: parseSQLValue(row[19]),
        type: parseSQLValue(row[20]), // post_type is at index 20
        mimeType: parseSQLValue(row[21]),
        commentCount: parseSQLValue(row[22]),
      };
      data.posts.push(post);
    }
  }

  // Parse wp_postmeta
  const postmetaMatch = sqlContent.match(/INSERT INTO `wp_postmeta` VALUES ([\s\S]+?);\n/);
  if (postmetaMatch) {
    const rows = parseSQLValues(postmetaMatch[1]);
    console.log(`  Found ${rows.length} wp_postmeta rows`);

    for (const row of rows) {
      if (row.length < 4) continue;

      const metaId = row[0];
      const postId = parseSQLValue(row[1]);
      const metaKey = parseSQLValue(row[2]);
      const metaValue = parseSQLValue(row[3]);

      if (!data.postmeta[postId]) {
        data.postmeta[postId] = {};
      }
      data.postmeta[postId][metaKey] = metaValue;
    }
  }

  // Parse wp_terms
  const termsMatch = sqlContent.match(/INSERT INTO `wp_terms` VALUES ([\s\S]+?);\n/);
  if (termsMatch) {
    const rows = parseSQLValues(termsMatch[1]);
    console.log(`  Found ${rows.length} wp_terms rows`);

    for (const row of rows) {
      if (row.length < 4) continue;

      data.terms.push({
        id: row[0],
        name: parseSQLValue(row[1]),
        slug: parseSQLValue(row[2]),
        group: parseSQLValue(row[3]),
      });
    }
  }

  // Parse wp_term_taxonomy
  const taxonomyMatch = sqlContent.match(/INSERT INTO `wp_term_taxonomy` VALUES ([\s\S]+?);\n/);
  if (taxonomyMatch) {
    const rows = parseSQLValues(taxonomyMatch[1]);
    console.log(`  Found ${rows.length} wp_term_taxonomy rows`);

    for (const row of rows) {
      if (row.length < 6) continue;

      const termId = row[1];
      data.termTaxonomy[termId] = {
        taxonomyId: row[0],
        termId: termId,
        taxonomy: parseSQLValue(row[2]),
        description: parseSQLValue(row[3]),
        parent: parseSQLValue(row[4]),
        count: parseSQLValue(row[5]),
      };
    }
  }

  // Parse wp_term_relationships
  const relationshipsMatch = sqlContent.match(/INSERT INTO `wp_term_relationships` VALUES ([\s\S]+?);\n/);
  if (relationshipsMatch) {
    const rows = parseSQLValues(relationshipsMatch[1]);
    console.log(`  Found ${rows.length} wp_term_relationships rows`);

    for (const row of rows) {
      if (row.length < 3) continue;

      const postId = row[0];
      const termTaxonomyId = row[1];

      if (!data.termRelationships[postId]) {
        data.termRelationships[postId] = [];
      }
      data.termRelationships[postId].push(termTaxonomyId);
    }
  }

  console.log(`  - Parsed ${data.posts.length} posts/pages`);
  console.log(`  - Parsed ${data.terms.length} terms`);
  console.log(`  - Parsed ${Object.keys(data.postmeta).length} posts with metadata`);

  return data;
}

/**
 * Get categories for a post
 */
function getPostCategories(postId, termRelationships, termTaxonomy, terms) {
  const relationships = termRelationships[postId] || [];
  const categories = [];

  for (const taxonomyId of relationships) {
    const taxonomy = Object.values(termTaxonomy).find(t => t.taxonomyId === taxonomyId);
    if (taxonomy && taxonomy.taxonomy === 'category') {
      const term = terms.find(t => t.id === taxonomy.termId);
      if (term && term.name !== 'Uncategorized') {
        categories.push({
          id: term.id,
          name: term.name,
          slug: term.slug,
        });
      }
    }
  }

  return categories;
}

/**
 * Get tags for a post
 */
function getPostTags(postId, termRelationships, termTaxonomy, terms) {
  const relationships = termRelationships[postId] || [];
  const tags = [];

  for (const taxonomyId of relationships) {
    const taxonomy = Object.values(termTaxonomy).find(t => t.taxonomyId === taxonomyId);
    if (taxonomy && taxonomy.taxonomy === 'post_tag') {
      const term = terms.find(t => t.id === taxonomy.termId);
      if (term) {
        tags.push({
          id: term.id,
          name: term.name,
          slug: term.slug,
        });
      }
    }
  }

  return tags;
}

/**
 * Get featured image for a post
 */
function getFeaturedImage(postId, postmeta, posts) {
  const metaThumbnailId = postmeta[postId]?.['_thumbnail_id'];
  if (!metaThumbnailId) return null;

  const attachmentPost = posts.find(p => p.id === metaThumbnailId && p.type === POST_TYPES.ATTACHMENT);
  if (!attachmentPost) return null;

  // Check for custom meta fields
  const metaFile = postmeta[metaThumbnailId]?.['_wp_attached_file'];
  const guid = attachmentPost.guid;

  return {
    id: metaThumbnailId,
    url: guid,
    path: metaFile || guid,
    alt: postmeta[metaThumbnailId]?.['_wp_attachment_image_alt'] || '',
  };
}

/**
 * Convert WordPress content to MDX format
 * Handles Gutenberg blocks and HTML conversion
 */
function convertToMDX(content) {
  if (!content) return '';

  let mdx = content;

  // Handle Gutenberg blocks - remove wp: comments
  mdx = mdx.replace(/<!--\s*wp:[^>]*-->/gi, '');
  mdx = mdx.replace(/<!--\/wp:[^>]*-->/gi, '');

  // Convert basic HTML to Markdown
  // Headers
  mdx = mdx.replace(/<h1[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/h1>/gi, '# $1\n\n');
  mdx = mdx.replace(/<h2[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/h2>/gi, '## $1\n\n');
  mdx = mdx.replace(/<h3[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/h3>/gi, '### $1\n\n');
  mdx = mdx.replace(/<h4[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/h4>/gi, '#### $1\n\n');
  mdx = mdx.replace(/<h5[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/h5>/gi, '##### $1\n\n');
  mdx = mdx.replace(/<h6[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/h6>/gi, '###### $1\n\n');

  // Bold and italic
  mdx = mdx.replace(/<strong[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/strong>/gi, '**$1**');
  mdx = mdx.replace(/<b[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/b>/gi, '**$1**');
  mdx = mdx.replace(/<em[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/em>/gi, '*$1*');
  mdx = mdx.replace(/<i[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/i>/gi, '*$1*');

  // Links
  mdx = mdx.replace(/<a\s+href="([^"]+)"[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/a>/gi, '[$2]($1)');

  // Images
  mdx = mdx.replace(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
  mdx = mdx.replace(/<img[^>]+src="([^"]+)"[^>]*>/gi, '![]($1)');

  // Paragraphs
  mdx = mdx.replace(/<p[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/p>/gi, '$1\n\n');

  // Line breaks
  mdx = mdx.replace(/<br\s*\/?>/gi, '\n');

  // Lists
  mdx = mdx.replace(/<ul[^>]*>/gi, '');
  mdx = mdx.replace(/<\/ul>/gi, '\n');
  mdx = mdx.replace(/<ol[^>]*>/gi, '');
  mdx = mdx.replace(/<\/ol>/gi, '\n');
  mdx = mdx.replace(/<li[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/li>/gi, '- $1\n');

  // Blockquotes
  mdx = mdx.replace(/<blockquote[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/blockquote>/gi, '> $1\n\n');

  // Code blocks
  mdx = mdx.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, code) => {
    return '```\n' + code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') + '\n```\n\n';
  });
  mdx = mdx.replace(/<code[^>]*>([^<]+)<\/code>/gi, '`$1`');

  // Divs and spans (remove tags, keep content)
  mdx = mdx.replace(/<(div|span)[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/\1>/gi, '$2');

  // Remove remaining HTML tags
  mdx = mdx.replace(/<[^>]+>/g, '');

  // Clean up multiple newlines
  mdx = mdx.replace(/\n{3,}/g, '\n\n');

  // Decode HTML entities
  mdx = mdx.replace(/&nbsp;/g, ' ');
  mdx = mdx.replace(/&amp;/g, '&');
  mdx = mdx.replace(/&lt;/g, '<');
  mdx = mdx.replace(/&gt;/g, '>');
  mdx = mdx.replace(/&quot;/g, '"');
  mdx = mdx.replace(/&#39;/g, "'");
  mdx = mdx.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));

  return mdx.trim();
}

/**
 * Calculate reading time in minutes
 */
function calculateReadingTime(content) {
  if (!content) return 0;

  // Remove HTML tags and count words
  const text = content.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const minutes = Math.max(1, Math.ceil(words / CONFIG.readingTimeWpm));

  return minutes;
}

/**
 * Create a slug from a title
 */
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Migrate WordPress data to TinaCMS format
 */
function migrateToTinaCMS(data) {
  console.log('\nMigrating content to TinaCMS...');

  const tinaPostsPath = path.join(CONFIG.tinaProjectPath, 'content/posts');
  const tinaPagesPath = path.join(CONFIG.tinaProjectPath, 'content/pages');
  const tinaUploadsPath = path.join(CONFIG.tinaProjectPath, 'public/uploads');

  // Ensure directories exist
  fs.mkdirSync(tinaPostsPath, { recursive: true });
  fs.mkdirSync(tinaPagesPath, { recursive: true });
  fs.mkdirSync(tinaUploadsPath, { recursive: true });

  const postsIndex = [];
  const pagesIndex = [];
  const categoriesMap = new Map();
  const tagsMap = new Map();

  // Process posts - filter out revisions and attachments
  const posts = data.posts.filter(p =>
    p.type === POST_TYPES.POST &&
    p.status === POST_STATUS.PUBLISH
  );

  const pages = data.posts.filter(p =>
    p.type === POST_TYPES.PAGE &&
    p.status !== POST_STATUS.INHERIT
  );

  console.log(`\nProcessing ${posts.length} published posts...`);

  for (const post of posts) {
    const categories = getPostCategories(post.id, data.termRelationships, data.termTaxonomy, data.terms);
    const tags = getPostTags(post.id, data.termRelationships, data.termTaxonomy, data.terms);
    const featuredImage = getFeaturedImage(post.id, data.postmeta, data.posts);

    // Track categories and tags
    for (const cat of categories) {
      categoriesMap.set(cat.id, cat);
    }
    for (const tag of tags) {
      tagsMap.set(tag.id, tag);
    }

    // Get primary category (first one or default)
    const primaryCategory = categories.length > 0 ? categories[0].name : CONFIG.defaultCategory;

    // Convert content to MDX
    const mdxContent = convertToMDX(post.content);

    // Calculate reading time
    const readingTime = calculateReadingTime(post.content);

    // Generate slug if missing
    const slug = post.name || createSlug(post.title);

    // Create MDX file
    const mdxFilePath = path.join(tinaPostsPath, `${slug}.mdx`);

    const frontmatter = {
      title: post.title,
      slug: slug,
      date: post.date.replace(' ', 'T') + ':00Z',
      modified: post.modified.replace(' ', 'T') + ':00Z',
      excerpt: post.excerpt || '',
      author: CONFIG.defaultAuthor,
      author_id: post.author,
      category: primaryCategory,
      categories: categories.map(c => c.name).join(','),
      tags: tags.map(t => t.name).join(','),
      featured_image: featuredImage ? `/uploads/${featuredImage.path}` : '',
      reading_time: readingTime,
      status: post.status,
      format: 'standard',
      seo: {
        title: '',
        canonical: '',
      },
    };

    // Get SEO meta
    if (data.postmeta[post.id]) {
      const meta = data.postmeta[post.id];
      if (meta['_yoast_wpseo_title']) {
        frontmatter.seo.title = meta['_yoast_wpseo_title'];
      }
      if (meta['_yoast_wpseo_metadesc']) {
        frontmatter.seo.description = meta['_yoast_wpseo_metadesc'];
      }
      if (meta['_yoast_wpseo_canonical']) {
        frontmatter.seo.canonical = meta['_yoast_wpseo_canonical'];
      }
    }

    const frontmatterString = '---\n' + Object.entries(frontmatter)
      .map(([key, value]) => {
        if (typeof value === 'object') {
          const inner = Object.entries(value).map(([k, v]) => `  ${k}: "${v}"`).join('\n');
          return `${key}:\n${inner}`;
        }
        return `${key}: "${value}"`;
      })
      .join('\n') + '\n---\n\n';

    fs.writeFileSync(mdxFilePath, frontmatterString + mdxContent);

    postsIndex.push({
      id: post.id,
      title: post.title,
      slug: slug,
      type: 'post',
      date: frontmatter.date,
      excerpt: frontmatter.excerpt || post.excerpt,
      content: mdxContent.substring(0, 500) + (mdxContent.length > 500 ? '...' : ''),
      featured_image: frontmatter.featured_image,
    });

    console.log(`  ✓ Migrated post: ${post.title}`);
  }

  // Process pages
  console.log(`\nProcessing ${pages.length} pages...`);

  for (const page of pages) {
    const featuredImage = getFeaturedImage(page.id, data.postmeta, data.posts);

    // Convert content to MDX
    const mdxContent = convertToMDX(page.content);

    // Calculate reading time
    const readingTime = calculateReadingTime(page.content);

    // Generate slug if missing
    const slug = page.name || createSlug(page.title);

    // Create MDX file
    const mdxFilePath = path.join(tinaPagesPath, `${slug}.mdx`);

    const frontmatter = {
      title: page.title,
      slug: slug,
      date: page.date.replace(' ', 'T') + ':00Z',
      excerpt: page.excerpt || '',
      author: CONFIG.defaultAuthor,
      featured_image: featuredImage ? `/uploads/${featuredImage.path}` : '',
      reading_time: readingTime,
      status: page.status === POST_STATUS.PUBLISH ? 'publish' : 'draft',
    };

    const frontmatterString = '---\n' + Object.entries(frontmatter)
      .map(([key, value]) => `${key}: "${value}"`)
      .join('\n') + '\n---\n\n';

    fs.writeFileSync(mdxFilePath, frontmatterString + mdxContent);

    pagesIndex.push({
      id: page.id,
      title: page.title,
      slug: slug,
      type: 'page',
      date: frontmatter.date,
      content: mdxContent.substring(0, 500) + (mdxContent.length > 500 ? '...' : ''),
    });

    console.log(`  ✓ Migrated page: ${page.title}`);
  }

  // Write index files
  console.log('\nWriting index files...');

  fs.writeFileSync(
    path.join(CONFIG.tinaProjectPath, 'content/posts.json'),
    JSON.stringify(postsIndex, null, 2)
  );

  fs.writeFileSync(
    path.join(CONFIG.tinaProjectPath, 'content/pages.json'),
    JSON.stringify(pagesIndex, null, 2)
  );

  fs.writeFileSync(
    path.join(CONFIG.tinaProjectPath, 'content/categories.json'),
    JSON.stringify([...categoriesMap.values()], null, 2)
  );

  fs.writeFileSync(
    path.join(CONFIG.tinaProjectPath, 'content/tags.json'),
    JSON.stringify([...tagsMap.values()], null, 2)
  );

  console.log('  ✓ posts.json');
  console.log('  ✓ pages.json');
  console.log('  ✓ categories.json');
  console.log('  ✓ tags.json');

  return {
    postsCount: posts.length,
    pagesCount: pages.length,
    categoriesCount: categoriesMap.size,
    tagsCount: tagsMap.size,
  };
}

/**
 * Copy media files from WordPress to TinaCMS
 */
function copyMediaFiles() {
  console.log('\nCopying media files...');

  const sourcePath = path.join(CONFIG.wordpressBackupPath, CONFIG.wordpressUploadsPath);
  const targetPath = path.join(CONFIG.tinaProjectPath, CONFIG.tinaUploadsPath);

  if (!fs.existsSync(sourcePath)) {
    console.log('  ! Source uploads directory not found, skipping media copy');
    return;
  }

  // Use rsync for efficient copying
  try {
    const cmd = `rsync -av --progress "${sourcePath}/" "${targetPath}/"`;
    console.log(`  Running: ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
    console.log('  ✓ Media files copied');
  } catch (error) {
    console.log('  ! rsync not available, trying alternative copy method');
    // Alternative: recursively copy using fs
    copyDirectoryRecursive(sourcePath, targetPath);
  }
}

/**
 * Recursively copy directory
 */
function copyDirectoryRecursive(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

/**
 * Main migration function
 */
function main() {
  console.log('='.repeat(60));
  console.log('WordPress to TinaCMS Migration');
  console.log('='.repeat(60));

  const databasePath = path.join(CONFIG.wordpressBackupPath, CONFIG.databaseFile);

  if (!fs.existsSync(databasePath)) {
    console.error(`\nError: Database file not found at: ${databasePath}`);
    process.exit(1);
  }

  // Read and parse SQL file
  console.log(`\nReading database from: ${databasePath}`);
  const sqlContent = fs.readFileSync(databasePath, 'utf8');
  const data = parseWordPressSQL(sqlContent);

  // Copy media files
  copyMediaFiles();

  // Migrate content to TinaCMS
  const stats = migrateToTinaCMS(data);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Migration Complete!');
  console.log('='.repeat(60));
  console.log(`Posts migrated:    ${stats.postsCount}`);
  console.log(`Pages migrated:    ${stats.pagesCount}`);
  console.log(`Categories:        ${stats.categoriesCount}`);
  console.log(`Tags:              ${stats.tagsCount}`);
  console.log('='.repeat(60));
  console.log('\nNext steps:');
  console.log('1. Review the migrated content in the content/ directory');
  console.log('2. Verify media files in public/uploads/');
  console.log('3. Update the TinaCMS schema if needed (tina/config.ts)');
  console.log('4. Run your TinaCMS dev server to preview');
  console.log('5. Make any manual adjustments to content formatting');
}

// Run the migration
if (require.main === module) {
  main();
}

module.exports = {
  parseWordPressSQL,
  convertToMDX,
  migrateToTinaCMS,
  copyMediaFiles,
};
