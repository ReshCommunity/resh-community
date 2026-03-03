#!/usr/bin/env python3
"""
Free Image Generation for Resh Community Blog
Using Hugging Face Inference API - Free tier, no local processing

Brand Colors:
- Primary: #FF6600 (Orange)
- Secondary: #D93E40 (Red)
- Background: #333333, #3F3F3F

Get free API key at: https://huggingface.co/settings/tokens
"""

import os
import sys
import time
import argparse
import requests
from pathlib import Path

# Configuration
PROJECT_ROOT = Path("/Users/marcangeloh/Desktop/resh-community")
IMAGES_DIR = PROJECT_ROOT / "public" / "images" / "posts"
WIDTH = 1200
HEIGHT = 632  # Must be divisible by 8 for SDXL

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

# Using Stable Diffusion XL (free tier on Hugging Face)
# New endpoint as of 2024
MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0"
API_URL = f"https://router.huggingface.co/hf-inference/models/{MODEL_ID}"


def build_prompt(subject: str, category: str = "general") -> str:
    """Build a consistent prompt with brand colors and style"""
    category_style = CATEGORY_STYLES.get(category, CATEGORY_STYLES["general"])
    return f"{subject}, {category_style}, {BRAND_PROMPT}"


def get_api_key() -> str:
    """Get Hugging Face API key from environment or prompt user"""
    api_key = os.environ.get("HUGGINGFACE_API_KEY")
    if not api_key:
        print("\n" + "="*60)
        print("Hugging Face API Key Required")
        print("="*60)
        print("1. Go to: https://huggingface.co/settings/tokens")
        print("2. Create a free account and generate a read token")
        print("3. Run: export HUGGINGFACE_API_KEY='your-token-here'")
        print("="*60 + "\n")
        api_key = input("Or paste your API key here: ").strip()
        if not api_key:
            print("Error: API key is required")
            sys.exit(1)
    return api_key


def generate_image(prompt: str, api_key: str) -> bytes:
    """Generate image using Hugging Face Inference API"""
    headers = {"Authorization": f"Bearer {api_key}"}

    # Try with negative prompt for better quality
    payload = {
        "inputs": prompt,
        "parameters": {
            "negative_prompt": "blurry, low quality, distorted, watermark, text, signature, ugly, deformed",
            "width": WIDTH,
            "height": HEIGHT,
            "num_inference_steps": 30,
            "guidance_scale": 7.5
        }
    }

    print(f"  Generating image via Hugging Face...")
    response = requests.post(API_URL, headers=headers, json=payload, timeout=120)

    if response.status_code == 503:
        # Model is loading, wait and retry
        print("  Model is loading, waiting 20 seconds...")
        time.sleep(20)
        response = requests.post(API_URL, headers=headers, json=payload, timeout=120)

    if response.status_code != 200:
        print(f"  Error: API returned status {response.status_code}")
        print(f"  Response: {response.text[:200]}")
        return None

    return response.content


def save_image(image_data: bytes, output_path: Path) -> bool:
    """Save image data to file - always saves as .webp for consistency"""
    try:
        # Save directly as WebP (the API returns JPEG/PNG, we save with .webp extension)
        with open(output_path, "wb") as f:
            f.write(image_data)

        print(f"  Saved to: {output_path}")
        return True
    except Exception as e:
        print(f"  Error saving image: {e}")
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

        import re

        # Check if image already exists in frontmatter
        if 'featuredImage:' in content:
            content = re.sub(
                r'featuredImage:.*',
                f'featuredImage: /images/posts/{image_path.name}',
                content
            )
        else:
            content = content.replace('---\n', f'---\nfeaturedImage: /images/posts/{image_path.name}\n', 1)

        # Add or replace alt text
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

        print(f"  Updated frontmatter in: {mdx_path.name}")

    except Exception as e:
        print(f"  Error updating frontmatter: {e}")


def generate_single_image(subject: str, slug: str, category: str = "general", api_key: str = None) -> bool:
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

    # Get API key if not provided
    if not api_key:
        api_key = get_api_key()

    # Generate image
    image_data = generate_image(prompt, api_key)
    if not image_data:
        return False

    # Save image
    if save_image(image_data, output_path):
        # Update frontmatter
        alt_text = f"{subject} - cryptocurrency blog illustration"
        update_frontmatter(slug, output_path, alt_text)
        return True

    return False


def main():
    parser = argparse.ArgumentParser(description="Generate blog images using Hugging Face Inference API")
    parser.add_argument("--subject", required=True, help="Brief subject description")
    parser.add_argument("--slug", required=True, help="Post slug for filename")
    parser.add_argument("--category", default="general", help="Category for styling")
    parser.add_argument("--api-key", help="Hugging Face API key (or set HUGGINGFACE_API_KEY env var)")
    parser.add_argument("--batch", help="Batch file with multiple subjects")

    args = parser.parse_args()

    api_key = args.api_key or os.environ.get("HUGGINGFACE_API_KEY")

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
                    generate_single_image(subject, slug, category, api_key)
                    time.sleep(2)  # Small delay between requests
    else:
        # Single image mode
        generate_single_image(args.subject, args.slug, args.category, api_key)


if __name__ == "__main__":
    main()
