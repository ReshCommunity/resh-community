import { MetadataRoute } from 'next';
import { getAllPosts, getAllCategories, getAllTags, getAllPages } from '@/lib/content';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://resh.community';
  const posts = await getAllPosts();
  const categories = await getAllCategories();
  const tags = await getAllTags();
  const pages = await getAllPages();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Blog posts
  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.frontmatter.slug}`,
    lastModified: new Date(post.frontmatter.modified || post.frontmatter.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Categories
  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Tags
  const tagUrls: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Pages
  const pageUrls: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${baseUrl}/${page.frontmatter.slug}`,
    lastModified: new Date(page.frontmatter.modified || page.frontmatter.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...postUrls,
    ...categoryUrls,
    ...tagUrls,
    ...pageUrls,
  ];
}
