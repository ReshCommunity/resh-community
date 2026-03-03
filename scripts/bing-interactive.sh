#!/bin/bash
# Interactive Bing Image Creator helper
# Shows one prompt at a time and tracks progress

echo "=========================================="
echo "Bing Image Creator - Interactive Helper"
echo "=========================================="
echo ""
echo "Instructions:"
echo "1. Copy the prompt below"
echo "2. Go to https://www.bing.com/images/create"
echo "3. Paste & generate image"
echo "4. Download to: public/images/posts/[slug].webp"
echo "5. Run: ./scripts/bing-update-helper.sh [slug]"
echo "6. Press Enter here to continue to next"
echo "  (or type 's' to skip, 'q' to quit)"
echo ""
echo "=========================================="
echo ""

PROMPTS_FILE="/Users/marcangeloh/Desktop/resh-community/docs/ready-to-use-bing-prompts-existing-only.txt"

if [ ! -f "$PROMPTS_FILE" ]; then
  echo "Error: Prompts file not found"
  exit 1
fi

# Process the file - skip comments and empty lines
CURRENT=0
while IFS= read -r line; do
  # Skip empty lines and comments
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  
  # Extract slug and prompt (split by first |)
  slug="${line%%|*}"
  prompt="${line#*|}"
  
  CURRENT=$((CURRENT + 1))
  
  # Check if image already exists
  if [ -f "/Users/marcangeloh/Desktop/resh-community/public/images/posts/${slug}.webp" ]; then
    echo "[$CURRENT] ✓ $slug - already has image, skipping..."
    continue
  fi
  
  # Check if MDX exists
  if [ ! -f "/Users/marcangeloh/Desktop/resh-community/content/posts/${slug}.mdx" ]; then
    echo "[$CURRENT] ⚠ $slug - MDX not found, skipping..."
    continue
  fi
  
  echo ""
  echo "=========================================="
  echo "[$CURRENT] $slug"
  echo "=========================================="
  echo ""
  echo "PROMPT:"
  echo "$prompt"
  echo ""
  echo "------------------------------------------"
  echo "Save as: public/images/posts/${slug}.webp"
  echo "Then run: ./scripts/bing-update-helper.sh $slug"
  echo "------------------------------------------"
  echo ""
  
  read -p "Press Enter to continue (s=skip, q=quit): " response
  [[ "$response" =~ ^[Qq]$ ]] && { echo ""; break; }
  [[ "$response" =~ ^[Ss]$ ]] && continue
  
done < "$PROMPTS_FILE"

echo ""
echo "=========================================="
echo "Done! Check progress with: ./scripts/check-progress.sh"
echo "=========================================="
