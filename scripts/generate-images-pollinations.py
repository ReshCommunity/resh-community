#!/usr/bin/env python3
"""
Free Image Generation for Resh Community Blog
Using Pollinations.ai - No API key required, runs on cloud servers

Brand Colors:
- Primary: #FF6600 (Orange)
- Secondary: #D93E40 (Red)
- Background: #333333, #3F3F3F
"""

import os
import sys
import time
import argparse
import urllib.request
import urllib.parse
from pathlib import Path

# Configuration
PROJECT_ROOT = Path("/Users/marcangeloh/Desktop/resh-community")
IMAGES_DIR = PROJECT_ROOT / "public" / "images" / "posts"
WIDTH = 1200
HEIGHT = 630

# Brand colors for consistent styling
BRAND_PROMPT = (
    "cryptocurrency blockchain illustration, "
    "flat vector design, minimalist style, "
    "professional tech aesthetic, "
    "color palette: #FF6600 orange accent, #D93E40 red, #333333 dark gray background, "
    "high contrast, clean lines, educational style, "
    "white background for readability"
)

CATEGORY_STYLES = {
    "crypto-basics": "educational cryptocurrency concept with simple icons and blockchain elements",
    "defi": "decentralized finance with geometric shapes, pools, and data visualization elements",
    "trading": "candlestick charts, trading interface, upward growth arrows, market analysis",
    "security": "shield locks, protection layers, security elements with trustworthy blue tones",
    "wallets": "digital wallet icons, cryptographic keys, hardware device illustrations",
    "news": "journalism style with dramatic composition, news elements, timely visual narrative",
    "nft": "digital artwork, collectible tokens, blockchain authenticity visualization",
    "general": "cryptocurrency community, social connection, networking concept"
}


def build_prompt(subject: str, category: str = "general") -> str:
    """Build a consistent prompt with brand colors and style"""
    category_style = CATEGORY_STYLES.get(category, CATEGORY_STYLES["general"])
    return f"{subject}, {category_style}, {BRAND_PROMPT}"


def generate_image_url(prompt: str, seed: int = None) -> str:
    """Generate Pollinations.ai URL for image generation"""
    encoded_prompt = urllib.parse.quote(prompt)

    # Build URL with parameters
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}"
    params = [
        f"width={WIDTH}",
        f"height={HEIGHT}",
        "model=flux",  # Flux model for high quality
        "nologo=true",
        "private=true"
    ]

    if seed is not None:
        params.append(f"seed={seed}")

    return f"{url}?{'&'.join(params)}"


def download_image(url: str, output_path: Path) -> bool:
    """Download image from URL to local path"""
    try:
        print(f"  Downloading from: {url[:80]}...")
        urllib.request.urlretrieve(url, output_path)
        print(f"  Saved to: {output_path}")
        return True
    except Exception as e:
        print(f"  Error downloading: {e}")
        return False


def update_frontmatter(slug: str, image_path: Path, alt_text: str):
    """Update the MDX frontmatter with the new image path"""
    mdx_path = PROJECT_ROOT / "content" / "posts" / f"{slug}.mdx"

    if not mdx_path.exists():
        print(f"  Warning: MDX file not found: {mdx_path}")
        return

    try:
        with open(mdx_path, 'r') as f:
            content = f.read()

        # Check if image already exists in frontmatter
        if 'featuredImage:' in content:
            # Replace existing image
            import re
            content = re.sub(
                r'featuredImage:.*',
                f'featuredImage: /images/posts/{image_path.name}',
                content
            )
        else:
            # Add image after frontmatter opening
            content = content.replace('---\n', f'---\nfeaturedImage: /images/posts/{image_path.name}\n', 1)

        # Add or replace alt text
        if 'featuredImageAlt:' in content:
            import re
            content = re.sub(
                r'featuredImageAlt:.*',
                f'featuredImageAlt: {alt_text}',
                content
            )
        else:
            content = content.replace('---\n', f'---\nfeaturedImageAlt: {alt_text}\n', 1)

        with open(mdx_path, 'w') as f:
            f.write(content)

        print(f"  Updated frontmatter in: {mdx_path.name}")

    except Exception as e:
        print(f"  Error updating frontmatter: {e}")


def generate_single_image(subject: str, slug: str, category: str = "general", seed: int = None) -> bool:
    """Generate a single image for a blog post"""
    print(f"\nGenerating: {slug}")

    # Build the prompt
    prompt = build_prompt(subject, category)
    print(f"  Subject: {subject[:80]}...")

    # Ensure images directory exists
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    # Generate filename
    filename = f"{slug}.webp"
    output_path = IMAGES_DIR / filename

    # Check if file already exists
    if output_path.exists():
        response = input(f"  File {filename} already exists. Overwrite? (y/n): ")
        if response.lower() != 'y':
            print("  Skipping...")
            return False

    # Generate URL
    url = generate_image_url(prompt, seed)

    # Download image
    if download_image(url, output_path):
        # Update frontmatter
        alt_text = f"{subject} - cryptocurrency blog illustration"
        update_frontmatter(slug, output_path, alt_text)
        return True

    return False


def main():
    parser = argparse.ArgumentParser(description="Generate blog images using Pollinations.ai")
    parser.add_argument("--subject", required=True, help="Brief subject description")
    parser.add_argument("--slug", required=True, help="Post slug for filename")
    parser.add_argument("--category", default="general", help="Category for styling")
    parser.add_argument("--seed", type=int, help="Random seed for reproducibility")
    parser.add_argument("--batch", help="Batch file with multiple subjects")

    args = parser.parse_args()

    if args.batch:
        # Batch mode - read from file
        print("Batch generation mode")
        with open(args.batch, 'r') as f:
            lines = f.readlines()

        for line in lines:
            if line.strip() and not line.startswith('#'):
                parts = line.strip().split('|')
                if len(parts) >= 2:
                    subject, slug = parts[0].strip(), parts[1].strip()
                    category = parts[2].strip() if len(parts) > 2 else "general"
                    generate_single_image(subject, slug, category)
                    time.sleep(1)  # Small delay between requests
    else:
        # Single image mode
        generate_single_image(args.subject, args.slug, args.category, args.seed)


if __name__ == "__main__":
    main()
