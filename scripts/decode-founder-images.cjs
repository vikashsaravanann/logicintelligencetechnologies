/**
 * Decode founder gallery JPEGs from base64 sidecars into public/images/founder.
 * Runs as prebuild so Vercel ships the real binaries.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dir = path.join(root, "public", "images", "founder");
const files = ["founder-about-main.jpg", "founder-about-card.jpg"];

for (const name of files) {
  const b64Path = path.join(__dirname, `${name}.b64`);
  const outPath = path.join(dir, name);
  if (!fs.existsSync(b64Path)) {
    console.warn(`[decode-founder] skip missing ${b64Path}`);
    continue;
  }
  const buf = Buffer.from(fs.readFileSync(b64Path, "utf8"), "base64");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outPath, buf);
  console.log(`[decode-founder] wrote ${name} (${buf.length} bytes)`);
}
