#!/usr/bin/env python3
"""Filter prompts to only include posts that actually exist"""

import re
from pathlib import Path

PROJECT_ROOT = Path("/Users/marcangeloh/Desktop/resh-community")
CONTENT_DIR = PROJECT_ROOT / "content" / "posts"
PROMPTS_FILE = PROJECT_ROOT / "docs" / "ready-to-use-bing-prompts-existing-only.txt"
OUTPUT_FILE = PROJECT_ROOT / "docs" / "bing-prompts-ready.txt"

# Get all existing MDX slugs
existing_slugs = set()
for mdx_file in CONTENT_DIR.glob("*.mdx"):
    existing_slugs.add(mdx_file.stem)

print(f"Found {len(existing_slugs)} existing posts")

# Filter prompts
filtered_prompts = []
with open(PROMPTS_FILE, 'r') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        
        # Extract slug (before first |)
        parts = line.split('|', 1)
        if len(parts) == 2:
            slug = parts[0].strip()
            if slug in existing_slugs:
                filtered_prompts.append(line)

# Write filtered prompts
with open(OUTPUT_FILE, 'w') as f:
    f.write("# Bing Image Creator Prompts - Posts That Actually Exist\n")
    f.write(f"# Total: {len(filtered_prompts)} posts\n")
    f.write("# Format: SLUG|PROMPT\n\n")
    for prompt in filtered_prompts:
        f.write(prompt + '\n')

print(f"Filtered to {len(filtered_prompts)} existing posts")
print(f"Saved to: {OUTPUT_FILE}")
