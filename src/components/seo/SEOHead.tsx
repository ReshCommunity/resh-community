import { NextSeo, ArticleJsonLd } from 'next-seo';

export interface SEOHeadProps {
  title: string;
  description: string;
  canonical: string;
  openGraph?: {
    title: string;
    description: string;
    images: { url: string; width?: number; height?: number; alt?: string }[];
    type: 'website' | 'article';
  };
  twitter?: {
    cardType?: 'summary' | 'summary_large_image';
    title?: string;
    description?: string;
    image?: string;
  };
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    authors: string[];
    tags?: string[];
    section?: string;
  };
  noindex?: boolean;
  nofollow?: boolean;
}

export function SEOHead({
  title,
  description,
  canonical,
  openGraph,
  twitter,
  article,
  noindex = false,
  nofollow = false,
}: SEOHeadProps) {
  const siteName = 'Resh Blog';
  const defaultTitle = `${title} | ${siteName}`;

  return (
    <>
      <NextSeo
        title={defaultTitle}
        description={description}
        canonical={canonical}
        noindex={noindex}
        nofollow={nofollow}
        openGraph={
          openGraph && {
            title: openGraph.title || defaultTitle,
            description: openGraph.description || description,
            url: canonical,
            siteName,
            images: openGraph.images,
            type: openGraph.type,
          }
        }
        twitter={
          twitter && {
            cardType: twitter.cardType || 'summary_large_image',
          }
        }
      />
      {article && (
        <ArticleJsonLd
          url={canonical}
          title={title}
          images={openGraph?.images.map((img) => img.url) || []}
          datePublished={article.publishedTime}
          dateModified={article.modifiedTime}
          authorName={article.authors}
          publisherName={siteName}
          description={description}
          isAccessibleForFree={true}
        />
      )}
    </>
  );
}
