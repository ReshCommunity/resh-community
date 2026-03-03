import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FeaturedCarousel } from '@/components/blog/FeaturedCarousel';
import { CategoryCard } from '@/components/blog/CategoryCard';
import { CategoryIconLink } from '@/components/blog/CategoryIconLink';
import { HorizontalPostCard } from '@/components/blog/HorizontalPostCard';
import { Sidebar } from '@/components/widgets/Sidebar';
import { getAllPosts, getAllCategories } from '@/lib/content';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Resh Blog - Resh Community Blog! Latest & Greatest Crypto News!',
  description: 'Resh Community Blog! Latest & Greatest Crypto News!',
};

export default async function HomePage() {
  const recentPosts = await getAllPosts();
  const categories = await getAllCategories();

  // Featured posts: 3 newest posts for carousel
  const featuredPosts = recentPosts.slice(0, 3);

  // Main posts: posts after featured
  const mainPosts = recentPosts.slice(3, 9);

  return (
    <>
      <Header />

      <main className="main-content">
        {/* Featured Carousel Section - 3 Newest Posts */}
        {featuredPosts.length > 0 && (
          <div className="featured-carousel-section axil-section-gap bg-color-lightest">
            <div className="container">
              <FeaturedCarousel posts={featuredPosts.map(p => p.frontmatter)} />
            </div>
          </div>
        )}

        {/* Categories - Icon Links */}
        {categories.length > 0 && (
          <div className="axil-categories-area axil-section-gap bg-color-white pb--0">
            <div className="container">
              <div className="category-icons-wrapper">
                {categories.slice(0, 4).map((category) => (
                  <CategoryIconLink key={category.slug} category={category} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Posts with Sidebar */}
        <div className="axil-blog-area axil-section-gap bg-color-white">
          <div className="container">
            <div className="row">
              {/* Main Content */}
              <div className="col-lg-8 col-md-12 col-12">
                <div className="page-title mb--30">
                  <h2 className="title">Latest Posts</h2>
                </div>

                <div className="horizontal-posts-grid">
                  {mainPosts.map((post) => (
                    <div key={post.frontmatter.slug} className="horizontal-post-item">
                      <HorizontalPostCard post={post.frontmatter} />
                    </div>
                  ))}
                </div>

                {mainPosts.length === 0 && featuredPosts.length > 3 && (
                  <div className="horizontal-posts-grid">
                    {featuredPosts.slice(3).map((post) => (
                      <div key={post.frontmatter.slug} className="horizontal-post-item">
                        <HorizontalPostCard post={post.frontmatter} />
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-center mt--40">
                  <Link href="/blog" className="axil-button btn-fill-primary">
                    <span className="hover-flip-item">
                      <span data-text="View All Posts">View All Posts</span>
                    </span>
                  </Link>
                </div>
              </div>

              {/* Sidebar */}
              <div className="col-lg-4 col-md-12 col-12 mt_sm--30">
                <Sidebar />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="axil-call-to-action axil-section-gap bg-color-primary">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="axil-call-to-action-wrapper text-white text-center">
                  <h2 className="title mb--20">
                    Stay Updated with Crypto News
                  </h2>
                  <p className="mid-text mb--30">
                    Get the latest cryptocurrency news and insights delivered to your inbox.
                  </p>
                  <form className="d-flex justify-content-center axil-subscribe-form">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="form-control"
                      style={{ maxWidth: '400px' }}
                      required
                    />
                    <button
                      type="submit"
                      className="axil-button btn-large btn-secondary"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
