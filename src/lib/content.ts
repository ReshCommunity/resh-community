import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Post, PostFrontmatter, Category, Tag } from '@/types/content';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * Read and parse an MDX file
 */
function parseMDXFile(filePath: string): Post | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // Normalize categories to always be an array
    let normalizedCategories: string[];
    if (Array.isArray(data.categories)) {
      normalizedCategories = data.categories.filter((c: any) => c && typeof c === 'string' && c.trim() !== '');
    } else if (data.categories && typeof data.categories === 'string' && data.categories.trim() !== '') {
      normalizedCategories = [data.categories.trim()];
    } else if (data.category && typeof data.category === 'string' && data.category.trim() !== '') {
      normalizedCategories = [data.category.trim()];
    } else {
      normalizedCategories = ['Crypto'];
    }

    // Normalize tags to always be an array
    let normalizedTags: string[];
    if (Array.isArray(data.tags)) {
      normalizedTags = data.tags.filter((t: any) => t && typeof t === 'string' && t.trim() !== '');
    } else if (data.tags && typeof data.tags === 'string' && data.tags.trim() !== '') {
      // Split comma-separated tags
      normalizedTags = data.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '');
    } else {
      normalizedTags = [];
    }

    // Normalize date to ISO string format, ensure valid date
    let normalizedDate: string;
    let normalizedModified: string | undefined;

    if (data.date) {
      const dateObj = new Date(data.date);
      if (!isNaN(dateObj.getTime())) {
        normalizedDate = dateObj.toISOString();
      } else {
        normalizedDate = new Date().toISOString();
      }
    } else {
      normalizedDate = new Date().toISOString();
    }

    if (data.modified) {
      const modifiedObj = new Date(data.modified);
      if (!isNaN(modifiedObj.getTime())) {
        normalizedModified = modifiedObj.toISOString();
      }
    }

    // Build frontmatter with defaults
    const frontmatter: PostFrontmatter = {
      title: data.title || '',
      slug: data.slug || '',
      date: normalizedDate,
      modified: normalizedModified,
      excerpt: data.excerpt || data.description || '',
      author: data.author || 'Resh Community',
      author_id: data.author_id || 1,
      category: normalizedCategories[0] || 'Crypto',
      categories: normalizedCategories,
      tags: normalizedTags,
      featured_image: data.featuredImage || data.featured_image || '',
      reading_time: data.reading_time || Math.ceil(content.length / 200),
      status: data.status || 'publish' as const,
      format: data.format || 'standard' as const,
      custom_link: data.custom_link || data.customUrl || '',
      // SEO fields - use proper nested structure
      seo: {
        title: data.seoTitle || data.seo_title || data.title || '',
        description: data.seoDescription || data.seo_description || data.excerpt || '',
        focus_keyword: data.focus_keyword || '',
        canonical: data.canonical || '',
        opengraph: {
          title: data.ogTitle || data.og_title || data.title || '',
          description: data.ogDescription || data.og_description || data.excerpt || '',
          image: data.ogImage || data.og_image || data.featuredImage || data.featured_image || '',
        },
        twitter: {
          card: 'summary_large_image',
          title: data.ogTitle || data.og_title || data.title || '',
          description: data.ogDescription || data.og_description || data.excerpt || '',
          image: data.ogImage || data.og_image || data.featuredImage || data.featured_image || '',
        },
        schema: {
          type: 'Article',
          published_time: String(data.date || new Date().toISOString()),
          modified_time: String(data.modified || data.date || new Date().toISOString()),
        },
      },
    };

    return {
      frontmatter,
      content,
    };
  } catch (error) {
    console.error(`Error parsing MDX file ${filePath}:`, error);
    return null;
  }
}

/**
 * Get all published posts from MDX files
 */
export async function getAllPosts(): Promise<Post[]> {
  const postsDir = path.join(CONTENT_DIR, 'posts');

  if (!fs.existsSync(postsDir)) {
    console.warn('Posts directory not found, returning empty array');
    return [];
  }

  try {
    const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx'));

    const posts: Post[] = [];
    for (const file of files) {
      const filePath = path.join(postsDir, file);
      const post = parseMDXFile(filePath);
      if (post && post.frontmatter.status === 'publish') {
        posts.push(post);
      }
    }

    // Sort by date (newest first), with safe date parsing
    return posts.sort((a, b) => {
      const dateA = new Date(a.frontmatter.date).getTime() || 0;
      const dateB = new Date(b.frontmatter.date).getTime() || 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error reading posts directory:', error);
    return [];
  }
}

/**
 * Get a post by slug from MDX files
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const postsDir = path.join(CONTENT_DIR, 'posts');

  if (!fs.existsSync(postsDir)) return null;

  try {
    const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx'));

    for (const file of files) {
      const filePath = path.join(postsDir, file);
      const post = parseMDXFile(filePath);
      if (post && post.frontmatter.slug === slug) {
        return post;
      }
    }

    return null;
  } catch (error) {
    console.error('Error reading post by slug:', error);
    return null;
  }
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(category: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) =>
    post.frontmatter.categories.some(
      (cat) => cat.toLowerCase() === category.toLowerCase()
    )
  );
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) =>
    post.frontmatter.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Get all unique authors
 */
export async function getAllAuthors(): Promise<{ name: string; id: number; count: number }[]> {
  const allPosts = await getAllPosts();
  const authorMap = new Map<number, { name: string; id: number; count: number }>();

  for (const post of allPosts) {
    const authorId = post.frontmatter.author_id || 1;
    const authorName = post.frontmatter.author || 'Resh Community';

    if (authorMap.has(authorId)) {
      const existing = authorMap.get(authorId)!;
      existing.count++;
    } else {
      authorMap.set(authorId, {
        name: authorName,
        id: authorId,
        count: 1,
      });
    }
  }

  return Array.from(authorMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * Get posts by author
 */
export async function getPostsByAuthor(authorName: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => {
    const postAuthor = post.frontmatter.author || 'Resh Community';
    return postAuthor.toLowerCase() === authorName.toLowerCase();
  });
}

/**
 * Get author by name (slug format)
 */
export async function getAuthorBySlug(slug: string): Promise<{ name: string; id: number; count: number } | null> {
  const authors = await getAllAuthors();
  return authors.find(
    (author) => author.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
  ) || null;
}

/**
 * Get all categories from JSON
 */
export async function getAllCategories(): Promise<Category[]> {
  const filePath = path.join(CONTENT_DIR, 'categories.json');
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as Category[];
}

/**
 * Get a category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getAllCategories();
  return categories.find(
    (cat) => cat.slug.toLowerCase() === slug.toLowerCase()
  ) || null;
}

/**
 * Get all tags from JSON
 */
export async function getAllTags(): Promise<Tag[]> {
  const filePath = path.join(CONTENT_DIR, 'tags.json');
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as Tag[];
}

/**
 * Get a tag by slug
 */
export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const tags = await getAllTags();
  return tags.find(
    (tag) => tag.slug.toLowerCase() === slug.toLowerCase()
  ) || null;
}

/**
 * Get related posts by category (excluding current post)
 */
export async function getRelatedPosts(
  currentSlug: string,
  category: string,
  limit = 3
): Promise<Post[]> {
  const categoryPosts = await getPostsByCategory(category);
  return categoryPosts
    .filter((post) => post.frontmatter.slug !== currentSlug)
    .slice(0, limit);
}

/**
 * Get posts for pagination
 */
export async function getPaginatedPosts(
  page = 1,
  perPage = 10
): Promise<{ posts: Post[]; totalPages: number; totalPosts: number }> {
  const allPosts = await getAllPosts();
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / perPage);

  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const posts = allPosts.slice(startIndex, endIndex);

  return {
    posts,
    totalPages,
    totalPosts,
  };
}

/**
 * Get all pages from MDX files
 */
export async function getAllPages(): Promise<Post[]> {
  const pagesDir = path.join(CONTENT_DIR, 'pages');

  if (!fs.existsSync(pagesDir)) {
    console.warn('Pages directory not found, returning empty array');
    return [];
  }

  try {
    const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.mdx'));

    const pages: Post[] = [];
    for (const file of files) {
      const filePath = path.join(pagesDir, file);
      const page = parseMDXFile(filePath);
      if (page && page.frontmatter.status === 'publish') {
        pages.push(page);
      }
    }

    return pages;
  } catch (error) {
    console.error('Error reading pages directory:', error);
    return [];
  }
}

/**
 * Get a page by slug from MDX files
 */
export async function getPageBySlug(slug: string): Promise<Post | null> {
  const pagesDir = path.join(CONTENT_DIR, 'pages');

  if (!fs.existsSync(pagesDir)) return null;

  try {
    const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.mdx'));

    for (const file of files) {
      const filePath = path.join(pagesDir, file);
      const page = parseMDXFile(filePath);
      if (page && page.frontmatter.slug === slug) {
        return page;
      }
    }

    return null;
  } catch (error) {
    console.error('Error reading page by slug:', error);
    return null;
  }
}

/**
 * Search posts by query string
 */
export async function searchPosts(query: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  const lowerQuery = query.toLowerCase();

  return allPosts.filter((post) => {
    const titleMatch = post.frontmatter.title.toLowerCase().includes(lowerQuery);
    const excerptMatch = post.frontmatter.excerpt.toLowerCase().includes(lowerQuery);
    const contentMatch = post.content.toLowerCase().includes(lowerQuery);
    const tagMatch = post.frontmatter.tags.some((tag) =>
      tag.toLowerCase().includes(lowerQuery)
    );
    const categoryMatch = post.frontmatter.categories.some((cat) =>
      cat.toLowerCase().includes(lowerQuery)
    );

    return titleMatch || excerptMatch || contentMatch || tagMatch || categoryMatch;
  });
}

/**
 * Get adjacent posts (previous and next) for a given post
 */
export async function getAdjacentPosts(
  slug: string
): Promise<{ prev: Post | null; next: Post | null }> {
  const allPosts = await getAllPosts();
  const currentIndex = allPosts.findIndex(
    (post) => post.frontmatter.slug === slug
  );

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
    next: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null,
  };
}
