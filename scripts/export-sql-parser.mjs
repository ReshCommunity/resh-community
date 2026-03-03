import fs from 'fs';
import sqlParser from 'sql-parser';
const { parse } = sqlParser;

const DB_PATH = '/Users/marcangeloh/Desktop/All Desktop/Themes/blogar-blog-magazine-wordpress-theme/resh/backup-resh.community-20221217-dtspppmaiqspumuq/database.sql';
const OUTPUT_DIR = '/Users/marcangeloh/Desktop/resh-community/content';

console.log('Starting WordPress export with sql-parser...');

// Create output directories
fs.mkdirSync(`${OUTPUT_DIR}/posts`, { recursive: true });
fs.mkdirSync(`${OUTPUT_DIR}/pages`, { recursive: true });

// Read database file
console.log('Reading database.sql...');
const content = fs.readFileSync(DB_PATH, 'utf-8');
console.log(`✓ Loaded ${content.length} bytes\n`);

// Find and parse the wp_posts INSERT statement
console.log('Parsing wp_posts INSERT...');

const postsInsertMatch = content.match(/INSERT INTO `wp_posts` VALUES ([\s\S]+?);\n/);
if (!postsInsertMatch) {
    console.log('✗ No wp_posts INSERT found');
    process.exit(1);
}

// Try to parse with sql-parser
try {
    const insertSQL = 'INSERT INTO wp_posts VALUES ' + postsInsertMatch[1] + ';';
    const ast = parse(insertSQL);
    console.log('✓ Parsed with sql-parser');
    console.log('AST type:', ast.type);

    if (ast.type === 'insert') {
        const values = ast.values;
        console.log(`✓ Found ${values?.length || 0} rows`);

        let posts = [];
        let pages = [];

        if (Array.isArray(values)) {
            for (const row of values) {
                if (!Array.isArray(row)) continue;

                // Extract values based on wp_posts structure
                const [
                    ID, post_author, post_date, post_date_gmt, post_content,
                    post_title, post_excerpt, post_status, comment_status, ping_status,
                    post_password, post_name, to_ping, pinged, post_modified,
                    post_modified_gmt, post_content_filtered, post_parent, guid,
                    menu_order, post_type, post_mime_type, comment_count
                ] = row;

                // Only publish
                if (post_status?.value !== 'publish') continue;

                // Skip certain types
                if (['revision', 'attachment', 'nav_menu_item', 'custom_css', 'customize_changeset'].includes(post_type?.value)) {
                    continue;
                }

                const item = {
                    id: ID?.value?.toString(),
                    title: post_title?.value || '(Untitled)',
                    content: post_content?.value || '',
                    excerpt: post_excerpt?.value || '',
                    date: post_date?.value?.toString() || '',
                    slug: post_name?.value || '',
                    type: post_type?.value || ''
                };

                if (post_type?.value === 'post') {
                    posts.push(item);
                } else if (post_type?.value === 'page') {
                    pages.push(item);
                }
            }
        }

        console.log(`\n✓ Filtered to ${posts.length} posts and ${pages.length} pages`);

        // Save to JSON
        fs.writeFileSync(
            `${OUTPUT_DIR}/posts.json`,
            JSON.stringify(posts, null, 2)
        );

        fs.writeFileSync(
            `${OUTPUT_DIR}/pages.json`,
            JSON.stringify(pages, null, 2)
        );

        console.log(`✓ Saved to ${OUTPUT_DIR}/posts.json`);
        console.log(`✓ Saved to ${OUTPUT_DIR}/pages.json`);

        // Show sample posts
        console.log('\nSample posts:');
        posts.slice(0, 5).forEach(p => {
            console.log(`  - ${p.title} (${p.slug})`);
        });

        console.log('\nSample pages:');
        pages.slice(0, 5).forEach(p => {
            console.log(`  - ${p.title} (${p.slug})`);
        });

    }

} catch (error) {
    console.error('Error parsing SQL:', error.message);

    // Fallback: try simpler approach
    console.log('\nTrying fallback parsing method...');
    fallbackParse(postsInsertMatch[1]);
}

function fallbackParse(valuesStr) {
    // Manual parsing as fallback
    const rows = [];
    let currentRow = '';
    let parenDepth = 0;
    let inQuotes = false;
    let quoteChar = '';

    for (const char of valuesStr) {
        if ((char === "'" || char === '"') && (currentRow[currentRow.length - 1] !== '\\')) {
            if (!inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar) {
                inQuotes = false;
            }
            currentRow += char;
        } else if (char === '(' && !inQuotes) {
            parenDepth++;
            if (parenDepth === 1) currentRow = '';
            else currentRow += char;
        } else if (char === ')' && !inQuotes) {
            parenDepth--;
            if (parenDepth === 0) {
                rows.push(currentRow);
                currentRow = '';
            } else {
                currentRow += char;
            }
        } else {
            currentRow += char;
        }
    }

    console.log(`✓ Fallback: Found ${rows.length} rows`);
    console.log(`First row: ${rows[0]?.substring(0, 200)}...`);
}

console.log('\n✓ Export complete!');
