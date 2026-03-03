import Link from 'next/link';
import Image from 'next/image';
import { PostMeta } from './PostMeta';

export interface PostCardProps {
  post: {
    slug: string;
    title: string;
    excerpt?: string;
    featured_image?: string;
    date: string;
    author: string;
    category: string;
    categories?: string[];
    reading_time: number;
    format?: 'standard' | 'gallery' | 'video' | 'audio' | 'quote' | 'link';
    custom_link?: string;
  };
  showExcerpt?: boolean;
  imageSize?: 'thumbnail' | 'medium' | 'large';
}

export function PostCard({ post, showExcerpt = false, imageSize = 'medium' }: PostCardProps) {
  const imageSizes = {
    thumbnail: 'h-48 w-full',
    medium: 'h-56 w-full',
    large: 'h-72 w-full',
  };

  // Determine if this is an external link post
  const isExternalLink = post.format === 'link' && !!post.custom_link;
  const postHref: string = isExternalLink && post.custom_link ? post.custom_link : `/blog/${post.slug}`;
  const linkProps = isExternalLink ? {
    target: '_blank',
    rel: 'noopener noreferrer'
  } : {};

  // Skip rendering if it's a link post without a custom link
  if (post.format === 'link' && !post.custom_link) {
    return null;
  }

  return (
    <div className={`content-block post-list-view mt--30 ${isExternalLink ? 'external-post' : ''}`} id={`post-${post.slug}`}>
      {/* Thumbnail */}
      {post.featured_image && (
        <div className="post-thumbnail">
          <Link href={postHref} {...linkProps}>
            <div className={`overflow-hidden rounded-lg relative group ${imageSizes[imageSize]}`}>
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {isExternalLink && (
                <div className="absolute top-3 right-3 bg-primary text-white px-2 py-1 rounded text-xs font-semibold">
                  ↗ External
                </div>
              )}
            </div>
          </Link>
        </div>
      )}

      {/* Content */}
      <div className="post-content">
        {/* Category Badge */}
        {post.category && (
          <div className="category-meta">
            <Link
              href={`/category/${post.category.toLowerCase().replace(/\s+/g, '-')}`}
              className="axil-button-label hover-flip-item-wrapper"
            >
              <span className="hover-flip-item">
                <span data-text={post.category}>{post.category}</span>
              </span>
            </Link>
          </div>
        )}

        {/* Title */}
        <h4 className="title">
          <Link
            href={postHref}
            className="hover:text-primary transition-colors"
            {...linkProps}
          >
            {post.title}
            {isExternalLink && <span className="ml-1 text-sm">↗</span>}
          </Link>
        </h4>

        {/* Excerpt */}
        {showExcerpt && post.excerpt && (
          <p className="text-body-color b2 line-clamp-3 mb-4">
            {post.excerpt}
          </p>
        )}

        {/* Meta Wrapper */}
        <div className="post-meta-wrapper">
          <PostMeta
            date={post.date}
            author={post.author}
            readingTime={isExternalLink ? undefined : post.reading_time}
          />
          {isExternalLink && (
            <span className="text-body-color b2 ml-3">
              <span className="text-primary">External Link</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
