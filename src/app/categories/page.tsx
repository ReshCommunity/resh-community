import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageTitle } from '@/components/layout/PageTitle';
import { getAllCategories } from '@/lib/content';
import { Metadata } from 'next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder } from '@fortawesome/free-solid-svg-icons';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse all categories on Resh Community - Find topics covering Bitcoin, Ethereum, DeFi, NFTs, and more.',
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <>
      <Header />
      <main>
        <PageTitle
          title="Categories"
          subtitle="Browse by Topic"
          breadcrumbs={[
            { name: 'Home', href: '/' },
            { name: 'Categories', href: '/categories' },
          ]}
        />

        <div className="axil-section-gap">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="content-wrapper">
                  <div className="mb-8">
                    <p className="text-body-color">
                      Explore our comprehensive collection of cryptocurrency and blockchain topics.
                      Click on any category to view related articles and insights.
                    </p>
                  </div>

                  {categories.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-body-color">No categories found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {categories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/category/${category.slug}`}
                          className="group block bg-bg-light rounded-lg p-6 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-primary/20"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                              <FontAwesomeIcon icon={faFolder} className="text-primary text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-heading font-semibold text-h5 mb-2 text-heading-color group-hover:text-primary transition-colors">
                                {category.name}
                              </h3>
                              {category.description && (
                                <p className="text-sm text-body-color line-clamp-2 mb-3">
                                  {category.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-sm text-body-color">
                                <span className="font-medium">{category.count}</span>
                                <span>post{category.count !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="bg-bg-light rounded-lg p-6">
                  <h3 className="font-heading font-semibold text-h4 mb-4">
                    Quick Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-border-color">
                      <span className="text-sm text-body-color">Total Categories</span>
                      <span className="font-heading font-semibold text-h5 text-primary">
                        {categories.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-border-color">
                      <span className="text-sm text-body-color">Total Posts</span>
                      <span className="font-heading font-semibold text-h5 text-primary">
                        {categories.reduce((sum, cat) => sum + cat.count, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-body-color">Most Popular</span>
                      <span className="font-heading font-semibold text-h6 text-primary text-right">
                        {categories.length > 0
                          ? categories.reduce((max, cat) =>
                              cat.count > max.count ? cat : max
                            ).name
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-bg-light rounded-lg p-6 mt-6">
                  <h3 className="font-heading font-semibold text-h4 mb-4">
                    Browse Tags
                  </h3>
                  <p className="text-sm text-body-color mb-4">
                    Looking for something more specific? Browse our tags to find exactly what you're looking for.
                  </p>
                  <Link
                    href="/tags"
                    className="inline-block bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    View All Tags
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
