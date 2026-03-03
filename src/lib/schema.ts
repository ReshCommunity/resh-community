/**
 * Extract FAQs from blog post content for schema markup
 * Looks for FAQ sections in common formats:
 * - ### Q: ... / A: ...
 * - ### Question / ### Answer
 * - ## Frequently Asked Questions sections
 */

export interface FAQ {
  question: string;
  answer: string;
}

export function extractFAQs(content: string): FAQ[] {
  const faqs: FAQ[] = [];

  // Pattern 1: ### Q: / A: format
  const qaPattern = /###\s*[Qq]\s*:?\s*([^\n]+)\s*\n\s*([Aa]\s*:?\s*[^#\n]+(?:\n(?!###)[^\n]+)*)/g;
  let match;

  while ((match = qaPattern.exec(content)) !== null) {
    const question = match[1].trim();
    const answer = match[2].trim().replace(/^[Aa]\s*:?\s*/, '');
    faqs.push({ question, answer });
  }

  // Pattern 2: ### Question ... ### Answer format
  const questionAnswerPattern = /###\s*[Qq]uestion\s*:?\s*([^\n]+)\s*[^#]*###\s*[Aa]nswer\s*:?\s*([^#\n]+(?:\n(?!###)[^\n]+)*)/g;
  while ((match = questionAnswerPattern.exec(content)) !== null) {
    const question = match[1].trim();
    const answer = match[2].trim();
    faqs.push({ question, answer });
  }

  // Pattern 3: Look for FAQ sections with Q/A pairs
  const faqSectionPattern = /##\s*[Ff]requently\s+[Aa]sked\s+[Qq]uestions\s*([\s\S]*?)(?=##\s|$)/g;
  const faqMatch = faqSectionPattern.exec(content);

  if (faqMatch) {
    const faqSection = faqMatch[1];
    // Extract Q: ... / A: pairs within FAQ section
    const nestedQaPattern = /###\s*[Qq]\s*:?\s*([^\n]+)\s*\n\s*([Aa]\s*:?\s*[^#\n]+(?:\n(?!###)[^\n]+)*)/g;
    while ((match = nestedQaPattern.exec(faqSection)) !== null) {
      const question = match[1].trim();
      const answer = match[2].trim().replace(/^[Aa]\s*:?\s*/, '');
      faqs.push({ question, answer });
    }
  }

  // Deduplicate FAQs
  const seen = new Set<string>();
  return faqs.filter((faq) => {
    const key = `${faq.question}|${faq.answer.substring(0, 100)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Generate article schema data from frontmatter
 */
export function generateArticleSchema(frontmatter: any, slug: string) {
  return {
    title: frontmatter.title,
    description: frontmatter.excerpt || frontmatter.seo?.description,
    images: frontmatter.featured_image ? [frontmatter.featured_image] : [],
    datePublished: frontmatter.date || new Date().toISOString(),
    dateModified: frontmatter.modified || frontmatter.date || new Date().toISOString(),
    author: frontmatter.author || 'Resh Community',
    url: `https://resh.community/blog/${slug}`,
    publisherName: 'Resh Community',
    publisherLogo: 'https://resh.community/logo.png',
  };
}

/**
 * Generate breadcrumb schema data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return { items };
}

/**
 * Generate website schema data
 */
export function generateWebsiteSchema() {
  return {
    name: 'Resh Community',
    url: 'https://resh.community',
    description: 'Resh Community Blog! Latest & Greatest Crypto News! Learn about Bitcoin, Ethereum, DeFi, trading, and blockchain technology.',
  };
}

/**
 * Generate organization schema data
 */
export function generateOrganizationSchema() {
  return {
    name: 'Resh Community',
    url: 'https://resh.community',
    logo: 'https://resh.community/logo.png',
    description: 'Resh Community Blog! Latest & Greatest Crypto News! Learn about Bitcoin, Ethereum, DeFi, trading, and blockchain technology.',
    sameAs: [
      'https://twitter.com/reshcommunity',
      'https://reddit.com/r/reshcommunity/',
      'https://instagram.com/reshcommunity',
      'https://t.me/resh_community',
      'https://facebook.com/reshcommunity',
    ],
  };
}
