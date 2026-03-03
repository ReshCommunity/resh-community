#!/usr/bin/env node

/**
 * Fix frontmatter quotes in all MDX files - properly handles nested values
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.resolve(process.env.HOME, 'Desktop/resh-community/content');

function escapeYamlString(str) {
  if (!str) return '""';
  // For YAML, use literal style for strings with quotes
  // Or use single quotes and escape internal single quotes
  if (str.includes('"') || str.includes("'")) {
    // Use double quotes and escape internal double quotes and backslashes
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return `"${str}"`;
}

function fixFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---/);

  if (!frontmatterMatch) return;

  let frontmatter = frontmatterMatch[1];
  const body = content.substring(frontmatterMatch[0].length);

  // Rebuild frontmatter line by line
  const lines = frontmatter.split('\n');
  const newFrontmatter = [];
  let inSeoBlock = false;

  for (const line of lines) {
    if (line.trim() === 'seo:') {
      inSeoBlock = true;
      newFrontmatter.push('seo:');
      continue;
    }

    if (inSeoBlock) {
      if (line.startsWith('    ') || line.startsWith('  ')) {
        // Nested value in seo block
        const match = line.match(/^(\s+)([a-z_]+):\s*(.+)$/);
        if (match) {
          const indent = match[1];
          const key = match[2];
          let value = match[3].trim();
          // Remove existing quotes
          value = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
          newFrontmatter.push(`${indent}${key}: ${escapeYamlString(value)}`);
        } else {
          newFrontmatter.push(line);
        }
      } else {
        inSeoBlock = false;
        // Top level value
        const match = line.match(/^([a-z_]+):\s*(.+)$/);
        if (match) {
          const key = match[1];
          let value = match[2].trim();
          value = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
          newFrontmatter.push(`${key}: ${escapeYamlString(value)}`);
        } else {
          newFrontmatter.push(line);
        }
      }
    } else {
      // Top level value
      const match = line.match(/^([a-z_]+):\s*(.+)$/);
      if (match) {
        const key = match[1];
        let value = match[2].trim();
        value = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
        newFrontmatter.push(`${key}: ${escapeYamlString(value)}`);
      } else {
        newFrontmatter.push(line);
      }
    }
  }

  const newContent = `---\n${newFrontmatter.join('\n')}\n---${body}`;
  fs.writeFileSync(filePath, newContent);
}

// Fix all MDX files
function fixAllFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      fixAllFiles(fullPath);
    } else if (entry.name.endsWith('.mdx')) {
      console.log(`Fixing: ${entry.name}`);
      try {
        fixFrontmatter(fullPath);
      } catch (error) {
        console.error(`  Error: ${error.message}`);
      }
    }
  }
}

console.log('Fixing frontmatter in MDX files...');
fixAllFiles(CONTENT_DIR);
console.log('Done!');
