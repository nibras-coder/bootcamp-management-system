const fs = require('fs');
const files = ['src/index.css', 'src/style.css'];
files.forEach(f => {
  if (fs.existsSync(f)) {
    const text = fs.readFileSync(f, 'utf8');
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let inString = false;
      let stringChar = '';
      for (let j = 0; j < line.length; j++) {
        if (!inString && (line[j] === '\'' || line[j] === '"')) {
          inString = true;
          stringChar = line[j];
        } else if (inString && line[j] === stringChar && line[j-1] !== '\\') {
          inString = false;
        }
      }
      if (inString) console.log(f + ':' + (i+1) + ' has an unclosed string: ' + line.trim());
    }
  }
})
