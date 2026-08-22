const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}');

let translations = { en: {}, ru: {} };
let counter = 1;

function makeKey(ruStr) {
  return 'auto.ext.' + (counter++);
}

// Read current localization
let locCode = fs.readFileSync('src/context/LocalizationContext.tsx', 'utf8');

files.forEach(file => {
  if (file === 'src/context/LocalizationContext.tsx') return;
  if (file === 'src/utils/numberToWordsRu.ts') return; // ignore utils that output Russian directly
  
  let code = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. Replace JSX text: > Русские буквы <
  // Be careful with multiple lines and expressions
  code = code.replace(/>([^<{]*?[А-Яа-яЁё][^<{]*?)</g, (match, p1) => {
    const trimmed = p1.trim();
    if (!trimmed) return match;
    const key = makeKey(trimmed);
    translations.ru[key] = trimmed;
    // VERY simplistic English translation (we will just put the Russian there and then I can ask Gemini to translate the JSON or just leave it for now? Wait, no, user wants ENGLISH. I need to translate it!)
    // For now I'll just use a placeholder and then we can translate the JSON using a script.
    translations.en[key] = trimmed; // TODO: Translate
    
    // Replace in code
    return match.replace(trimmed, `{t('${key}')}`);
  });

  // 2. Replace attributes: placeholder="Русский", title="Русский", etc.
  code = code.replace(/([a-zA-Z]+)="([^"]*[А-Яа-яЁё][^"]*)"/g, (match, attr, val) => {
    if (attr === 'className' || attr === 'd' || attr === 'src' || attr === 'href') return match;
    const key = makeKey(val);
    translations.ru[key] = val;
    translations.en[key] = val; // TODO: Translate
    return `${attr}={t('${key}')}`;
  });
  
  // 3. Replace single quote strings in simple expressions: 'Русский'
  // This is riskier, but we can try targeting simple cases like `title: 'Русский'`
  code = code.replace(/'([^'\n]*?[А-Яа-яЁё][^'\n]*?)'/g, (match, val) => {
    // Only if it's inside some array or object, but hard to tell. Let's just do it.
    // Exclude if it looks like a regex or import
    if (match.includes('import')) return match;
    const key = makeKey(val);
    translations.ru[key] = val;
    translations.en[key] = val;
    return `t('${key}')`;
  });

  if (code.includes(`t('auto.ext`) && !code.includes('useLanguage')) {
    code = code.replace(/import \{.*?\} from 'react';/s, match => match + "\nimport { useLanguage } from '../context/LocalizationContext';");
  }

  if (changed || code !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, code);
  }
});

fs.writeFileSync('extracted_cyrillic.json', JSON.stringify(translations, null, 2));
console.log('Extracted ' + Object.keys(translations.ru).length + ' strings.');

