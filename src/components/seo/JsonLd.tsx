export interface JsonLdProps {
  type: 'Article' | 'WebPage' | 'Website' | 'BreadcrumbList' | 'Organization' | 'FAQPage';
  data: Record<string, any>;
}

export function JsonLd({ type, data }: JsonLdProps) {
  const generateSchema = () => {
    switch (type) {
      case 'Article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data.title,
          description: data.description,
          image: data.images || [],
          datePublished: data.datePublished,
          dateModified: data.dateModified || data.datePublished,
          author: {
            '@type': 'Person',
            name: data.author,
          },
          publisher: {
            '@type': 'Organization',
            name: data.publisherName || 'Resh Blog',
            logo: {
              '@type': 'ImageObject',
              url: data.publisherLogo || '/logo.png',
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': data.url,
          },
        };

      case 'WebPage':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: data.name,
          description: data.description,
          url: data.url,
          datePublished: data.datePublished,
          dateModified: data.dateModified,
          inLanguage: data.language || 'en-US',
          isPartOf: {
            '@type': 'WebSite',
            url: data.siteUrl || 'https://resh.community',
            name: data.siteName || 'Resh Blog',
          },
        };

      case 'Website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: data.name || 'Resh Blog',
          url: data.url || 'https://resh.community',
          description: data.description || 'Resh Community Blog! Latest & Greatest Crypto News!',
          publisher: {
            '@type': 'Organization',
            name: data.name || 'Resh Blog',
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${data.url || 'https://resh.community'}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        };

      case 'BreadcrumbList':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.items?.map((item: { name: string; url: string }, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        };

      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: data.name || 'Resh Community',
          url: data.url || 'https://resh.community',
          logo: data.logo || '/logo.png',
          description: data.description || 'Resh Community Blog! Latest & Greatest Crypto News!',
          sameAs: data.sameAs || [],
          contactPoint: data.contactPoint
            ? {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                email: data.contactPoint.email,
              }
            : undefined,
        };

      case 'FAQPage':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data.faqs?.map((faq: { question: string; answer: string }) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        };

      default:
        return null;
    }
  };

  const schema = generateSchema();

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2),
      }}
    />
  );
}
