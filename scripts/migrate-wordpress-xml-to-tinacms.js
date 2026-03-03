#!/usr/bin/env node

/**
 * WordPress XML Export to TinaCMS Migration Script
 *
 * This script migrates content from a WordPress XML export (WXR format)
 * to TinaCMS format. It handles:
 * - Posts and pages
 * - Categories and tags
 * - Featured images and media attachments
 * - Post metadata (excerpt, author, dates, etc.)
 *
 * Usage:
 *   node scripts/migrate-wordpress-xml-to-tinacms.js <path-to-wordpress-export.xml>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { XMLParser } = require('fast-xml-parser');

// Configuration
const CONFIG = {
  tinaProjectPath: path.resolve(process.env.HOME, 'Desktop/resh-community'),
  defaultAuthor: 'Resh Community',
  defaultCategory: 'News',
  readingTimeWpm: 200,
};

// WordPress post types
const POST_TYPES = {
  POST: 'post',
  PAGE: 'page',
  ATTACHMENT: 'attachment',
};

// WordPress post statuses
const POST_STATUS = {
  PUBLISH: 'publish',
  DRAFT: 'draft',
  FUTURE: 'future',
  PENDING: 'pending',
  PRIVATE: 'private',
};

/**
 * Parse WordPress XML export file
 */
function parseWordPressXML(xmlContent) {
  console.log('Parsing WordPress XML export...');

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    parseAttributeValue: true,
    parseTagValue: true,
    trimValues: true,
    cdataPropName: '__cdata',
  });

  const result = parser.parse(xmlContent);
  const rss = result.rss;

  if (!rss) {
    throw new Error('Invalid WordPress XML export format');
  }

  const wpChannel = rss.channel;
  const data = {
    posts: [],
    categories: [],
    tags: [],
    authors: [],
    attachments: [],
  };

  // Extract items (posts, pages, attachments)
  if (wpChannel.item) {
    const items = Array.isArray(wpChannel.item) ? wpChannel.item : [wpChannel.item];

    for (const item of items) {
      const postType = item['wp:post_type'];
      const postStatus = item['wp:status'];
      const postId = item['wp:post_id'];

      const post = {
        id: postId,
        title: item.title,
        content: item['content:encoded'] || '',
        excerpt: item['excerpt:encoded'] || '',
        date: item['wp:post_date'] || item.pubDate,
        modified: item['wp:post_modified'] || item.pubDate,
        status: postStatus,
        type: postType,
        slug: item['wp:post_name'] || '',
        author: item['dc:creator'] || CONFIG.defaultAuthor,
        guid: item.guid?.__cdata || item.guid || '',
        link: item.link,
        menuOrder: item['wp:menu_order'] || 0,
        parent: item['wp:post_parent'] || '0',
        mimeType: item['wp:post_mime_type'] || '',
        categories: [],
        tags: [],
        featuredImageId: '',
        postmeta: {},
      };

      // Extract postmeta
      if (item['wp:postmeta']) {
        const metaArray = Array.isArray(item['wp:postmeta']) ? item['wp:postmeta'] : [item['wp:postmeta']];
        for (const meta of metaArray) {
          if (!meta) continue;
          const key = meta['wp:meta_key'];
          const value = meta['wp:meta_value'];
          if (key && value !== undefined) {
            post.postmeta[key] = value;
          }
        }
      }

      // Handle featured image from postmeta
      const thumbnailMeta = post.postmeta['_thumbnail_id'];
      if (thumbnailMeta) {
        post.featuredImageId = thumbnailMeta;
      }

      // Extract categories and tags
      if (item.category) {
        const categories = Array.isArray(item.category) ? item.category : [item.category];
        for (const cat of categories) {
          const domain = cat['@_domain'];
          const nicename = cat['@_nicename'];
          const name = cat.__cdata || cat['#text'] || cat;

          if (domain === 'category') {
            post.categories.push({ id: nicename, slug: nicename, name: name });
          } else if (domain === 'post_tag') {
            post.tags.push({ id: nicename, slug: nicename, name: name });
          }
        }
      }

      // Extract attachment URL and metadata
      if (postType === POST_TYPES.ATTACHMENT) {
        post.attachmentUrl = item['wp:attachment_url'] || post.guid;
        data.attachments.push(post);
      }

      data.posts.push(post);
    }
  }

  // Extract categories from channel
  if (wpChannel['wp:category']) {
    const categories = Array.isArray(wpChannel['wp:category']) ? wpChannel['wp:category'] : [wpChannel['wp:category']];
    for (const cat of categories) {
      data.categories.push({
        id: cat['wp:category_nicename'],
        slug: cat['wp:category_nicename'],
        name: cat['wp:cat_name']?.__cdata || cat['wp:cat_name'] || '',
        parent: cat['wp:category_parent'] || '',
      });
    }
  }

  // Extract tags from channel
  if (wpChannel['wp:tag']) {
    const tags = Array.isArray(wpChannel['wp:tag']) ? wpChannel['wp:tag'] : [wpChannel['wp:tag']];
    for (const tag of tags) {
      data.tags.push({
        id: tag['wp:tag_slug'],
        slug: tag['wp:tag_slug'],
        name: tag['wp:tag_name']?.__cdata || tag['wp:tag_name'] || '',
      });
    }
  }

  // Extract authors
  if (wpChannel['wp:author']) {
    const authors = Array.isArray(wpChannel['wp:author']) ? wpChannel['wp:author'] : [wpChannel['wp:author']];
    for (const author of authors) {
      data.authors.push({
        id: author['wp:author_id'],
        login: author['wp:author_login'],
        email: author['wp:author_email'],
        displayName: author['wp:author_display_name']?.__cdata || author['wp:author_display_name'] || '',
        firstName: author['wp:author_first_name'],
        lastName: author['wp:author_last_name'],
      });
    }
  }

  console.log(`  - Found ${data.posts.length} items (posts, pages, attachments)`);
  console.log(`  - Found ${data.categories.length} categories`);
  console.log(`  - Found ${data.tags.length} tags`);
  console.log(`  - Found ${data.authors.length} authors`);
  console.log(`  - Found ${data.attachments.length} attachments`);

  return data;
}

/**
 * Find attachment by ID
 */
function findAttachment(attachmentId, attachments) {
  return attachments.find(a => a.id === attachmentId);
}

/**
 * Get featured image for a post
 */
function getFeaturedImage(post, attachments) {
  const featuredImageId = post.featuredImageId || post.postmeta['_thumbnail_id'];
  if (!featuredImageId) return null;

  const attachment = findAttachment(featuredImageId, attachments);
  if (!attachment) return null;

  // Extract path from attachment URL
  const url = attachment.attachmentUrl;
  const pathMatch = url.match(/uploads\/(.+)$/);

  return {
    id: featuredImageId,
    url: url,
    path: pathMatch ? pathMatch[1] : url,
    alt: post.postmeta['_wp_attachment_image_alt'] || '',
  };
}

/**
 * Convert WordPress content to MDX format
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

  const text = content.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  return Math.max(1, Math.ceil(words / CONFIG.readingTimeWpm));
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
 * Format date for frontmatter
 */
function formatDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  const date = new Date(dateStr);
  return date.toISOString();
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

  // Filter posts and pages
  const posts = data.posts.filter(p =>
    p.type === POST_TYPES.POST &&
    [POST_STATUS.PUBLISH, POST_STATUS.DRAFT, POST_STATUS.PRIVATE].includes(p.status)
  );

  const pages = data.posts.filter(p =>
    p.type === POST_TYPES.PAGE &&
    [POST_STATUS.PUBLISH, POST_STATUS.DRAFT].includes(p.status)
  );

  console.log(`\nProcessing ${posts.length} posts...`);

  for (const post of posts) {
    // Track categories and tags
    for (const cat of post.categories) {
      categoriesMap.set(cat.id, cat);
    }
    for (const tag of post.tags) {
      tagsMap.set(tag.id, tag);
    }

    // Get primary category
    const primaryCategory = post.categories.length > 0 ? post.categories[0].name : CONFIG.defaultCategory;

    // Convert content to MDX
    const mdxContent = convertToMDX(post.content);

    // Calculate reading time
    const readingTime = calculateReadingTime(post.content);

    // Generate slug if missing
    const slug = post.slug || createSlug(post.title);

    // Get featured image
    const featuredImage = getFeaturedImage(post, data.attachments);

    // Create MDX file
    const mdxFilePath = path.join(tinaPostsPath, `${slug}.mdx`);

    const frontmatter = {
      title: post.title,
      slug: slug,
      date: formatDate(post.date),
      modified: formatDate(post.modified),
      excerpt: post.excerpt || '',
      author: post.author || CONFIG.defaultAuthor,
      category: primaryCategory,
      categories: post.categories.map(c => c.name).join(','),
      tags: post.tags.map(t => t.name).join(','),
      featured_image: featuredImage ? `/uploads/${featuredImage.path}` : '',
      reading_time: readingTime,
      status: post.status === POST_STATUS.PRIVATE ? 'draft' : post.status,
      format: 'standard',
      seo: {
        title: post.postmeta['_yoast_wpseo_title'] || '',
        description: post.postmeta['_yoast_wpseo_metadesc'] || '',
        canonical: post.postmeta['_yoast_wpseo_canonical'] || '',
      },
    };

    const frontmatterString = '---\n' + Object.entries(frontmatter)
      .map(([key, value]) => {
        if (typeof value === 'object') {
          const inner = Object.entries(value)
            .filter(([k, v]) => v) // Skip empty values
            .map(([k, v]) => `  ${k}: "${v}"`)
            .join('\n');
          if (!inner) return '';
          return `${key}:\n${inner}`;
        }
        if (!value) return `${key}: ""`;
        return `${key}: "${value}"`;
      })
      .filter(line => line)
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
    // Convert content to MDX
    const mdxContent = convertToMDX(page.content);

    // Calculate reading time
    const readingTime = calculateReadingTime(page.content);

    // Generate slug if missing
    const slug = page.slug || createSlug(page.title);

    // Get featured image
    const featuredImage = getFeaturedImage(page, data.attachments);

    // Create MDX file
    const mdxFilePath = path.join(tinaPagesPath, `${slug}.mdx`);

    const frontmatter = {
      title: page.title,
      slug: slug,
      date: formatDate(page.date),
      excerpt: page.excerpt || '',
      author: page.author || CONFIG.defaultAuthor,
      featured_image: featuredImage ? `/uploads/${featuredImage.path}` : '',
      reading_time: readingTime,
      status: page.status,
    };

    const frontmatterString = '---\n' + Object.entries(frontmatter)
      .map(([key, value]) => {
        if (!value) return `${key}: ""`;
        return `${key}: "${value}"`;
      })
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

  // Merge with existing index files
  const mergeIndex = (existingPath, newIndex, keyField) => {
    let existing = [];
    if (fs.existsSync(existingPath)) {
      try {
        existing = JSON.parse(fs.readFileSync(existingPath, 'utf8')) || [];
      } catch (e) {
        existing = [];
      }
    }

    const existingIds = new Set(existing.map(item => item[keyField] || item.slug));
    const toAdd = newIndex.filter(item => !existingIds.has(item[keyField] || item.slug));

    const merged = [...existing, ...toAdd];
    fs.writeFileSync(existingPath, JSON.stringify(merged, null, 2));

    return merged.length;
  };

  // Write/merge index files
  console.log('\nWriting index files...');

  const postsCount = mergeIndex(
    path.join(CONFIG.tinaProjectPath, 'content/posts.json'),
    postsIndex,
    'slug'
  );

  const pagesCount = mergeIndex(
    path.join(CONFIG.tinaProjectPath, 'content/pages.json'),
    pagesIndex,
    'slug'
  );

  // Merge categories and tags
  const existingCategories = fs.existsSync(path.join(CONFIG.tinaProjectPath, 'content/categories.json'))
    ? JSON.parse(fs.readFileSync(path.join(CONFIG.tinaProjectPath, 'content/categories.json'), 'utf8'))
    : [];
  const existingCategoryIds = new Set(existingCategories.map(c => c.id));
  const newCategories = [...categoriesMap.values()].filter(c => !existingCategoryIds.has(c.id));
  fs.writeFileSync(
    path.join(CONFIG.tinaProjectPath, 'content/categories.json'),
    JSON.stringify([...existingCategories, ...newCategories], null, 2)
  );

  const existingTags = fs.existsSync(path.join(CONFIG.tinaProjectPath, 'content/tags.json'))
    ? JSON.parse(fs.readFileSync(path.join(CONFIG.tinaProjectPath, 'content/tags.json'), 'utf8'))
    : [];
  const existingTagIds = new Set(existingTags.map(t => t.id));
  const newTags = [...tagsMap.values()].filter(t => !existingTagIds.has(t.id));
  fs.writeFileSync(
    path.join(CONFIG.tinaProjectPath, 'content/tags.json'),
    JSON.stringify([...existingTags, ...newTags], null, 2)
  );

  console.log(`  ✓ posts.json (${postsCount} total)`);
  console.log(`  ✓ pages.json (${pagesCount} total)`);
  console.log('  ✓ categories.json');
  console.log('  ✓ tags.json');

  return {
    postsCount: posts.length,
    pagesCount: pages.length,
    categoriesCount: categoriesMap.size,
    tagsCount: tagsMap.size,
    totalPosts: postsCount,
    totalPages: pagesCount,
  };
}

/**
 * Main migration function
 */
function main() {
  console.log('='.repeat(60));
  console.log('WordPress XML Export to TinaCMS Migration');
  console.log('='.repeat(60));

  const xmlFilePath = process.argv[2];

  if (!xmlFilePath) {
    console.error('\nError: Please provide the path to the WordPress XML export file.');
    console.error('\nUsage: node scripts/migrate-wordpress-xml-to-tinacms.js <path-to-export.xml>\n');
    console.error('\nHow to export from WordPress:');
    console.error('1. Go to your WordPress admin panel');
    console.error('2. Navigate to Tools → Export');
    console.error('3. Choose "All content" or specific content types');
    console.error('4. Download the XML file');
    console.error('5. Run this script with the downloaded file path\n');
    process.exit(1);
  }

  const resolvedPath = path.resolve(xmlFilePath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`\nError: File not found at: ${resolvedPath}`);
    process.exit(1);
  }

  // Read and parse XML file
  console.log(`\nReading XML export from: ${resolvedPath}`);
  const xmlContent = fs.readFileSync(resolvedPath, 'utf8');

  try {
    const data = parseWordPressXML(xmlContent);

    // Migrate content to TinaCMS
    const stats = migrateToTinaCMS(data);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Migration Complete!');
    console.log('='.repeat(60));
    console.log(`Posts migrated:     ${stats.postsCount} (total: ${stats.totalPosts})`);
    console.log(`Pages migrated:     ${stats.pagesCount} (total: ${stats.totalPages})`);
    console.log(`Categories:         ${stats.categoriesCount}`);
    console.log(`Tags:               ${stats.tagsCount}`);
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Review the migrated content in the content/ directory');
    console.log('2. Download media files from WordPress and place in public/uploads/');
    console.log('3. Update the TinaCMS schema if needed (tina/config.ts)');
    console.log('4. Run your TinaCMS dev server to preview');
    console.log('5. Make any manual adjustments to content formatting');
  } catch (error) {
    console.error('\nError during migration:', error.message);
    if (error.message.includes('Invalid WordPress XML')) {
      console.error('\nMake sure you are using a valid WordPress XML export file.');
      console.error('Export from: WordPress Admin → Tools → Export');
    }
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  main();
}

module.exports = {
  parseWordPressXML,
  convertToMDX,
  migrateToTinaCMS,
};
