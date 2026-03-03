/**
 * Review data structure
 */
export interface Review {
  enabled: boolean;
  score: number;
  name: string;
  pros: string[];
  cons: string[];
}

/**
 * SEO metadata structure
 */
export interface SEO {
  title: string;
  description: string;
  focus_keyword: string;
  canonical: string;
  opengraph: {
    title: string;
    description: string;
    image: string;
  };
  twitter: {
    card: "summary" | "summary_large_image";
    title: string;
    description: string;
    image: string;
  };
  schema: {
    type: "Article" | "WebPage" | "BlogPosting";
    published_time: string;
    modified_time: string;
  };
}

/**
 * Frontmatter structure for posts
 */
export interface PostFrontmatter {
  title: string;
  slug: string;
  date: string;
  modified?: string;
  excerpt: string;
  author: string;
  author_id: number;
  category: string;
  categories: string[];
  tags: string[];
  featured_image: string;
  reading_time: number;
  status: "publish" | "draft";
  format: "standard" | "gallery" | "video" | "audio" | "quote" | "link";
  review?: Review;
  gallery?: Array<{ url: string; alt: string; caption?: string }>;
  audio?: string;
  video?: string;
  custom_link?: string;
  quote_author?: string;
  quote_designation?: string;
  seo?: SEO;
}

/**
 * Post structure with content
 */
export interface Post {
  frontmatter: PostFrontmatter;
  content: string;
}

/**
 * Category structure
 */
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  image?: string;  // Category thumbnail image URL
}

/**
 * Tag structure
 */
export interface Tag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

/**
 * Author structure
 */
export interface Author {
  id: number;
  name: string;
  slug: string;
  description: string;
  avatar: string;
}
