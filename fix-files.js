const fs = require('fs');

let file = fs.readFileSync('src/components/RegionalNpdTipsHelper.tsx', 'utf8');
file = file.replace(/export const RegionalNpdTipsHelper: React\.FC<RegionalNpdTipsHelperProps> = \(\{[\s\S]*?\}\) => \{/, (match) => {
  if (match.includes('useLanguage')) return match;
  return match + '\n  const { t } = useLanguage();';
});
fs.writeFileSync('src/components/RegionalNpdTipsHelper.tsx', file);

file = fs.readFileSync('src/views/PublicInvoiceView.tsx', 'utf8');
file = file.replace(/export const PublicInvoiceView: React\.FC = \(\) => \{/, (match) => {
  return match + '\n  const { t } = useLanguage();';
});
// also try default export or normal function
file = file.replace(/export default function PublicInvoiceView\(\) \{/, (match) => {
  return match + '\n  const { t } = useLanguage();';
});
fs.writeFileSync('src/views/PublicInvoiceView.tsx', file);

