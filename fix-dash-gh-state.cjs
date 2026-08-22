const fs = require('fs');

let file = fs.readFileSync('src/views/DashboardView.tsx', 'utf8');

if (!file.includes('const [isGithubSyncEnabled')) {
  file = file.replace(/const \[isJiraSyncEnabled, setIsJiraSyncEnabled\] = useState\(false\);/, "const [isJiraSyncEnabled, setIsJiraSyncEnabled] = useState(false);\n  const [isGithubSyncEnabled, setIsGithubSyncEnabled] = useState(true);");
}

fs.writeFileSync('src/views/DashboardView.tsx', file);
