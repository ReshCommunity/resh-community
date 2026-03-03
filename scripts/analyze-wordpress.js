#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  wordpressBackupPath: path.resolve(process.env.HOME, 'Desktop/All Desktop/Themes/blogar-blog-magazine-wordpress-theme/resh/backup-resh.community-20221217-dtspppmaiqspumuq'),
  databaseFile: 'database.sql',
};

// Import parser functions from migration script
function parseSQLValue(str) {
  if (!str) return '';
  if (str.startsWith("'") && str.endsWith("'")) {
    str = str.slice(1, -1);
  }
  return str
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\\\/g, '\\');
}

function parseSQLValues(sqlText) {
  const values = [];
  let current = '';
  let inString = false;
  let escapeNext = false;
  let parenDepth = 0;
  let valueStart = false;

  for (let i = 0; i < sqlText.length; i++) {
    const char = sqlText[i];

    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      current += char;
      continue;
    }

    if (char === "'") {
      inString = !inString;
      current += char;
      continue;
    }

    if (inString) {
      current += char;
      continue;
    }

    if (char === '(') {
      parenDepth++;
      if (parenDepth === 1) {
        valueStart = true;
        current = '';
      }
      current += char;
      continue;
    }

    if (char === ')') {
      parenDepth--;
      current += char;
      if (parenDepth === 0) {
        const tuple = current.substring(1, current.length - 1);
        const parts = splitSQLTuple(tuple);
        values.push(parts);
        current = '';
        valueStart = false;
      }
      continue;
    }

    if (valueStart) {
      current += char;
    }
  }

  return values;
}

function splitSQLTuple(tuple) {
  const values = [];
  let current = '';
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < tuple.length; i++) {
    const char = tuple[i];

    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      current += char;
      continue;
    }

    if (char === "'") {
      inString = !inString;
      current += char;
      continue;
    }

    if (inString) {
      current += char;
      continue;
    }

    if (char === ',') {
      values.push(current.trim());
      current = '';
      continue;
    }

    if (char === 'N' && tuple.substring(i, i + 4) === 'NULL') {
      values.push('NULL');
      current = '';
      i += 3;
      continue;
    }

    if (!/\s/.test(char) || current.length > 0) {
      current += char;
    }
  }

  if (current.trim() || current === '') {
    values.push(current.trim());
  }

  return values;
}

// Main analysis
console.log('Analyzing WordPress database...\n');

const databasePath = path.join(CONFIG.wordpressBackupPath, CONFIG.databaseFile);
const sqlContent = fs.readFileSync(databasePath, 'utf8');

// Parse wp_posts
const postsMatch = sqlContent.match(/INSERT INTO `wp_posts` VALUES ([\s\S]+?);\n/);
if (!postsMatch) {
  console.error('Could not find wp_posts table');
  process.exit(1);
}

const rows = parseSQLValues(postsMatch[1]);
console.log(`Total rows in wp_posts: ${rows.length}\n`);

const byType = {};
const byStatus = {};
const byTypeAndStatus = {};
const samples = {};

for (const row of rows) {
  if (row.length < 23) continue;

  const type = parseSQLValue(row[20]);
  const status = parseSQLValue(row[7]);
  const title = parseSQLValue(row[5]);
  const date = parseSQLValue(row[2]);

  if (!byType[type]) byType[type] = 0;
  byType[type]++;

  if (!byStatus[status]) byStatus[status] = 0;
  byStatus[status]++;

  const key = `${type}|${status}`;
  if (!byTypeAndStatus[key]) byTypeAndStatus[key] = 0;
  byTypeAndStatus[key]++;

  // Save some samples
  if (!samples[key]) samples[key] = [];
  if (samples[key].length < 5) {
    samples[key].push({ title, date });
  }
}

console.log('Posts by Type:');
for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${type}: ${count}`);
}

console.log('\nPosts by Status:');
for (const [status, count] of Object.entries(byStatus).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${status}: ${count}`);
}

console.log('\nPosts by Type and Status (with samples):');
for (const [key, count] of Object.entries(byTypeAndStatus).sort((a, b) => b[1] - a[1])) {
  const [type, status] = key.split('|');
  console.log(`\n  ${type} | ${status}: ${count}`);
  if (samples[key]) {
    for (const sample of samples[key]) {
      console.log(`    - "${sample.title}" (${sample.date})`);
    }
  }
}

// Count images/attachments
const attachments = rows.filter(row => parseSQLValue(row[20]) === 'attachment');
console.log(`\n\nTotal attachments (images/media): ${attachments.length}`);

// Also count files in uploads directory
const uploadsPath = path.join(CONFIG.wordpressBackupPath, 'wp-content/uploads');
if (fs.existsSync(uploadsPath)) {
  const countFiles = (dir) => {
    let count = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        count += countFiles(path.join(dir, entry.name));
      } else if (entry.isFile()) {
        const ext = entry.name.toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.mp4', '.mp3'].includes(ext)) {
          count++;
        }
      }
    }
    return count;
  };
  const fileCount = countFiles(uploadsPath);
  console.log(`Total media files in uploads directory: ${fileCount}`);
}
