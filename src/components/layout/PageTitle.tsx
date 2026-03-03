import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ name: string; href: string }>;
  backgroundClass?: string;
}

export function PageTitle({
  title,
  subtitle,
  breadcrumbs = [],
  backgroundClass = 'bg-bg-light',
}: PageTitleProps) {
  const defaultBreadcrumbs = [
    { name: 'Home', href: '/' },
    ...breadcrumbs,
  ];

  return (
    <div className={`page-title-wrapper axil-section-gapBottom ${backgroundClass}`}>
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <div className="text-center">
          {subtitle && (
            <span className="inline-block px-4 py-1 mb-4 text-sm font-din-alternate font-medium rounded-full bg-primary/10 text-primary">
              {subtitle}
            </span>
          )}
          <h1 className="font-heading font-bold text-h2 md:text-h1 text-heading-color mb-4">
            {title}
          </h1>
        </div>

        {/* Breadcrumb */}
        {defaultBreadcrumbs.length > 1 && (
          <div className="breadcrumb-wrapper mt-6">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center justify-center flex-wrap gap-2 text-sm font-din-alternate">
                {defaultBreadcrumbs.map((crumb, index) => (
                  <li key={crumb.href} className="flex items-center gap-2">
                    {index === 0 && <Home className="w-4 h-4" />}
                    {index === defaultBreadcrumbs.length - 1 ? (
                      <span className="text-body-color font-medium">{crumb.name}</span>
                    ) : (
                      <>
                        <Link
                          href={crumb.href}
                          className="text-body-color hover:text-primary transition-colors"
                        >
                          {crumb.name}
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
