import fs from 'fs';
import path from 'path';

const schemaDir = path.resolve('./services/api/src/database/schema');
const seedPath = path.resolve('./services/api/src/database/seed.ts');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/from '\.\/([a-zA-Z0-9_]+)'/g, "from './$1.js'");
  content = content.replace(/export \* from '\.\/([a-zA-Z0-9_]+)'/g, "export * from './$1.js'");
  fs.writeFileSync(filePath, content);
}

fs.readdirSync(schemaDir).forEach(file => {
  if (file.endsWith('.ts')) {
    processFile(path.join(schemaDir, file));
  }
});
processFile(seedPath);

console.log('Fixed imports in schema dir and seed.ts');
