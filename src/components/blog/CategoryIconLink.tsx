'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Category } from '@/types/content';

export interface CategoryIconLinkProps {
  category: Category;
}

export function CategoryIconLink({ category }: CategoryIconLinkProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/category/${category.slug}`}
      className="category-icon-link"
      title={category.name}
    >
      {category.image && !imageError ? (
        <Image
          src={category.image}
          alt={category.name}
          width={80}
          height={80}
          className="category-icon-img"
          onError={() => setImageError(true)}
          unoptimized
        />
      ) : (
        <div className="category-icon-fallback">
          <span className="category-icon-initial">
            {category.name.charAt(0)}
          </span>
        </div>
      )}
      <span className="category-icon-name">{category.name}</span>

      <style jsx>{`
        .category-icon-fallback {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #FF6600 0%, #D93E40 100%);
          border-radius: 50%;
          color: #ffffff;
          font-weight: 700;
          font-size: 32px;
        }
        .category-icon-initial {
          text-transform: uppercase;
        }
      `}</style>
    </Link>
  );
}
