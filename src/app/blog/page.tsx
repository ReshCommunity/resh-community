import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageTitle } from '@/components/layout/PageTitle';
import { HorizontalPostCard } from '@/components/blog/HorizontalPostCard';
import { Pagination } from '@/components/blog/Pagination';
import { Sidebar } from '@/components/widgets/Sidebar';
import { getAllPosts, getPaginatedPosts, getAllCategories } from '@/lib/content';
import { Metadata } from 'next';

// Disable static optimization for this page to allow pagination to work
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Resh Community Blog! Latest & Greatest Crypto News!',
};

interface BlogPageProps {
  searchParams: { page?: string };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = parseInt(searchParams.page || '1', 10);
  const { posts, totalPages, totalPosts } = await getPaginatedPosts(page, 10);
  const categories = await getAllCategories();

  return (
    <>
      <Header />
      <main>
        <PageTitle
          title="Blog"
          subtitle="Latest Crypto News & Insights"
          breadcrumbs={[
            { name: 'Home', href: '/' },
            { name: 'Blog', href: '/blog' },
          ]}
        />

        <div className="axil-blog-area axil-section-gap bg-color-white">
          <div className="container">
            <div className="row">
              {/* Main Content */}
              <div className="col-lg-8 col-md-12 col-12">
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-body-color">No posts found.</p>
                  </div>
                ) : (
                  <>
                    <div className="page-title mb--30">
                      <h2 className="title">All Posts</h2>
                      <p className="subtitle">
                        Showing {(page - 1) * 10 + 1} - {Math.min(page * 10, totalPosts)} of {totalPosts} posts
                      </p>
                    </div>
                    <div className="horizontal-posts-grid">
                      {posts.map((post) => (
                        <div key={post.frontmatter.slug} className="horizontal-post-item">
                          <HorizontalPostCard post={post.frontmatter} />
                        </div>
                      ))}
                    </div>
                    <div className="mt--40">
                      <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        basePath="/blog"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <div className="col-lg-4 col-md-12 col-12 mt_sm--30">
                <Sidebar />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
