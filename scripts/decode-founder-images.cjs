const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "public", "images", "founder");
fs.mkdirSync(dir, { recursive: true });

function loadB64(name) {
  const single = path.join(__dirname, `${name}.b64`);
  if (fs.existsSync(single)) {
    return fs.readFileSync(single, "utf8");
  }
  const parts = [];
  for (let i = 0; i < 32; i++) {
    const p = path.join(__dirname, `${name}.b64.part${i}`);
    if (!fs.existsSync(p)) break;
    parts.push(fs.readFileSync(p, "utf8"));
  }
  if (parts.length) return parts.join("");
  const p1 = path.join(__dirname, `${name}.b64.part1`);
  const p2 = path.join(__dirname, `${name}.b64.part2`);
  if (fs.existsSync(p1) && fs.existsSync(p2)) {
    return fs.readFileSync(p1, "utf8") + fs.readFileSync(p2, "utf8");
  }
  return null;
}

for (const name of ["founder-about-main.jpg", "founder-about-card.jpg"]) {
  const b64 = loadB64(name);
  if (!b64) {
    console.warn("[decode-founder] skip", name);
    continue;
  }
  const buf = Buffer.from(b64.replace(/\s+/g, ""), "base64");
  fs.writeFileSync(path.join(dir, name), buf);
  console.log(`[decode-founder] wrote ${name} (${buf.length} bytes)`);
}
