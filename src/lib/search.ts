import type { Post } from '@/types/content';

/**
 * Search result with relevance score
 */
export interface SearchResult {
  post: Post;
  score: number;
  highlights: {
    title?: string;
    excerpt?: string;
  };
}

/**
 * Tokenize text into words, removing special characters and normalizing
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1); // Filter out single characters
}

/**
 * Calculate relevance score based on match position and field importance
 */
function calculateScore(
  matches: {
    inTitle: boolean;
    inExcerpt: boolean;
    inContent: boolean;
    inCategory: boolean;
    inTags: boolean;
    exactTitleMatch: boolean;
    exactWordMatch: boolean;
    wordMatches: number;
  }
): number {
  let score = 0;

  // Title matches are most important
  if (matches.exactTitleMatch) score += 100;
  if (matches.inTitle) score += 50;

  // Exact word matches get bonus
  if (matches.exactWordMatch) score += 20;

  // Word matches in content
  score += matches.wordMatches * 5;

  // Other fields
  if (matches.inExcerpt) score += 15;
  if (matches.inCategory) score += 10;
  if (matches.inTags) score += 10;
  if (matches.inContent) score += 2;

  return score;
}

/**
 * Highlight matching words in text
 */
function highlightText(text: string, queryWords: string[], maxLength: number = 200): string {
  const lowerText = text.toLowerCase();
  const words = tokenize(text);

  // Find positions of matching words
  const matches: Array<{ word: string; index: number }> = [];
  let currentIndex = 0;

  words.forEach((word, i) => {
    if (queryWords.some(qw => word.includes(qw) || qw.includes(word))) {
      matches.push({ word, index: i });
    }
  });

  if (matches.length === 0) {
    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  }

  // Create excerpt with highlighted matches
  let result = text;
  matches.forEach(match => {
    const regex = new RegExp(`(${match.word})`, 'gi');
    result = result.replace(regex, '<mark>$1</mark>');
  });

  // Truncate if too long
  if (result.length > maxLength) {
    result = result.substring(0, maxLength);
    const lastMark = result.lastIndexOf('<mark>');
    if (lastMark > maxLength - 50) {
      result = result.substring(0, lastMark);
    }
    result += '...';
  }

  return result;
}

/**
 * Search posts with improved relevance scoring
 */
export function searchPosts(posts: Post[], query: string): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const queryWords = tokenize(query);
  const queryLower = query.toLowerCase().trim();

  const results: SearchResult[] = posts.map(post => {
    const title = (post.frontmatter.title || '').toLowerCase();
    const excerpt = (post.frontmatter.excerpt || '').toLowerCase();
    const content = (post.content || '').toLowerCase();
    const category = (post.frontmatter.category || '').toLowerCase();
    const tags = (post.frontmatter.tags || []).map(t => t.toLowerCase()).join(' ');
    const allText = `${title} ${excerpt} ${content} ${category} ${tags}`;

    // Check for matches
    const exactTitleMatch = title === queryLower;
    const exactWordMatch = queryWords.some(qw => title === qw);
    const inTitle = title.includes(queryLower) || queryWords.some(qw => title.includes(qw));
    const inExcerpt = excerpt.includes(queryLower) || queryWords.some(qw => excerpt.includes(qw));
    const inContent = content.includes(queryLower) || queryWords.some(qw => content.includes(qw));
    const inCategory = category.includes(queryLower) || queryWords.some(qw => category.includes(qw));
    const inTags = tags.includes(queryLower) || queryWords.some(qw => tags.includes(qw));

    // Count word matches across all content
    const wordMatches = queryWords.reduce((count, queryWord) => {
      const regex = new RegExp(queryWord, 'gi');
      const matches = allText.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);

    const hasMatch = inTitle || inExcerpt || inContent || inCategory || inTags;

    return {
      post,
      score: hasMatch ? calculateScore({
        inTitle,
        inExcerpt,
        inContent,
        inCategory,
        inTags,
        exactTitleMatch,
        exactWordMatch,
        wordMatches,
      }) : 0,
      highlights: {
        title: inTitle ? post.frontmatter.title : undefined,
        excerpt: highlightText(post.frontmatter.excerpt || '', queryWords),
      },
    };
  });

  // Filter out non-matches and sort by score (descending)
  return results
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Get search suggestions based on partial matches
 */
export function getSearchSuggestions(posts: Post[], query: string, limit: number = 5): string[] {
  if (!query.trim() || query.length < 2) {
    return [];
  }

  const queryLower = query.toLowerCase();
  const suggestions = new Set<string>();

  posts.forEach(post => {
    // Add title if it starts with or contains the query
    const title = post.frontmatter.title || '';
    if (title.toLowerCase().includes(queryLower)) {
      suggestions.add(title);
    }

    // Add matching tags
    post.frontmatter.tags?.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.add(tag);
      }
    });

    // Add category if it matches
    const category = post.frontmatter.category || '';
    if (category.toLowerCase().includes(queryLower)) {
      suggestions.add(category);
    }
  });

  return Array.from(suggestions).slice(0, limit);
}
