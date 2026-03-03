import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageTitle } from '@/components/layout/PageTitle';
import { PostCard } from '@/components/blog/PostCard';
import { getTagBySlug, getPostsByTag, getAllTags } from '@/lib/content';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-static';

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) {
    return {
      title: 'Tag Not Found',
    };
  }

  return {
    title: `${tag.name} Tag`,
    description: `Posts tagged with "${tag.name}"`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) {
    notFound();
  }

  const posts = await getPostsByTag(tag.name);

  return (
    <>
      <Header />
      <main>
        <PageTitle
          title={`#${tag.name}`}
          subtitle={`Browse all posts tagged with "${tag.name}"`}
          breadcrumbs={[
            { name: 'Home', href: '/' },
            { name: 'Tags', href: '/tags' },
            { name: tag.name, href: `/tag/${slug}` },
          ]}
        />

        <div className="axil-section-gap">
          <div className="container mx-auto px-4">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-body-color">No posts found with this tag.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.frontmatter.slug} post={post.frontmatter} showExcerpt />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// Generate static params for all tags
export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({
    slug: tag.slug,
  }));
}
