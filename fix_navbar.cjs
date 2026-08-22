const fs = require('fs');
let c = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
c = c.replace(/alert\(\\\`/g, 'alert(`');
fs.writeFileSync('src/components/Navbar.tsx', c);
