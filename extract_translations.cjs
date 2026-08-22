const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}');

let matches = [];

files.forEach(f => {
  const code = fs.readFileSync(f, 'utf8');
  const regex1 = /language === 'ru' \? '([^']+)' : '([^']+)'/g;
  const regex2 = /language === 'en' \? '([^']+)' : '([^']+)'/g;
  
  let m;
  while ((m = regex1.exec(code)) !== null) {
    matches.push({ file: f, match: m[0], ru: m[1], en: m[2], full: m[0], type: 'ru' });
  }
  while ((m = regex2.exec(code)) !== null) {
    matches.push({ file: f, match: m[0], en: m[1], ru: m[2], full: m[0], type: 'en' });
  }
});

console.log(`Found ${matches.length} hardcoded language ternaries.`);
fs.writeFileSync('matches.json', JSON.stringify(matches, null, 2));

