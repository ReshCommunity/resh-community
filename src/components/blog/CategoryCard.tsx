'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/types/content';

export interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="category-card"
    >
      <div className="category-card-inner">
        {category.image ? (
          <div className="category-card-icon-wrapper">
            <Image
              src={category.image}
              alt={category.name}
              width={120}
              height={120}
              className="category-card-icon"
            />
          </div>
        ) : (
          <div className="category-card-default">
            <div className="category-card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H12L10 5H5C3.89543 5 3 5.89543 3 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}
        <div className="category-card-content">
          <h3 className="category-card-name">{category.name}</h3>
          <span className="category-card-count">
            {category.count} {category.count === 1 ? 'Post' : 'Posts'}
          </span>
        </div>
      </div>
    </Link>
  );
}
