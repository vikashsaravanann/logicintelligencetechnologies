const fs = require('fs');
const path = 'docs/automation-program/CANONICAL_WORKFLOW_REGISTRY.csv';
const lines = fs.readFileSync(path, 'utf8').split('\n');
const newLines = lines.map((line, i) => {
  if (i === 0) return line;
  if (!line.trim()) return line;
  const parts = line.split(',');
  if (parts.length >= 8) {
    // Column 7 is live_status
    parts[7] = 'ACTIVE';
  }
  return parts.join(',');
});
fs.writeFileSync(path, newLines.join('\n'));
