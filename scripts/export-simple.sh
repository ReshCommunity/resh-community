#!/bin/bash

# WordPress to Next.js Simple Export Script
# Uses bash/sed to extract data from database.sql

set -e

DB_PATH="/Users/marcangeloh/Desktop/All Desktop/Themes/blogar-blog-magazine-wordpress-theme/resh/backup-resh.community-20221217-dtspppmaiqspumuq/database.sql"
OUTPUT_DIR="/Users/marcangeloh/Desktop/resh-community/content"

# Create output directories
mkdir -p "$OUTPUT_DIR/posts"
mkdir -p "$OUTPUT_DIR/pages"

echo "Starting WordPress export..."
echo ""

# Extract posts (post_type = 'post' and post_status = 'publish')
echo "Extracting posts..."

# First, let's extract the relevant INSERT statements and process them
# This is a simplified approach - we'll process each row

# For now, let's just get a count and sample of posts
echo "Checking wp_posts table..."

# Use grep to find posts with post_type = 'post'
# The format in SQL INSERT is: (ID,post_author,post_date,post_date_gmt,post_content,post_title,post_excerpt,post_status,comment_status,ping_status,post_password,post_name,to_ping,pinged,post_modified,post_modified_gmt,post_content_filtered,post_parent,guid,menu_order,post_type,mime_type,comment_count)

# Let's export post data to a temp file for processing
TEMP_FILE="/tmp/wp_posts_data.txt"

# Use python to parse SQL more reliably
python3 << 'PYTHON_SCRIPT'
import re
import json
import os
from datetime import datetime

DB_PATH = os.environ.get('DB_PATH', '/Users/marcangeloh/Desktop/All Desktop/Themes/blogar-blog-magazine-wordpress-theme/resh/backup-resh.community-20221217-dtspppmaiqspumuq/database.sql')
OUTPUT_DIR = os.environ.get('OUTPUT_DIR', '/Users/marcangeloh/Desktop/resh-community/content')

# Read database file
with open(DB_PATH, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Parse wp_posts INSERT statement
posts_pattern = r"INSERT INTO `wp_posts` VALUES ((?:\([^)]+\)(?:,\s*)?)+);"
posts_match = re.search(posts_pattern, content, re.DOTALL)

if posts_match:
    values_str = posts_match.group(1)

    # Parse individual rows
    row_pattern = r"\(([^)]+)\)"
    rows = re.findall(row_pattern, values_str)

    print(f"Found {len(rows)} rows in wp_posts")

    # Process each row
    posts = []
    for row_str in rows:
        # Split by comma, but respect quoted strings
        parts = []
        current = ''
        in_quotes = False
        quote_char = ''

        for char in row_str:
            if char in ("'", '"') and (not current or current[-1] != '\\'):
                if not in_quotes:
                    in_quotes = True
                    quote_char = char
                elif char == quote_char:
                    in_quotes = False
                current += char
            elif char == ',' and not in_quotes:
                parts.append(current)
                current = ''
            else:
                current += char

        if current:
            parts.append(current)

        if len(parts) < 22:
            continue

        # Extract fields (wp_posts structure)
        post_id = parts[0].strip()
        post_title = parts[5].strip()
        post_content = parts[6].strip()
        post_excerpt = parts[7].strip()
        post_date = parts[8].strip()
        post_name = parts[12].strip()
        post_type = parts[20].strip()
        post_status = parts[21].strip()

        # Skip non-published content
        if post_status != "'publish'":
            continue

        # Skip revisions and attachments
        if post_type in ("'revision'", "'attachment'", "'nav_menu_item'", "'custom_css'", "'customize_changeset'"):
            continue

        # Clean up values (remove quotes)
        def clean_value(v):
            v = v.strip()
            if (v.startswith("'") and v.endswith("'")) or (v.startswith('"') and v.endswith('"')):
                v = v[1:-1]
            # Unescape
            v = v.replace("\\'", "'").replace('\\"', '"').replace('\\n', '\n').replace('\\r', '\r')
            return v

        post_id = clean_value(post_id)
        post_title = clean_value(post_title)
        post_content = clean_value(post_content)
        post_excerpt = clean_value(post_excerpt)
        post_date = clean_value(post_date)
        post_name = clean_value(post_name)
        post_type = clean_value(post_type)

        posts.append({
            'id': post_id,
            'title': post_title,
            'content': post_content,
            'excerpt': post_excerpt,
            'date': post_date,
            'slug': post_name,
            'type': post_type
        })

    print(f"\nFiltered to {len(posts)} published posts/pages")
    print(f"Posts: {sum(1 for p in posts if p['type'] == 'post')}")
    print(f"Pages: {sum(1 for p in posts if p['type'] == 'page')}")

    # Export to JSON for now (we'll convert to MDX later)
    with open(f'{OUTPUT_DIR}/posts-data.json', 'w') as f:
        json.dump(posts, f, indent=2)

    print(f"\n✓ Exported to {OUTPUT_DIR}/posts-data.json")

else:
    print("No wp_posts INSERT statement found!")

PYTHON_SCRIPT

echo ""
echo "✓ Export complete!"
