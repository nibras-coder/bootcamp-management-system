import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/localStorage\.getItem\(\s*['"]token['"]\s*\)/g, 'sessionStorage.getItem("token")');
  content = content.replace(/localStorage\.setItem\(\s*['"]token['"]/g, 'sessionStorage.setItem("token"');
  content = content.replace(/localStorage\.removeItem\(\s*['"]token['"]\s*\)/g, 'sessionStorage.removeItem("token")');

  content = content.replace(/localStorage\.getItem\(\s*['"]user['"]\s*\)/g, 'sessionStorage.getItem("user")');
  content = content.replace(/localStorage\.setItem\(\s*['"]user['"]/g, 'sessionStorage.setItem("user"');
  content = content.replace(/localStorage\.removeItem\(\s*['"]user['"]\s*\)/g, 'sessionStorage.removeItem("user")');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
