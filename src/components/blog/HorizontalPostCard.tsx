'use client';

import Image from 'next/image';
import Link from 'next/link';

export interface HorizontalPostCardProps {
  post: {
    slug: string;
    title: string;
    excerpt?: string;
    featured_image?: string;
    date: string;
    author?: string;
    category?: string;
    reading_time?: number;
    format?: 'standard' | 'gallery' | 'video' | 'audio' | 'quote' | 'link';
    custom_link?: string;
  };
}

export function HorizontalPostCard({ post }: HorizontalPostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
    <Link
      href={postHref}
      className={`horizontal-post-card ${isExternalLink ? 'external-link' : ''}`}
      {...linkProps}
    >
      <div className="horizontal-post-card-wrapper">
        {/* Thumbnail Image */}
        {post.featured_image && (
          <div className="horizontal-post-thumbnail">
            <Image
              src={post.featured_image}
              alt={post.title}
              width={200}
              height={150}
              className="thumbnail-image"
              sizes="(max-width: 768px) 150px, 200px"
            />
            {isExternalLink && (
              <div className="external-badge-thumbnail">↗</div>
            )}
          </div>
        )}

        {/* Content Side */}
        <div className="horizontal-post-content-wrapper">
          {/* Category Badge */}
          {post.category && (
            <div className="post-category-badge">
              <span className="category-label">{post.category}</span>
            </div>
          )}

          {/* Title */}
          <h3 className="post-title">
            {post.title}
            {isExternalLink && <span className="external-arrow"> ↗</span>}
          </h3>

          {/* Excerpt (optional) */}
          {post.excerpt && (
            <p className="post-excerpt">
              {post.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="post-meta-info">
            {post.author && (
              <span className="meta-item meta-author">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="meta-icon">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {post.author}
              </span>
            )}

            <span className="meta-item meta-date">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="meta-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {formatDate(post.date)}
            </span>

            {post.reading_time && post.format !== 'link' && (
              <span className="meta-item meta-reading-time">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="meta-icon">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {post.reading_time} min read
              </span>
            )}

            {isExternalLink && (
              <span className="meta-item meta-external">
                External Link
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
