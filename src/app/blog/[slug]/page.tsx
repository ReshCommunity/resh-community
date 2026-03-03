import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageTitle } from '@/components/layout/PageTitle';
import { PostMeta } from '@/components/blog/PostMeta';
import { SocialShare } from '@/components/blog/SocialShare';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { ReviewBox } from '@/components/blog/ReviewBox';
import { CommentSection } from '@/components/blog/CommentSection';
import { MarkdownContent } from '@/components/blog/MarkdownContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { getPostBySlug, getRelatedPosts, getAllCategories, getAllPosts } from '@/lib/content';
import { extractFAQs, generateArticleSchema, generateBreadcrumbSchema } from '@/lib/schema';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-static';

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const { frontmatter } = post;

  return {
    title: frontmatter.seo?.title || frontmatter.title,
    description: frontmatter.seo?.description || frontmatter.excerpt,
    openGraph: {
      title: frontmatter.seo?.opengraph?.title || frontmatter.title,
      description: frontmatter.seo?.opengraph?.description || frontmatter.excerpt,
      images: frontmatter.featured_image ? [{ url: frontmatter.featured_image }] : [],
      type: 'article',
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { frontmatter, content } = post;
  const relatedPosts = await getRelatedPosts(slug, frontmatter.category);
  const categories = await getAllCategories();
  const currentCategory = categories.find(
    (cat) => cat.name === frontmatter.category
  );

  // Generate schema data
  const articleSchema = generateArticleSchema(frontmatter, slug);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://resh.community' },
    { name: 'Blog', url: 'https://resh.community/blog' },
    { name: frontmatter.title, url: `https://resh.community/blog/${slug}` },
  ]);
  const faqs = extractFAQs(content);
  const hasFAQs = faqs.length > 0;

  return (
    <>
      {/* Schema.org JSON-LD */}
      <JsonLd type="Article" data={articleSchema} />
      <JsonLd type="BreadcrumbList" data={breadcrumbSchema} />
      {hasFAQs && <JsonLd type="FAQPage" data={{ faqs }} />}

      <Header />
      <main>
        {/* Page Title */}
        <PageTitle
          title={frontmatter.title}
          breadcrumbs={[
            { name: 'Home', href: '/' },
            { name: 'Blog', href: '/blog' },
            { name: frontmatter.title, href: `/blog/${slug}` },
          ]}
        />

        {/* Single Post Content */}
        <article className="axil-section-gap">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Featured Image - Full Size */}
                {frontmatter.featured_image && (
                  <div className="post-thumbnail relative w-full rounded-lg overflow-hidden mb-6">
                    <Image
                      src={frontmatter.featured_image}
                      alt={frontmatter.title}
                      width={1200}
                      height={630}
                      className="w-full h-auto object-contain"
                      priority
                    />
                  </div>
                )}

                {/* Category Badge */}
                {frontmatter.category && (
                  <div className="category-meta mb-3">
                    <Link
                      href={`/category/${currentCategory?.slug || frontmatter.category.toLowerCase()}`}
                      className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      {frontmatter.category}
                    </Link>
                  </div>
                )}

                {/* Title */}
                <h1 className="font-heading font-bold text-h2 md:text-h1 text-heading-color mb-4">
                  {frontmatter.title}
                </h1>

                {/* Meta & Share */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                  <PostMeta
                    date={frontmatter.date}
                    author={frontmatter.author}
                    readingTime={frontmatter.reading_time}
                  />
                  <SocialShare
                    title={frontmatter.title}
                    description={frontmatter.excerpt}
                  />
                </div>

                {/* Review Box */}
                {frontmatter.review?.enabled && (
                  <ReviewBox
                    score={frontmatter.review.score}
                    name={frontmatter.review.name}
                    pros={frontmatter.review.pros}
                    cons={frontmatter.review.cons}
                  />
                )}

                {/* Content */}
                <div className="post-content prose prose-lg max-w-none">
                  <MarkdownContent content={content} />
                </div>

                {/* Tags */}
                {frontmatter.tags.length > 0 && (
                  <div className="post-tags mt-8 pt-6 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {frontmatter.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                          className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                <CommentSection slug={slug} />
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Author Box */}
                  <div className="bg-bg-light rounded-lg p-6">
                    <h3 className="font-heading font-semibold text-h4 mb-3">
                      About the Author
                    </h3>
                    <p className="text-body-color text-sm">
                      <strong>{frontmatter.author}</strong>
                    </p>
                    <p className="text-body-color text-sm mt-2">
                      Author of this article.
                    </p>
                  </div>

                  {/* Categories */}
                  {categories.length > 0 && (
                    <div className="bg-bg-light rounded-lg p-6">
                      <h3 className="font-heading font-semibold text-h4 mb-3">
                        Categories
                      </h3>
                      <ul className="space-y-2">
                        {categories.map((cat) => (
                          <li key={cat.slug}>
                            <Link
                              href={`/category/${cat.slug}`}
                              className="text-sm text-body-color hover:text-primary transition-colors"
                            >
                              {cat.name} ({cat.count})
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="axil-section-gap">
            <div className="container mx-auto px-4">
              <RelatedPosts posts={relatedPosts.map(p => p.frontmatter)} title="Related Posts" />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

// Generate static params for all posts
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.frontmatter.slug,
  }));
}
