'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  homeLabel?: string;
  homeHref?: string;
  separator?: React.ReactNode;
  className?: string;
}

/**
 * Breadcrumb navigation component for showing content hierarchy
 *
 * Usage:
 *
 * 1. Automatic (from URL):
 * <Breadcrumb />
 *
 * 2. Manual with custom items:
 * <Breadcrumb
 *   items={[
 *     { label: 'Crypto 101', href: '/category/crypto-101' },
 *     { label: 'What is Bitcoin?', href: '/what-is-bitcoin', current: true }
 *   ]}
 * />
 *
 * 3. In blog post with frontmatter data:
 * <Breadcrumb
 *   items={[
 *     { label: category, href: `/category/${categorySlug}` },
 *     { label: title, href: `/${slug}`, current: true }
 *   ]}
 * />
 */
export function Breadcrumb({
  items,
  homeLabel = 'Home',
  homeHref = '/',
  separator = <ChevronRight className="w-4 h-4" />,
  className = '',
}: BreadcrumbProps) {
  const pathname = usePathname();

  // If no items provided, generate from URL pathname
  const breadcrumbItems: BreadcrumbItem[] = items || generateFromPath(pathname);

  // Ensure home is first
  const allItems = [
    { label: homeLabel, href: homeHref },
    ...breadcrumbItems,
  ];

  return (
    <nav
      className={`breadcrumb flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 py-4 ${className}`}
      aria-label="Breadcrumb navigation"
    >
      <ol className="breadcrumb-list flex items-center flex-wrap gap-1">
        {allItems.map((item, index) => (
          <li
            key={`${item.href}-${index}`}
            className="breadcrumb-item flex items-center gap-1"
          >
            {index > 0 && (
              <span className="breadcrumb-separator" aria-hidden="true">
                {separator}
              </span>
            )}
            {item.current ? (
              <span className="breadcrumb-current font-medium text-gray-900 dark:text-gray-100">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="breadcrumb-link hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Generate breadcrumb items from URL pathname
 */
function generateFromPath(pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];

  // Remove trailing slash and split by /
  const pathParts = pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean);

  // Build hierarchical breadcrumbs
  let buildPath = '';
  pathParts.forEach((part, index) => {
    buildPath += `/${part}`;

    // Format the label (convert slugs to readable text)
    const label = formatSlugToLabel(part);

    // Current page is the last item
    const isCurrent = index === pathParts.length - 1;

    items.push({
      label,
      href: buildPath,
      current: isCurrent,
    });
  });

  return items;
}

/**
 * Convert slug to readable label
 * Examples:
 * - "what-is-bitcoin" -> "What is Bitcoin?"
 * - "crypto-101" -> "Crypto 101"
 * - "how-to-buy-bitcoin" -> "How to Buy Bitcoin?"
 */
function formatSlugToLabel(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate breadcrumb items from blog post frontmatter
 */
export function generatePostBreadcrumb(
  title: string,
  slug: string,
  category: string,
  categorySlug?: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];

  // Add category if present
  if (category && categorySlug) {
    items.push({
      label: category,
      href: `/category/${categorySlug}`,
    });
  }

  // Add current post
  items.push({
    label: title,
    href: `/${slug}`,
    current: true,
  });

  return items;
}

export default Breadcrumb;
