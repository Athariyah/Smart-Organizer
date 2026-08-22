const fs = require('fs');

let file = fs.readFileSync('src/hooks/useKeyboardShortcuts.ts', 'utf8');

// Revert descriptions in list
file = file.replace("{ key: 'X', description: 'Перейти в Налоги НПД (Калькулятор)', category: 'Навигация' }", "{ key: 'G затем X', description: 'Перейти в Налоги НПД (Калькулятор)', category: 'Навигация' }");
file = file.replace("{ key: 'S', description: 'Перейти в Настройки', category: 'Навигация' }", "{ key: 'G затем S', description: 'Перейти в Настройки', category: 'Навигация' }");

// Remove standalone handlers
file = file.replace(/      \/\/ Handle standalone shortcuts\n      if \(e\.key\.toLowerCase\(\) === 'x' \|\| e\.key\.toLowerCase\(\) === 'ч'\) \{\n        e\.preventDefault\(\);\n        onNavigate\('\/taxes'\);\n        return;\n      \}\n      if \(e\.key\.toLowerCase\(\) === 's' \|\| e\.key\.toLowerCase\(\) === 'ы'\) \{\n        e\.preventDefault\(\);\n        onNavigate\('\/settings'\);\n        return;\n      \}\n/g, "");

// Add back to sequence handlers
const xAndSHandlers = `          case 'k': // Calendar / Л
          case 'л':
            onNavigate('/calendar');
            handled = true;
            break;
          case 'x': // Taxes / Ч
          case 'ч':
            onNavigate('/taxes');
            handled = true;
            break;
          case 's': // Settings / Ы
          case 'ы':
            onNavigate('/settings');
            handled = true;
            break;`;

file = file.replace(/          case 'k': \/\/ Calendar \/ Л\n          case 'л':\n            onNavigate\('\/calendar'\);\n            handled = true;\n            break;/g, xAndSHandlers);

fs.writeFileSync('src/hooks/useKeyboardShortcuts.ts', file);
