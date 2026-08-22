const fs = require('fs');

const files = [
  'src/views/DashboardView.tsx',
  'src/views/AnalyticsView.tsx',
  'src/views/SettingsView.tsx',
  'src/views/TasksView.tsx',
  'src/views/TaxesView.tsx',
  'src/views/ReportsView.tsx',
  'src/views/ClientsView.tsx',
  'src/views/InvoiceDetailView.tsx',
  'src/views/InvoiceFormView.tsx',
  'src/views/PublicInvoiceView.tsx',
  'src/views/RegisterView.tsx',
  'src/views/LoginView.tsx',
  'src/components/Navbar.tsx',
  'src/components/Sidebar.tsx',
  'src/components/UpcomingDeadlinesWidget.tsx',
  'src/components/WeeklyProductivityWidget.tsx',
];

// Read files and see which ones don't import useLanguage
files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf-8');
  if (code.match(/[А-Яа-я]/)) {
     console.log(f, "has russian characters:", code.match(/[А-Яа-я]+/g).length);
  }
});
