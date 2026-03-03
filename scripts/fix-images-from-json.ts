#!/usr/bin/env tsx

/**
 * Fix featured images using posts.json as source of truth
 * posts.json has correct featured_image paths for the posts it contains
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(__dirname, '../content');

interface JsonPost {
  slug: string;
  featured_image: string;
}

/**
 * Load posts.json to get correct image paths
 */
function loadPostsJson(): Map<string, string> {
  const jsonPath = path.join(CONTENT_DIR, 'posts.json');
  if (!fs.existsSync(jsonPath)) {
    console.log('⚠ posts.json not found');
    return new Map();
  }

  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const posts: JsonPost[] = JSON.parse(jsonContent);

  const slugToImage = new Map<string, string>();
  for (const post of posts) {
    if (post.featured_image) {
      slugToImage.set(post.slug, post.featured_image);
    }
  }

  return slugToImage;
}

/**
 * Update MDX file with correct featured_image
 */
function updateMDXFeaturedImage(filePath: string, featuredImage: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data, content: markdown } = matter(content);

  // Update featured_image
  data.featured_image = featuredImage;

  // Also update opengraph image if it's empty
  if (data.seo?.opengraph && !data.seo.opengraph.image) {
    data.seo.opengraph.image = featuredImage;
  }

  // Rebuild frontmatter
  let newFrontmatter = '---\n';
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;

    if (key === 'seo' || key === 'opengraph' || key === 'twitter') {
      newFrontmatter += `${key}:\n`;
      const obj = value as Record<string, any>;
      for (const [subKey, subValue] of Object.entries(obj)) {
        if (subValue === undefined || subValue === null || subValue === '') continue;
        if (typeof subValue === 'string') {
          newFrontmatter += `  ${subKey}: "${subValue}"\n`;
        } else {
          newFrontmatter += `  ${subKey}: ${subValue}\n`;
        }
      }
    } else if (Array.isArray(value)) {
      newFrontmatter += `${key}: [${value.map((v: any) => `"${v}"`).join(', ')}]\n`;
    } else if (typeof value === 'string') {
      const escapedValue = value.replace(/"/g, '\\"');
      newFrontmatter += `${key}: "${escapedValue}"\n`;
    } else if (typeof value === 'boolean') {
      newFrontmatter += `${key}: ${value}\n`;
    } else if (typeof value === 'number') {
      newFrontmatter += `${key}: ${value}\n`;
    }
  }
  newFrontmatter += '---\n\n';

  const newContent = newFrontmatter + markdown;
  fs.writeFileSync(filePath, newContent);

  return true;
}

/**
 * Main function
 */
async function fixFeaturedImagesFromJson() {
  console.log('Fixing featured images from posts.json...\n');

  // Load correct image paths from posts.json
  const slugToImage = loadPostsJson();
  console.log(`✓ Found ${slugToImage.size} posts with images in posts.json\n`);

  // Process all MDX files
  const postsDir = path.join(CONTENT_DIR, 'posts');
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx'));

  let updated = 0;
  let notFound = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    let data;
    try {
      ({ data } = matter(content));
    } catch (e) {
      console.log(`⚠ Skipping ${file} due to YAML parse error`);
      skipped++;
      continue;
    }

    const slug = data.slug || file.replace('.mdx', '');
    const currentImage = data.featured_image || '';

    if (slugToImage.has(slug)) {
      const correctImage = slugToImage.get(slug)!;
      if (currentImage !== correctImage) {
        updateMDXFeaturedImage(filePath, correctImage);
        console.log(`✓ Updated ${file}: ${correctImage}`);
        updated++;
      } else {
        console.log(`✓ Skipped ${file}: already correct`);
      }
    } else {
      notFound++;
    }
  }

  console.log(`\n✓ Fixed ${updated} files`);
  console.log(`✓ Skipped ${skipped} files (YAML errors)`);
  console.log(`ℹ No image in posts.json for ${notFound} files`);
  console.log('\n✓ Featured images fixed from posts.json!');
}

// Run the fix
fixFeaturedImagesFromJson().catch(console.error);
