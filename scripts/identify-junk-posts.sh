#!/bin/bash
# Identify junk posts that can be deleted

echo "=== JUNK POSTS TO DELETE ==="
echo ""
echo "1. WordPress imported (numeric IDs):"
ls /Users/marcangeloh/Desktop/resh-community/content/posts/*.mdx | xargs -n1 basename | grep -E "^[0-9]+$" | sed 's/\.mdx$//'

echo ""
echo "2. Product pages (merchandise):"
ls /Users/marcangeloh/Desktop/resh-community/content/posts/*.mdx | xargs -n1 basename | grep -E "(beanie|belt|cap|hoodie|shirt|polo|pixel|sunglasses)" | sed 's/\.mdx$//'

echo ""
echo "3. Template/form pages:"
ls /Users/marcangeloh/Desktop/resh-community/content/posts/*.mdx | xargs -n1 basename | grep -E "(album|contact-form|create-post|single-page|wp-global|default-kit|field_|group_)" | sed 's/\.mdx$//'

echo ""
echo "4. Empty/corrupt posts:"
for file in /Users/marcangeloh/Desktop/resh-community/content/posts/*.mdx; do
  if ! grep -q "title:" "$file" || grep -q 'title: ""' "$file"; then
    basename "$file" .mdx
  fi
done
