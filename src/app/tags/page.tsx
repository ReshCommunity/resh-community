import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageTitle } from '@/components/layout/PageTitle';
import { getAllTags } from '@/lib/content';
import { Metadata } from 'next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag } from '@fortawesome/free-solid-svg-icons';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Tags',
  description: 'Browse all tags on Resh Community - Explore specific cryptocurrency and blockchain topics.',
};

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <>
      <Header />
      <main>
        <PageTitle
          title="Tags"
          subtitle="Explore Topics"
          breadcrumbs={[
            { name: 'Home', href: '/' },
            { name: 'Tags', href: '/tags' },
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
                      Explore our comprehensive tag collection to find specific topics within the cryptocurrency
                      and blockchain space. Each tag represents a specific theme, technology, or trend.
                    </p>
                  </div>

                  {tags.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-body-color">No tags found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tags.map((tag) => (
                        <Link
                          key={tag.slug}
                          href={`/tag/${tag.slug}`}
                          className="group block bg-bg-light rounded-lg p-6 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-primary/20"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                              <FontAwesomeIcon icon={faTag} className="text-primary text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-heading font-semibold text-h5 mb-2 text-heading-color group-hover:text-primary transition-colors">
                                #{tag.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-body-color">
                                <span className="font-medium">{tag.count}</span>
                                <span>post{tag.count !== 1 ? 's' : ''}</span>
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
                      <span className="text-sm text-body-color">Total Tags</span>
                      <span className="font-heading font-semibold text-h5 text-primary">
                        {tags.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-border-color">
                      <span className="text-sm text-body-color">Total Tagged Posts</span>
                      <span className="font-heading font-semibold text-h5 text-primary">
                        {tags.reduce((sum, tag) => sum + tag.count, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-body-color">Trending Topic</span>
                      <span className="font-heading font-semibold text-h6 text-primary text-right">
                        {tags.length > 0
                          ? '#' + tags.reduce((max, tag) =>
                              tag.count > max.count ? tag : max
                            ).name
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-bg-light rounded-lg p-6 mt-6">
                  <h3 className="font-heading font-semibold text-h4 mb-4">
                    Browse Categories
                  </h3>
                  <p className="text-sm text-body-color mb-4">
                    Prefer broader topics? Browse our categories for more general content areas.
                  </p>
                  <Link
                    href="/categories"
                    className="inline-block bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    View Categories
                  </Link>
                </div>

                {/* Tag Cloud */}
                {tags.length > 0 && (
                  <div className="bg-bg-light rounded-lg p-6 mt-6">
                    <h3 className="font-heading font-semibold text-h4 mb-4">
                      Popular Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.slice(0, 15).map((tag) => (
                        <Link
                          key={tag.slug}
                          href={`/tag/${tag.slug}`}
                          className="inline-block px-3 py-1 bg-white dark:bg-bg-dark border border-border-color rounded-full text-sm text-body-color hover:text-primary hover:border-primary transition-colors"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
