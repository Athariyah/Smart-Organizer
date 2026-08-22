const fs = require('fs');

const files = [
  'src/views/DashboardView.tsx',
  'src/views/AnalyticsView.tsx',
  'src/views/SettingsView.tsx',
  'src/views/TasksView.tsx',
  'src/views/TaxesView.tsx',
  'src/views/ReportsView.tsx',
  'src/components/Navbar.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // Fix nested ternaries: language === 'en' ? 'foo' : (language === 'en' ? 'foo' : 'bar')
  // We can use a regex to replace this with just language === 'en' ? 'foo' : 'bar'
  code = code.replace(/language === 'en' \? '([^']+)' : \(language === 'en' \? '[^']+' : '([^']+)'\)/g, "language === 'en' ? '$1' : '$2'");

  fs.writeFileSync(f, code);
  console.log(`Cleaned ${f}`);
});
