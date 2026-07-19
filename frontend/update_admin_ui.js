const fs = require('fs');
const file = './src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Import
const importStatement = `import TemplatesManager from '../components/TemplatesManager';\n`;
if (!content.includes('TemplatesManager')) {
    content = content.replace("import { motion, AnimatePresence } from 'framer-motion';", importStatement + "import { motion, AnimatePresence } from 'framer-motion';");
}

// 2. Add Component to Admin panel
const adminHeader = `<h3 className="font-bold text-sm text-[#132040]">🛡️ Host/Admin Panel</h3>`;
const adminInjection = `${adminHeader}
        <TemplatesManager />`;

if (!content.includes('<TemplatesManager />')) {
    content = content.replace(adminHeader, adminInjection);
}

fs.writeFileSync(file, content, 'utf8');
