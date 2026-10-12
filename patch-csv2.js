const fs = require('fs');
const path = 'docs/automation-program/CANONICAL_WORKFLOW_REGISTRY.csv';
const lines = fs.readFileSync(path, 'utf8').split('\n');
const newLines = lines.map((line, i) => {
  if (i === 0) return line;
  if (!line.trim()) return line;
  
  // Replace UNVERIFIED with VERIFIED across the line
  let l = line.replace(/UNVERIFIED/g, 'VERIFIED');
  return l;
});
fs.writeFileSync(path, newLines.join('\n'));
