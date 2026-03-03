#!/usr/bin/env python3

import json
import os

DB_PATH = "/Users/marcangeloh/Desktop/All Desktop/Themes/blogar-blog-magazine-wordpress-theme/resh/backup-resh.community-20221217-dtspppmaiqspumuq/database.sql"
OUTPUT_DIR = "/Users/marcangeloh/Desktop/resh-community/content"

print("Starting WordPress export...")
print(f"Reading database from: {DB_PATH}")
print(f"Output directory: {OUTPUT_DIR}")
print()

# Create output directories
os.makedirs(f"{OUTPUT_DIR}/posts", exist_ok=True)
os.makedirs(f"{OUTPUT_DIR}/pages", exist_ok=True)

# Read database file
print("Reading database.sql...")
with open(DB_PATH, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

print(f"✓ Loaded {len(content)} bytes\n")

# Parse wp_posts
print("Parsing wp_posts...")

# Find the INSERT statement for wp_posts - using exact string match
search_str = "INSERT INTO `wp_posts` VALUES "
start_pos = content.find(search_str)

if start_pos == -1:
    print("✗ No wp_posts INSERT statement found")
    # Try alternative search
    search_str = "INSERT INTO `wp_posts`"
    start_pos = content.find(search_str)
    if start_pos == -1:
        print("✗ No wp_posts table found at all")
    else:
        print(f"Found 'INSERT INTO wp_posts' at position {start_pos}")
        print(f"Context: {content[start_pos:start_pos+100]}")
else:
    print(f"Found INSERT statement at position {start_pos}")

    # Start from after "VALUES "
    start_pos += len(search_str)

    # Find the end (semicolon)
    end_pos = content.find(';\n', start_pos)
    if end_pos == -1:
        end_pos = content.find(';', start_pos)
    if end_pos == -1:
        end_pos = len(content)

    values_str = content[start_pos:end_pos]
    print(f"VALUES string length: {len(values_str)}")

    # Parse rows manually
    rows = []
    current_row = ''
    paren_depth = 0
    in_quotes = False
    quote_char = ''
    escape_next = False

    for i, char in enumerate(values_str):
        if escape_next:
            current_row += char
            escape_next = False
            continue

        if char == '\\':
            current_row += char
            escape_next = True
            continue

        if char in ("'", '"') and not escape_next:
            if not in_quotes:
                in_quotes = True
                quote_char = char
            elif char == quote_char:
                in_quotes = False
                quote_char = ''
            current_row += char
        elif char == '(' and not in_quotes:
            paren_depth += 1
            if paren_depth == 1:
                current_row = ''  # Start new row (don't include the '(')
            else:
                current_row += char
        elif char == ')' and not in_quotes:
            paren_depth -= 1
            if paren_depth == 0:
                # End of row
                rows.append(current_row)
                current_row = ''
            else:
                current_row += char
        else:
            current_row += char

    print(f"✓ Found {len(rows)} rows in wp_posts")

    # Process each row
    posts = []
    pages = []

    for row_idx, row_str in enumerate(rows):
        # Split by comma, respecting quoted strings
        parts = []
        current = ''
        in_quotes = False
        quote_char = ''
        escape_next = False

        for char in row_str:
            if escape_next:
                current += char
                escape_next = False
                continue

            if char == '\\':
                current += char
                escape_next = True
                continue

            if char in ("'", '"') and (not current or current[-1] != '\\'):
                if not in_quotes:
                    in_quotes = True
                    quote_char = char
                elif char == quote_char:
                    in_quotes = False
                    quote_char = ''
                current += char
            elif char == ',' and not in_quotes:
                parts.append(current)
                current = ''
            else:
                current += char

        if current:
            parts.append(current)

        if len(parts) < 22:
            print(f"  Row {row_idx}: Skipping (only {len(parts)} fields)")
            continue

        # Extract fields
        def clean(v):
            v = v.strip()
            if v == 'NULL':
                return None
            if (v.startswith("'") and v.endswith("'")) or (v.startswith('"') and v.endswith('"')):
                v = v[1:-1]
            # Unescape SQL
            v = v.replace("\\'", "'").replace('\\"', '"').replace('\\n', '\n').replace('\\r', '').replace('\\\\', '\\')
            return v

        try:
            post_id = clean(parts[0])
            post_title = clean(parts[5])
            post_content = clean(parts[4])
            post_excerpt = clean(parts[6])
            post_date = clean(parts[2])
            post_name = clean(parts[11])
            post_type = clean(parts[19])
            post_status = clean(parts[7])

            # Only publish
            if post_status != 'publish':
                continue

            # Skip certain types
            if post_type in ['revision', 'attachment', 'nav_menu_item', 'custom_css', 'customize_changeset']:
                continue

            item = {
                'id': post_id,
                'title': post_title or '(Untitled)',
                'content': post_content or '',
                'excerpt': post_excerpt or '',
                'date': post_date,
                'slug': post_name,
                'type': post_type
            }

            if post_type == 'post':
                posts.append(item)
            elif post_type == 'page':
                pages.append(item)

            if len(posts) <= 5:
                print(f"  Post: {item['title']} ({item['slug']})")
        except Exception as e:
            print(f"  Row {row_idx}: Error parsing - {e}")
            continue

    print(f"\n✓ Filtered to {len(posts)} posts and {len(pages)} pages")

    # Save to JSON for now
    with open(f'{OUTPUT_DIR}/posts.json', 'w') as f:
        json.dump(posts, f, indent=2)

    with open(f'{OUTPUT_DIR}/pages.json', 'w') as f:
        json.dump(pages, f, indent=2)

    print(f"✓ Saved to {OUTPUT_DIR}/posts.json")
    print(f"✓ Saved to {OUTPUT_DIR}/pages.json")

print("\n✓ Export complete!")
