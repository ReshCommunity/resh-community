#!/usr/bin/env python3

import json
import os
from collections import Counter

DB_PATH = "/Users/marcangeloh/Desktop/All Desktop/Themes/blogar-blog-magazine-wordpress-theme/resh/backup-resh.community-20221217-dtspppmaiqspumuq/database.sql"
OUTPUT_DIR = "/Users/marcangeloh/Desktop/resh-community/content"

# Read database
with open(DB_PATH, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Find wp_posts INSERT
search_str = "INSERT INTO `wp_posts` VALUES "
start_pos = content.find(search_str)
start_pos += len(search_str)
end_pos = content.find(';\n', start_pos)
if end_pos == -1:
    end_pos = content.find(';', start_pos)
values_str = content[start_pos:end_pos]

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

print(f"Total rows: {len(rows)}")

# Analyze a sample of rows
post_types = Counter()
for row_idx, row_str in enumerate(rows):
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

    if len(parts) >= 22:
        def clean(v):
            v = v.strip()
            if v == 'NULL':
                return None
            if (v.startswith("'") and v.endswith("'")) or (v.startswith('"') and v.endswith('"')):
                v = v[1:-1]
            v = v.replace("\\'", "'").replace('\\"', '"').replace('\\n', '\n').replace('\\r', '').replace('\\\\', '\\')
            return v

        post_type = clean(parts[19])
        post_status = clean(parts[7])

        if post_type:
            post_types[post_type] += 1

        # Print first 10
        if row_idx < 10:
            post_title = clean(parts[5])
            print(f"Row {row_idx}: type='{post_type}', status='{post_status}', title='{post_title[:50]}'")

print("\nPost type distribution:")
for ptype, count in post_types.most_common():
    print(f"  '{ptype}': {count}")
