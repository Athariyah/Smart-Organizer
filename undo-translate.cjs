const fs = require('fs');
const path = require('path');
const glob = require('glob');

const translations = JSON.parse(fs.readFileSync('extracted_cyrillic.json', 'utf8'));

// Reverse mapping: key -> russian string
const ruMap = translations.ru;

const files = glob.sync('src/**/*.{ts,tsx}');

files.forEach(file => {
  if (file === 'src/context/LocalizationContext.tsx') return;
  
  let code = fs.readFileSync(file, 'utf8');
  let changed = false;

  // We need to replace `{t('auto.ext.X')}` with the original string, keeping in mind context.
  // Actually, replacing `{t('auto.ext.X')}` back to the raw string might leave surrounding tags messy if it was `{t('auto.ext.X')}` but original was `Русский`.
  // The original regex was:
  // 1. match.replace(trimmed, `{t('${key}')}`)
  // 2. attr={t('${key}')}
  // 3. t('${key}') for quotes
  
  // Let's just find `t('auto.ext.\\d+')` or `{t('auto.ext.\\d+')}`
  
  // Reverse 2 & 3: t('auto.ext.X') where original had quotes or was an attribute
  code = code.replace(/\{t\('(auto\.ext\.\d+)'\)\}/g, (match, key) => {
    return ruMap[key] || match;
  });
  
  code = code.replace(/t\('(auto\.ext\.\d+)'\)/g, (match, key) => {
    return "'" + (ruMap[key] || match) + "'";
  });

  if (code !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, code);
  }
});

console.log('Undo completed.');

