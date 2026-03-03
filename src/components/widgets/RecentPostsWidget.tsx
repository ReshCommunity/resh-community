import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/content';

async function getRecentPosts() {
  const posts = await getAllPosts();
  return posts.slice(0, 5);
}

export async function RecentPostsWidget() {
  const recentPosts = await getRecentPosts();

  return (
    <div className="axil-single-widget mt--30 mt_sm--30 mt_md--30">
      <h5 className="widget-title">Recent Posts</h5>
      <div className="axil-recent-post-wrapper">
        {recentPosts.map((post) => (
          <div key={post.frontmatter.slug} className="axil-media axil-recent-post">
            {post.frontmatter.featured_image && (
              <div className="thumbnail">
                <Link href={`/blog/${post.frontmatter.slug}`}>
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={post.frontmatter.featured_image}
                      alt={post.frontmatter.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                </Link>
              </div>
            )}
            <div className="media-body">
              <h6 className="title">
                <Link href={`/blog/${post.frontmatter.slug}`}>
                  {post.frontmatter.title}
                </Link>
              </h6>
              <div className="post-meta">
                <span className="post-date">
                  {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
