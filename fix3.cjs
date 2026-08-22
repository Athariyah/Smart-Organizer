const fs = require('fs');

const files = [
  'src/views/AnalyticsView.tsx',
  'src/views/TaxesView.tsx',
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // Fix nested ternaries: language === 'en' ? 'foo' : (language === 'en' ? 'foo' : 'bar')
  // For strings with escaped quotes
  code = code.replace(/language === 'en' \? '([^']+)' : \(language === 'en' \? '[^']+' : '([^']+)'\)/g, "language === 'en' ? '$1' : '$2'");
  
  code = code.replace(/\{language === 'en' \? 'Ratio of hours spent in \\'Deep Work\\' mode to total logged hours.' : \(language === 'en' \? 'Ratio of hours spent in \\'Deep Work\\' mode to total logged hours.' : 'Отношение часов, проведенных в режиме "Deep Work", к общему количеству залогированных часов.'\)\}/g, "{language === 'en' ? 'Ratio of hours spent in \\'Deep Work\\' mode to total logged hours.' : 'Отношение часов, проведенных в режиме \"Deep Work\", к общему количеству залогированных часов.'}");
  
  code = code.replace(/\{language === 'en' \? 'For internal Net Income tracking when working under NPD. Server and software expenses don\\'t reduce the NPD base but are important for analytics.' : \(language === 'en' \? 'For internal Net Income tracking when working under NPD. Server and software expenses don\\'t reduce the NPD base but are important for analytics.' : 'Для внутреннего учета чистой прибыли \(Net Income\) при работе на НПД. Расходы на серверы и софт не уменьшают базу НПД, но важны для аналитики.'\)\}/g, "{language === 'en' ? 'For internal Net Income tracking when working under NPD. Server and software expenses don\\'t reduce the NPD base but are important for analytics.' : 'Для внутреннего учета чистой прибыли (Net Income) при работе на НПД. Расходы на серверы и софт не уменьшают базу НПД, но важны для аналитики.'}");

  fs.writeFileSync(f, code);
  console.log(`Cleaned ${f}`);
});
