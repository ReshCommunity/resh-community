import Link from 'next/link';
import Image from 'next/image';
import { PostCard } from './PostCard';

export interface RelatedPostsProps {
  posts: Array<{
    slug: string;
    title: string;
    excerpt?: string;
    featured_image?: string;
    date: string;
    author: string;
    category: string;
    categories?: string[];
    reading_time: number;
  }>;
  title?: string;
  maxPosts?: number;
}

export function RelatedPosts({ posts, title = 'Related Posts', maxPosts = 3 }: RelatedPostsProps) {
  const displayPosts = posts.slice(0, maxPosts);

  if (displayPosts.length === 0) return null;

  return (
    <div className="related-posts axil-section-gapTop">
      <h3 className="font-heading font-bold text-h2 text-heading-color mb-6">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPosts.map((post) => (
          <PostCard
            key={post.slug}
            post={post}
            showExcerpt={true}
            imageSize="medium"
          />
        ))}
      </div>
    </div>
  );
}
