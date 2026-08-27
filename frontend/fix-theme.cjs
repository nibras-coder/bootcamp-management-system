const fs = require("fs");
const path = require("path");

const directoryPath = path.join(__dirname, "src");

const replacements = [
  { regex: /text-gray-900(?!\s+dark:text-)/g, replacement: "text-gray-900 dark:text-gray-100" },
  { regex: /text-gray-800(?!\s+dark:text-)/g, replacement: "text-gray-800 dark:text-gray-200" },
  { regex: /text-gray-700(?!\s+dark:text-)/g, replacement: "text-gray-700 dark:text-gray-300" },
  { regex: /text-gray-600(?!\s+dark:text-)/g, replacement: "text-gray-600 dark:text-gray-300" },
  { regex: /bg-white(?!\s+dark:bg-)/g, replacement: "bg-white dark:bg-gray-800" },
  { regex: /border-gray-200(?!\s+dark:border-)/g, replacement: "border-gray-200 dark:border-gray-700" },
  { regex: /border-gray-300(?!\s+dark:border-)/g, replacement: "border-gray-300 dark:border-gray-600" },
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith(".jsx")) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(directoryPath);
let modifiedCount = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let originalContent = content;

  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, "utf8");
    modifiedCount++;
  }
});

console.log(`Modified ${modifiedCount} files.`);
