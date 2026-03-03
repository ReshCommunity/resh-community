import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageTitle } from '@/components/layout/PageTitle';
import { SearchForm } from '@/components/ui/SearchForm';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { searchPosts } from '@/lib/search';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Resh Community Blog for articles on crypto, blockchain, and more.',
};

interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';

  return (
    <>
      <Header />
      <main>
        <PageTitle
          title="Search"
          subtitle="Search our blog"
          breadcrumbs={[
            { name: 'Home', href: '/' },
            { name: 'Search', href: '/search' },
          ]}
        />

        <div className="axil-section-gap bg-color-white">
          <div className="container">
            {/* Search Form */}
            <div className="max-w-2xl mx-auto mb-12">
              <SearchForm initialValue={query} />
            </div>

            {/* Search Results */}
            <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
              <SearchResults query={query} />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

async function SearchResults({ query }: { query: string }) {
  // Import posts and use improved search
  const { getAllPosts } = await import('@/lib/content');
  const posts = await getAllPosts();

  const searchResults = searchPosts(posts, query);

  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-body-color">
          Enter a search term above to find articles
        </p>
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-body-color mb-4">
          No results found for "{query}"
        </p>
        <p className="text-body-color text-sm">
          Try different keywords or check for typos
        </p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="mb-8">
        <h3 className="title">
          {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{query}"
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.map(({ post, highlights }) => (
          <div key={post.frontmatter.slug} className="search-result-card">
            <a href={`/blog/${post.frontmatter.slug}`} className="block">
              {post.frontmatter.featured_image && (
                <div className="thumbnail mb-4">
                  <img
                    src={post.frontmatter.featured_image}
                    alt={post.frontmatter.title || 'Post'}
                    className="w-full rounded-lg"
                  />
                </div>
              )}
              <h4
                className="title mb-2"
                dangerouslySetInnerHTML={{ __html: highlights.title || post.frontmatter.title }}
              />
              {post.frontmatter.excerpt && highlights.excerpt && (
                <p
                  className="text-body-color text-sm"
                  dangerouslySetInnerHTML={{ __html: highlights.excerpt }}
                />
              )}
              {post.frontmatter.excerpt && !highlights.excerpt && (
                <p className="text-body-color text-sm">
                  {post.frontmatter.excerpt.substring(0, 150)}...
                </p>
              )}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
