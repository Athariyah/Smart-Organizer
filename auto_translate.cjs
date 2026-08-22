const fs = require('fs');

const matches = JSON.parse(fs.readFileSync('matches.json', 'utf8'));
const files = [...new Set(matches.map(m => m.file))];

// Generate keys
const newTranslations = {};
let keyCounter = 1;

function makeKey(enStr) {
  let base = enStr.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').slice(0, 4).join('').toLowerCase();
  if (!base) base = 'str';
  let key = `auto.${base}`;
  if (newTranslations[key] && newTranslations[key].en !== enStr) {
    key = `auto.${base}${keyCounter++}`;
  }
  newTranslations[key] = { en: enStr };
  return key;
}

const fileReplacements = {};
files.forEach(f => fileReplacements[f] = []);

matches.forEach(m => {
  const key = makeKey(m.en);
  newTranslations[key].ru = m.ru;
  fileReplacements[m.file].push({
    find: m.full,
    replace: `t('${key}')`
  });
});

// Apply replacements to files
files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  fileReplacements[f].forEach(rep => {
    // Escape for regex, but wait, normal string replacement works for first instance if we iterate, 
    // better to use split/join
    code = code.split(rep.find).join(rep.replace);
  });
  
  // ensure useLanguage is imported if we are using t()
  if (!code.includes('useLanguage')) {
    code = code.replace(/import \{.*?\} from 'lucide-react';/s, match => match + "\nimport { useLanguage } from '../context/LocalizationContext';");
  }
  
  if (code.includes(`t('`) && !code.includes('const { t } = useLanguage()') && !code.includes('const { t, language } = useLanguage()') && !code.includes('const { language, t } = useLanguage()') && !code.includes('const { language, toggleLanguage, t } = useLanguage()')) {
    // Try to inject const { t } = useLanguage();
    // This is hard to do safely globally via regex, let's see. 
    // Most components already have `const { language } = useLanguage();`
    code = code.replace(/const \{ language \} = useLanguage\(\);/g, "const { language, t } = useLanguage();");
  }

  fs.writeFileSync(f, code);
  console.log(`Updated ${f}`);
});

// Update LocalizationContext
let locCode = fs.readFileSync('src/context/LocalizationContext.tsx', 'utf8');
let enStrs = [];
let ruStrs = [];

for (const [k, v] of Object.entries(newTranslations)) {
  enStrs.push(`    '${k}': '${v.en.replace(/'/g, "\\'")}',`);
  ruStrs.push(`    '${k}': '${v.ru.replace(/'/g, "\\'")}',`);
}

locCode = locCode.replace(/export const TRANSLATIONS: Record<Language, Record<string, string>> = \{\n  en: \{/, "export const TRANSLATIONS: Record<Language, Record<string, string>> = {\n  en: {\n" + enStrs.join('\n'));
locCode = locCode.replace(/ru: \{/, "ru: {\n" + ruStrs.join('\n'));

fs.writeFileSync('src/context/LocalizationContext.tsx', locCode);
console.log('Updated LocalizationContext');

