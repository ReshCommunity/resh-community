import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getAuthorBySlug, getPostsByAuthor, getAllAuthors } from '@/lib/content';
import { PostCard } from '@/components/blog/PostCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faFileAlt } from '@fortawesome/free-solid-svg-icons';

interface AuthorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate static params for all authors
 */
export async function generateStaticParams() {
  const authors = await getAllAuthors();
  return authors.map((author) => ({
    slug: author.name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

/**
 * Generate metadata for author page
 */
export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) {
    return {
      title: 'Author Not Found',
    };
  }

  return {
    title: `${author.name} - Author | Resh Blog`,
    description: `Articles by ${author.name}. Browse all posts written by ${author.name} on Resh Community Blog.`,
    openGraph: {
      title: `${author.name} - Author | Resh Blog`,
      description: `Articles by ${author.name}. Browse all posts written by ${author.name} on Resh Community Blog.`,
      type: 'website',
    },
  };
}

/**
 * Author page component
 */
export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  const posts = await getPostsBySlug(slug);

  if (!author) {
    notFound();
  }

  return (
    <div className="axil-breadcrumb-area">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            {/* Author Header */}
            <div className="bradcrumb-inner text-center">
              <div className="author-header">
                <div className="author-avatar">
                  <div className="thumbnail">
                    <Image
                      src="/images/logo/logo.webp"
                      alt={author.name}
                      width={120}
                      height={120}
                      className="author-image"
                    />
                  </div>
                </div>
                <h1 className="title theme-gradient h2">{author.name}</h1>
                <div className="author-meta">
                  <span className="post-count">
                    <FontAwesomeIcon icon={faFileAlt} className="icon" />
                    {author.count} {author.count === 1 ? 'Article' : 'Articles'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Author Posts */}
      <div className="axil-post-list-area axil-section-gap bg-color-white">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="page-title">
                <h2 className="title">
                  Articles by <span className="theme-gradient">{author.name}</span>
                </h2>
              </div>
            </div>
          </div>

          {posts.length > 0 ? (
            <div className="row">
              {posts.map((post) => (
                <div key={post.frontmatter.slug} className="col-lg-12">
                  <PostCard post={post.frontmatter} imageSize="large" />
                </div>
              ))}
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-12">
                <div className="no-posts-found text-center">
                  <FontAwesomeIcon icon={faFileAlt} className="icon" size="3x" />
                  <h3>No Articles Found</h3>
                  <p>No articles have been published by {author.name} yet.</p>
                  <Link href="/blog" className="axil-button btn-fill-primary">
                    Back to Blog
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center mt--20">
              <Link href="/blog" className="axil-button btn-small btn-secondary">
                ← Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to get posts by slug (author name in slug format)
 */
async function getPostsBySlug(slug: string) {
  const authors = await getAllAuthors();
  const author = authors.find(
    (a) => a.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
  );

  if (!author) {
    return [];
  }

  const { getPostsByAuthor } = await import('@/lib/content');
  return getPostsByAuthor(author.name);
}
