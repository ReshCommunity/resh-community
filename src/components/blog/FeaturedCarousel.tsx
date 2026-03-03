'use client';

import { useEffect, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Link from 'next/link';

export interface FeaturedCarouselPost {
  slug: string;
  title: string;
  excerpt?: string;
  featured_image?: string;
  date: string;
  category?: string;
  format?: 'standard' | 'gallery' | 'video' | 'audio' | 'quote' | 'link';
  custom_link?: string;
}

export interface FeaturedCarouselProps {
  posts: FeaturedCarouselPost[];
}

export function FeaturedCarousel({ posts }: FeaturedCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    // Auto-play with pause on hover
    const autoPlayInterval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => {
      clearInterval(autoPlayInterval);
    };
  }, [emblaApi, onSelect]);

  // Filter out link posts without custom_link
  const validPosts = posts.filter(
    post => post.format !== 'link' || (post.format === 'link' && post.custom_link)
  );

  if (validPosts.length === 0) return null;

  return (
    <div className="featured-carousel-wrapper">
      <div className="featured-carousel" ref={emblaRef}>
        <div className="featured-carousel-container">
          {validPosts.map((post) => {
            const isExternalLink = post.format === 'link' && !!post.custom_link;
            const postHref: string = isExternalLink && post.custom_link ? post.custom_link : `/blog/${post.slug}`;
            const linkProps = isExternalLink ? {
              target: '_blank',
              rel: 'noopener noreferrer'
            } : {};

            return (
              <div className="featured-carousel-slide" key={post.slug}>
                <Link href={postHref} className="featured-carousel-slide-link" {...linkProps}>
                  {post.featured_image && (
                    <div className="featured-carousel-image">
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-contain"
                        sizes="100vw"
                        priority={selectedIndex === validPosts.indexOf(post)}
                      />
                      <div className="featured-carousel-overlay"></div>
                    </div>
                  )}
                  <div className="featured-carousel-content">
                    {post.category && (
                      <span className="featured-carousel-category">
                        {post.category}
                      </span>
                    )}
                    <h2 className="featured-carousel-title">
                      {post.title}
                      {isExternalLink && <span className="external-arrow-carousel"> ↗</span>}
                    </h2>
                    {post.excerpt && (
                      <p className="featured-carousel-excerpt">
                        {post.excerpt}
                      </p>
                    )}
                    {isExternalLink && (
                      <span className="featured-carousel-external-badge">External Link</span>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      {validPosts.length > 1 && (
        <>
          <button
            className="featured-carousel-nav featured-carousel-nav-prev"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="featured-carousel-nav featured-carousel-nav-next"
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dot Indicators */}
          <div className="featured-carousel-dots">
            {validPosts.map((_, index) => (
              <button
                key={index}
                className={`featured-carousel-dot ${index === selectedIndex ? 'active' : ''}`}
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
