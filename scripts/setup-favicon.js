/**
 * Copies logo.jpg as favicon files for the project.
 * Since browsers accept .jpg as favicon via <link> tag (with ICO fallback),
 * this script copies the logo to apple-touch-icon.png, favicon-32.jpg etc.
 *
 * Usage: node scripts/setup-favicon.js
 */

const fs   = require('fs');
const path = require('path');

const SRC  = path.join(__dirname, '../public/logo.jpg');
const DEST_DIR = path.join(__dirname, '../public');

const copies = [
  'apple-touch-icon.jpg',
  'favicon-192.jpg',
  'favicon-512.jpg',
];

console.log('📌 Copying logo.jpg as favicon assets...');
for (const name of copies) {
  fs.copyFileSync(SRC, path.join(DEST_DIR, name));
  console.log(`  ✅ /public/${name}`);
}

console.log('\n✨ Done! Update app/layout.js to reference these if needed.');
process.exit(0);
