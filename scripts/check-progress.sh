#!/bin/bash
# Check which posts still need images

echo "=== Posts Still Needing Images ==="
echo ""

# Count total MDX files and how many have featuredImage
total=$(ls -1 content/posts/*.mdx 2>/dev/null | wc -l)
with_image=$(grep -l "featuredImage:" content/posts/*.mdx 2>/dev/null | wc -l)

echo "Total posts: $total"
echo "Posts with images: $with_image"
echo "Still needed: $((total - with_image))"
echo ""

# Show some posts without images
echo "=== Posts Without Images (first 10) ==="
grep -L "featuredImage:" content/posts/*.mdx 2>/dev/null | head -10 | while read file; do
  basename "$file" .mdx
done
