const fs = require('fs');
const path = require('path');

const pages = [
  "src/app/admin/voiceshield-requests/page.tsx",
  "src/app/company/facts/page.tsx",
  "src/app/privacy/page.tsx",
  "src/app/products/facts/page.tsx",
  "src/app/security/page.tsx",
  "src/app/(marketing)/privacy-policy/page.tsx",
  "src/app/(marketing)/terms-of-service/page.tsx",
  "src/app/pricing/page.tsx",
  "src/app/products/ai-voice-agents/page.tsx",
  "src/app/products/ai-website-agents/page.tsx",
  "src/app/(marketing)/ai-discovery/page.tsx",
  "src/app/(marketing)/ai-ethics/page.tsx",
  "src/app/(marketing)/architecture/page.tsx",
  "src/app/(marketing)/community/page.tsx",
  "src/app/(marketing)/docs/api/page.tsx",
  "src/app/(marketing)/help-center/page.tsx",
  "src/app/(marketing)/investor-brief/page.tsx",
  "src/app/(marketing)/knowledge-base/page.tsx",
  "src/app/(marketing)/roi-calculator/page.tsx",
  "src/app/(marketing)/sales/page.tsx",
  "src/app/(marketing)/status/page.tsx",
];

for (const file of pages) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) {
    console.log(`Skipping ${file} - does not exist`);
    continue;
  }
  let content = fs.readFileSync(p, 'utf8');

  // Skip if already imported
  if (content.includes('BackToHome')) {
    console.log(`Skipping ${file} - already has BackToHome`);
    continue;
  }

  // Insert import statement after the last import
  const importStatement = `import BackToHome from "@/components/ui/back-to-home";\n`;
  const lastImportIndex = content.lastIndexOf('import ');
  
  if (lastImportIndex !== -1) {
    const nextNewline = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, nextNewline + 1) + importStatement + content.slice(nextNewline + 1);
  } else {
    // If no imports exist, add to top
    content = importStatement + "\n" + content;
  }

  // Find the first return statement of the main component
  const exportDefaultMatch = content.match(/export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/);
  if (exportDefaultMatch) {
    const afterExport = content.slice(exportDefaultMatch.index);
    const returnMatch = afterExport.match(/return\s*\(\s*(<[^>]+>)/);
    
    if (returnMatch) {
      // Find where the first tag starts
      const returnIndex = exportDefaultMatch.index + returnMatch.index + returnMatch[0].lastIndexOf(returnMatch[1]);
      const tagContent = returnMatch[1];
      
      let insertion = `\n      <BackToHome />`;
      if (tagContent.includes('PageShell')) {
         // insert inside PageShell
         content = content.slice(0, returnIndex + tagContent.length) + insertion + content.slice(returnIndex + tagContent.length);
      } else {
         // insert inside whatever tag it is
         content = content.slice(0, returnIndex + tagContent.length) + insertion + content.slice(returnIndex + tagContent.length);
      }
      
      fs.writeFileSync(p, content);
      console.log(`Updated ${file}`);
    } else {
      console.log(`Could not find return statement for ${file}`);
    }
  } else {
    console.log(`Could not find export default function for ${file}`);
  }
}
