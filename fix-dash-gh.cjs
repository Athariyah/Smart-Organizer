const fs = require('fs');

let file = fs.readFileSync('src/views/DashboardView.tsx', 'utf8');

// Add state
file = file.replace(/const \[isJiraSyncEnabled, setIsJiraSyncEnabled\] = useState\(false\);/, "const [isJiraSyncEnabled, setIsJiraSyncEnabled] = useState(false);\n  const [isGithubSyncEnabled, setIsGithubSyncEnabled] = useState(true);");

// Replace toggle
const ghOld = `<input type="checkbox" className="sr-only" defaultChecked />
                <div className="block bg-emerald-500 w-8 h-5 rounded-full"></div>
                <div className="dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition transform translate-x-3"></div>`;
                
const ghNew = `<input type="checkbox" className="sr-only" checked={isGithubSyncEnabled} onChange={(e) => setIsGithubSyncEnabled(e.target.checked)} />
                <div className={\`block w-8 h-5 rounded-full transition-colors \${isGithubSyncEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}\`}></div>
                <div className={\`dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition transform \${isGithubSyncEnabled ? 'translate-x-3' : ''}\`}></div>`;

file = file.replace(ghOld, ghNew);

fs.writeFileSync('src/views/DashboardView.tsx', file);
