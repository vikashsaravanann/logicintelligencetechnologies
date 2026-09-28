/**
 * Decode founder gallery JPEGs from base64 sidecars into public/images/founder.
 * Supports single .b64 or split .b64.part1 + .b64.part2.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dir = path.join(root, "public", "images", "founder");
const files = ["founder-about-main.jpg", "founder-about-card.jpg"];

for (const name of files) {
  const single = path.join(__dirname, `${name}.b64`);
  const p1 = path.join(__dirname, `${name}.b64.part1`);
  const p2 = path.join(__dirname, `${name}.b64.part2`);
  let b64 = null;
  if (fs.existsSync(single)) {
    b64 = fs.readFileSync(single, "utf8");
  } else if (fs.existsSync(p1) && fs.existsSync(p2)) {
    b64 = fs.readFileSync(p1, "utf8") + fs.readFileSync(p2, "utf8");
  } else {
    console.warn(`[decode-founder] skip missing ${name}.b64`);
    continue;
  }
  const buf = Buffer.from(b64.replace(/\s+/g, ""), "base64");
  fs.mkdirSync(dir, { recursive: true });
  const outPath = path.join(dir, name);
  fs.writeFileSync(outPath, buf);
  console.log(`[decode-founder] wrote ${name} (${buf.length} bytes)`);
}
