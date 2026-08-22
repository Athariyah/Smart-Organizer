const fs = require('fs');

let file = fs.readFileSync('src/views/DashboardView.tsx', 'utf8');

file = file.replace(/const \[isJiraSyncEnabled, setIsJiraSyncEnabled\] = React\.useState\(false\);/, "const [isJiraSyncEnabled, setIsJiraSyncEnabled] = React.useState(false);\n  const [isGithubSyncEnabled, setIsGithubSyncEnabled] = React.useState(true);");

fs.writeFileSync('src/views/DashboardView.tsx', file);
