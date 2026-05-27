'use strict';

/**
 * Generates all static JSON files under docs/ from data/tips.csv.
 *
 * Usage:
 *   node scripts/generate.js           → generates everything
 *   node scripts/generate.js --today   → regenerates docs/tip/today.json only
 *   node scripts/generate.js --random  → regenerates docs/tip/random.json only
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// CSV parser (semicolon delimiter, RFC 4180 quoting)
// ---------------------------------------------------------------------------

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ';' && !inQuotes) {
      fields.push(current.trim()); current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCSV(content) {
  const lines = content.replace(/\r/g, '').split('\n').filter(l => l.trim() !== '');
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] !== undefined ? values[i] : ''; });
    return obj;
  });
}

// ---------------------------------------------------------------------------
// Tip helpers
// ---------------------------------------------------------------------------

function toJSON(tip) {
  return {
    id: parseInt(tip.id, 10),
    functionality: tip.functionality,
    title: tip.title,
    description: tip.description,
    url: tip['post-slug'],
  };
}

function todayTip(tips) {
  const now = new Date();
  const startOfYear = new Date(now.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  return tips[dayOfYear % tips.length];
}

function randomTip(tips) {
  return tips[Math.floor(Math.random() * tips.length)];
}

// ---------------------------------------------------------------------------
// File writer
// ---------------------------------------------------------------------------

function write(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`  wrote ${path.relative(process.cwd(), filePath)}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const ROOT = path.join(__dirname, '..');
const csvContent = fs.readFileSync(path.join(ROOT, 'data', 'tips.csv'), 'utf8');
const tips = parseCSV(csvContent);
const docs = path.join(ROOT, 'docs');

const args = process.argv.slice(2);
const onlyToday = args.includes('--today');
const onlyRandom = args.includes('--random');

if (onlyToday) {
  write(path.join(docs, 'tip', 'today.json'), toJSON(todayTip(tips)));

} else if (onlyRandom) {
  write(path.join(docs, 'tip', 'random.json'), toJSON(randomTip(tips)));

} else {
  console.log('Generating all static API files...');

  // /tips.json — full list
  write(path.join(docs, 'tips.json'), tips.map(toJSON));

  // /tip/{id}.json — one per tip
  tips.forEach(tip => {
    write(path.join(docs, 'tip', `${tip.id}.json`), toJSON(tip));
  });

  // /tip/today.json
  write(path.join(docs, 'tip', 'today.json'), toJSON(todayTip(tips)));

  // /tip/random.json
  write(path.join(docs, 'tip', 'random.json'), toJSON(randomTip(tips)));

  console.log(`\nDone — ${tips.length} tips, ${tips.length + 3} JSON files.`);
}
