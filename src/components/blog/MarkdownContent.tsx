import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import Link from 'next/link';

interface MarkdownContentProps {
  content: string;
}

// Pre-process content to handle WordPress formatting issues
function preprocessContent(content: string): string {
  return content
    // Replace literal \n with actual newlines
    .replace(/\\n/g, '\n')
    // Fix escaped quotes in HTML attributes (this is the main fix)
    .replace(/\\"/g, '"')
    // Fix WordPress non-breaking spaces
    .replace(/&nbsp;/gi, ' ')
    // Fix WordPress smart quotes
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Fix WordPress em dashes
    .replace(/—/g, '—')
    // Fix multiple consecutive spaces (except in code blocks)
    .replace(/  +/g, ' ')
    // Fix empty paragraphs
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const processedContent = preprocessContent(content);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSlug]}
      skipHtml={false}
      components={{
        // Handle links - convert WordPress-style links to Next.js Link
        a: ({ node, href, children, ...props }) => {
          // Check if it's an internal link to resh.community
          if (href && href.includes('resh.community')) {
            try {
              // Extract the path from the URL
              const url = new URL(href);
              const pathname = url.pathname;

              return (
                <Link href={pathname} className="text-primary hover:underline" {...props}>
                  {children}
                </Link>
              );
            } catch {
              // If URL parsing fails, render as regular link
            }
          }

          // External link
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" {...props}>
              {children}
            </a>
          );
        },
        // Handle headings with proper IDs
        h1: ({ children, ...props }) => (
          <h1 className="title text-h2 font-bold mb-4" {...props}>
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2 className="title text-h3 font-bold mb-3 mt-6" {...props}>
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3 className="title text-h4 font-semibold mb-3 mt-5" {...props}>
            {children}
          </h3>
        ),
        h4: ({ children, ...props }) => (
          <h4 className="title text-h5 font-semibold mb-2 mt-4" {...props}>
            {children}
          </h4>
        ),
        // Handle paragraphs
        p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
        // Handle unordered lists
        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
        // Handle ordered lists
        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
        // Handle list items
        li: ({ children }) => <li>{children}</li>,
        // Handle blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-gray-600 dark:text-gray-400">
            {children}
          </blockquote>
        ),
        // Handle code blocks
        pre: ({ children }) => (
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4">
            {children}
          </pre>
        ),
        // Handle inline code
        code: ({ children, className }) => {
          // If it's a block code (has className), just render it as-is
          if (className) {
            return <code className={className}>{children}</code>;
          }
          // Inline code
          return (
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
              {children}
            </code>
          );
        },
        // Handle images
        img: ({ src, alt, ...props }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className="rounded-lg my-4 max-w-full h-auto"
            loading="lazy"
            {...props}
          />
        ),
        // Handle strong/bold
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
        // Handle italic
        em: ({ children }) => <em className="italic">{children}</em>,
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
}
