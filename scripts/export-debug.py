#!/usr/bin/env python3

import json
import os
from collections import Counter

DB_PATH = "/Users/marcangeloh/Desktop/All Desktop/Themes/blogar-blog-magazine-wordpress-theme/resh/backup-resh.community-20221217-dtspppmaiqspumuq/database.sql"
OUTPUT_DIR = "/Users/marcangeloh/Desktop/resh-community/content"

print("Starting WordPress export...")

# Create output directories
os.makedirs(f"{OUTPUT_DIR}/posts", exist_ok=True)
os.makedirs(f"{OUTPUT_DIR}/pages", exist_ok=True)

# Read database file
print("Reading database.sql...")
with open(DB_PATH, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

print(f"✓ Loaded {len(content)} bytes\n")

# Find wp_posts INSERT
search_str = "INSERT INTO `wp_posts` VALUES "
start_pos = content.find(search_str)

if start_pos == -1:
    print("✗ No wp_posts INSERT found")
else:
    start_pos += len(search_str)
    end_pos = content.find(';\n', start_pos)
    if end_pos == -1:
        end_pos = content.find(';', start_pos)
    if end_pos == -1:
        end_pos = len(content)

    values_str = content[start_pos:end_pos]
    print(f"VALUES string length: {len(values_str)}")

    # Parse rows
    rows = []
    current_row = ''
    paren_depth = 0
    in_quotes = False
    quote_char = ''
    escape_next = False

    for char in values_str:
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
                current_row = ''
            else:
                current_row += char
        elif char == ')' and not in_quotes:
            paren_depth -= 1
            if paren_depth == 0:
                rows.append(current_row)
                current_row = ''
            else:
                current_row += char
        else:
            current_row += char

    print(f"✓ Found {len(rows)} rows\n")

    # Debug: Check what types and statuses exist
    post_types = Counter()
    post_statuses = Counter()

    posts = []
    pages = []

    for row_idx, row_str in enumerate(rows[:50]):  # First 50 rows for debug
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
            continue

        def clean(v):
            v = v.strip()
            if v == 'NULL':
                return None
            if (v.startswith("'") and v.endswith("'")) or (v.startswith('"') and v.endswith('"')):
                v = v[1:-1]
            v = v.replace("\\'", "'").replace('\\"', '"').replace('\\n', '\n').replace('\\r', '').replace('\\\\', '\\')
            return v

        try:
            post_id = clean(parts[0])
            post_title = clean(parts[5])
            post_type = clean(parts[20])
            post_status = clean(parts[21])

            post_types[post_type] += 1
            post_statuses[post_status] += 1

            if row_idx < 10:
                print(f"Row {row_idx}: ID={post_id}, type='{post_type}', status='{post_status}', title='{post_title[:50]}'")

        except Exception as e:
            print(f"Row {row_idx}: Error - {e}")

    print(f"\nPost type distribution:")
    for ptype, count in post_types.most_common():
        print(f"  {ptype}: {count}")

    print(f"\nPost status distribution:")
    for status, count in post_statuses.most_common():
        print(f"  {status}: {count}")

print("\n✓ Debug complete!")
