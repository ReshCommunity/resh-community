#!/usr/bin/env python3
"""
Update MDX frontmatter with featured image for manually downloaded images
Usage: python3 scripts/update-frontmatter-image.py --slug "what-is-bitcoin" --filename "bitcoin-image.webp"
"""

import sys
import re
from pathlib import Path

PROJECT_ROOT = Path("/Users/marcangeloh/Desktop/resh-community")


def update_frontmatter(slug: str, filename: str, alt_text: str = None):
    """Update the MDX frontmatter with the new image path"""
    mdx_path = PROJECT_ROOT / "content" / "posts" / f"{slug}.mdx"

    if not mdx_path.exists():
        print(f"Error: MDX file not found: {mdx_path}")
        return False

    try:
        with open(mdx_path, 'r') as f:
            content = f.read()

        # Check if image already exists in frontmatter
        if 'featuredImage:' in content:
            content = re.sub(
                r'featuredImage:.*',
                f'featuredImage: /images/posts/{filename}',
                content
            )
        else:
            # Add after the opening --- of frontmatter
            content = content.replace('---\n', f'---\nfeaturedImage: /images/posts/{filename}\n', 1)

        # Add or replace alt text
        if alt_text:
            if 'featuredImageAlt:' in content:
                content = re.sub(
                    r'featuredImageAlt:.*',
                    f'featuredImageAlt: {alt_text}',
                    content
                )
            else:
                content = content.replace('---\n', f'---\nfeaturedImageAlt: {alt_text}\n', 1)

        with open(mdx_path, 'w') as f:
            f.write(content)

        print(f"✓ Updated: {mdx_path.name}")
        print(f"  featuredImage: /images/posts/{filename}")
        if alt_text:
            print(f"  featuredImageAlt: {alt_text}")
        return True

    except Exception as e:
        print(f"Error updating frontmatter: {e}")
        return False


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Update MDX frontmatter with featured image")
    parser.add_argument("--slug", required=True, help="Post slug (e.g., 'what-is-bitcoin')")
    parser.add_argument("--filename", required=True, help="Image filename (e.g., 'what-is-bitcoin.webp')")
    parser.add_argument("--alt", help="Alt text for image")

    args = parser.parse_args()

    alt_text = args.alt or f"Cryptocurrency blog illustration for {args.slug.replace('-', ' ')}"
    update_frontmatter(args.slug, args.filename, alt_text)
