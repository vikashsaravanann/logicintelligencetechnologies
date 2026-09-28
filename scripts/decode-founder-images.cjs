const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "public", "images", "founder");
fs.mkdirSync(dir, { recursive: true });

function loadB64(name) {
  const jsonPath = path.join(__dirname, name + ".b64.json");
  if (fs.existsSync(jsonPath)) {
    try {
      return JSON.parse(fs.readFileSync(jsonPath, "utf8")).b64;
    } catch (_) {}
  }
  const single = path.join(__dirname, name + ".b64");
  if (fs.existsSync(single)) return fs.readFileSync(single, "utf8");
  const parts = [];
  for (let i = 0; i < 32; i++) {
    const p = path.join(__dirname, `${name}.b64.part${i}`);
    if (!fs.existsSync(p)) break;
    const t = fs.readFileSync(p, "utf8").trim();
    if (t === "PLACEHOLDER" || t === "LOADING") continue;
    parts.push(t);
  }
  if (parts.length) return parts.join("");
  return null;
}

function isValidJpeg(buf) {
  return Buffer.isBuffer(buf) && buf.length > 1000 && buf[0] === 0xff && buf[1] === 0xd8;
}

for (const name of ["founder-about-main.jpg", "founder-about-card.jpg"]) {
  const outPath = path.join(dir, name);
  const b64 = loadB64(name);
  if (b64) {
    try {
      const buf = Buffer.from(String(b64).replace(/\s+/g, ""), "base64");
      if (isValidJpeg(buf)) {
        fs.writeFileSync(outPath, buf);
        console.log(`[decode-founder] wrote ${name} from b64 (${buf.length} bytes)`);
        continue;
      }
    } catch (e) {
      console.warn(`[decode-founder] b64 decode failed for ${name}:`, e.message);
    }
  }
  if (name === "founder-about-main.jpg") {
    let existing = null;
    try {
      existing = fs.existsSync(outPath) ? fs.readFileSync(outPath) : null;
    } catch (_) {}
    if (!isValidJpeg(existing)) {
      const fallback = path.join(dir, "vikash-primary-square-v2.jpg");
      if (fs.existsSync(fallback)) {
        fs.copyFileSync(fallback, outPath);
        console.log(`[decode-founder] restored ${name} from vikash-primary-square-v2.jpg`);
      }
    }
  }
}
