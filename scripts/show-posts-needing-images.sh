#!/bin/bash
# Show posts that don't have featured images

echo "=========================================="
echo "Posts That Need Featured Images"
echo "=========================================="
echo ""

count=0
grep -L "featuredImage:" /Users/marcangeloh/Desktop/resh-community/content/posts/*.mdx 2>/dev/null | while read mdx_file; do
  slug=$(basename "$mdx_file" .mdx)
  count=$((count + 1))
  
  # Skip numeric slugs and non-blog posts
  if [[ "$slug" =~ ^[0-9]+$ ]] || [[ "$slug" =~ (album|beanie|belt|cap|contact-form|create-post|hoodie|polo|pixel|shirt|sunglasses|wp-global) ]]; then
    continue
  fi
  
  echo "[$count] $slug"
  echo "    File: $mdx_file"
  echo ""
done | head -50

echo "=========================================="
echo "To add an image:"
echo "1. Generate at https://www.bing.com/images/create"
echo "2. Save to: public/images/posts/[slug].webp"
echo "3. Run: ./scripts/bing-update-helper.sh [slug]"
echo "=========================================="
