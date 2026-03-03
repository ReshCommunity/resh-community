#!/bin/bash
# Helper script to update frontmatter after downloading Bing images
# Usage: ./scripts/bing-update-helper.sh [slug]

if [ -z "$1" ]; then
  echo "Usage: $0 [slug]"
  echo "Example: $0 best-crypto-youtube-accounts-to-follow"
  echo ""
  echo "Quick check: Show posts needing images"
  grep -L "featuredImage:" /Users/marcangeloh/Desktop/resh-community/content/posts/*.mdx 2>/dev/null | head -10 | while read file; do
    basename "$file" .mdx
  done
  exit 1
fi

SLUG="$1"
MDX_PATH="/Users/marcangeloh/Desktop/resh-community/content/posts/${SLUG}.mdx"

# Check if MDX file exists
if [ ! -f "$MDX_PATH" ]; then
  echo "❌ Error: MDX file not found"
  echo "   Looking for: $MDX_PATH"
  echo ""
  echo "This post may not exist. Here are similar posts:"
  ls /Users/marcangeloh/Desktop/resh-community/content/posts/*.mdx | grep -i "$1" | head -5
  exit 1
fi

FILENAME="${SLUG}.webp"

echo "Updating frontmatter for: $SLUG"
python3 /Users/marcangeloh/Desktop/resh-community/scripts/update-frontmatter-image.py \
  --slug "$SLUG" \
  --filename "$FILENAME"

echo ""
echo "✓ Done! Image linked in frontmatter."
