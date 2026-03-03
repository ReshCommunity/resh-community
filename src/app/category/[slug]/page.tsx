import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageTitle } from '@/components/layout/PageTitle';
import { PostCard } from '@/components/blog/PostCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { getCategoryBySlug, getPostsByCategory, getAllCategories } from '@/lib/content';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-static';

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} Category`,
    description: category.description || `Posts in ${category.name}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const posts = await getPostsByCategory(category.name);

  // Generate WebPage schema
  const webPageSchema = {
    name: `${category.name} Category - Resh Blog`,
    description: category.description || `Posts in ${category.name}`,
    url: `https://resh.community/category/${slug}`,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    language: 'en-US',
    siteUrl: 'https://resh.community',
    siteName: 'Resh Blog',
  };

  // Generate breadcrumb schema
  const breadcrumbSchema = {
    items: [
      { name: 'Home', url: 'https://resh.community' },
      { name: 'Categories', url: 'https://resh.community/categories' },
      { name: category.name, url: `https://resh.community/category/${slug}` },
    ],
  };

  return (
    <>
      <JsonLd type="WebPage" data={webPageSchema} />
      <JsonLd type="BreadcrumbList" data={breadcrumbSchema} />
      <Header />
      <main>
        <PageTitle
          title={category.name}
          subtitle={category.description || `Browse all posts in ${category.name}`}
          breadcrumbs={[
            { name: 'Home', href: '/' },
            { name: 'Categories', href: '/categories' },
            { name: category.name, href: `/category/${slug}` },
          ]}
        />

        <div className="axil-section-gap">
          <div className="container mx-auto px-4">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-body-color">No posts found in this category.</p>
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

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}
