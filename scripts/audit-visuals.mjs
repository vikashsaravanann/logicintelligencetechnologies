import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, "../src");
const PUBLIC_DIR = path.join(__dirname, "../public");

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else {
      if (filepath.endsWith(".tsx") || filepath.endsWith(".ts")) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
}

const files = walkSync(SRC_DIR);
let errorCount = 0;

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  // Basic regex to find strings matching /images/.. or /assets/..
  const matches = content.match(/["'`](\/(images|assets)\/[^"'`\?]+)(\?.*?)?["'`]/g);
  if (matches) {
    for (const match of matches) {
      // Clean quotes and splits on srcset if needed
      let rawPath = match.replace(/^["'`]|["'`]$/g, "").split("?")[0];
      // Skip template string variables
      if (rawPath.includes("${")) continue;
      
      // If it's a srcset string, it might have commas and spaces.
      // E.g., "/assets/logo.png 1x, /assets/logo2x.png 2x"
      // Just take the first valid path for simplicity or skip srcset checking in this basic script.
      if (rawPath.includes(",")) {
        rawPath = rawPath.split(",")[0].trim().split(" ")[0];
      }
      if (rawPath.includes(" ")) {
        rawPath = rawPath.split(" ")[0];
      }
      const publicPath = path.join(PUBLIC_DIR, rawPath);
      if (!fs.existsSync(publicPath)) {
        console.error(`❌ Missing asset: ${rawPath} in ${path.relative(SRC_DIR, file)}`);
        errorCount++;
      }
    }
  }
}

if (errorCount > 0) {
  console.error(`\nFound ${errorCount} missing assets.`);
  process.exit(1);
} else {
  console.log("✅ All visual assets exist.");
  process.exit(0);
}
