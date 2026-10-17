import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render, toPlainText } from "@react-email/components";
import { REFERENCE_EMAIL_PREVIEWS } from "../emails/reference-design/previews";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUTPUT = path.join(ROOT, "artifacts", "email-reference-designs");
const PUBLIC = path.join(ROOT, "public");
const SITE = "https://www.logicintelligencetechnologies.in";
const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

interface PreviewMetadata {
  key: string;
  name: string;
  subject: string;
  reference: string;
  category: string;
  source: "reference" | "registry" | "auth";
  registryKey?: string;
  templateKey?: string;
  description?: string;
  defaultSender?: string;
  replyTo?: string;
}

interface RenderedPreview extends PreviewMetadata {
  html: string;
  preview: string;
  text: string;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!;
  });
}

// Inline only our public artwork, logo and fonts. Never fetch external resources.
const assetCache = new Map<string, Promise<string>>();
const missingFonts = new Set<string>();
const PUBLIC_ASSET = /(?:https?:\/\/(?:www\.)?logicintelligencetechnologies\.in)?\/(?:email-assets\/reference\/[\w./-]+\.(?:png|jpe?g|webp|gif|svg|woff2?)|assets\/logo-icon\.jpg)(?:\?[^"'()\s<>]*)?/gi;
function inlineAsset(source: string): Promise<string> {
  const url = new URL(source.replace(/&amp;/g, "&"), SITE);
  const pathname = decodeURIComponent(url.pathname);
  const cached = assetCache.get(pathname);
  if (cached) return cached;
  const operation = (async () => {
    const filename = path.resolve(PUBLIC, `.${pathname}`);
    if (!filename.startsWith(`${PUBLIC}${path.sep}`)) {
      throw new Error(`Asset path escapes public/: ${pathname}`);
    }
    try {
      const bytes = await readFile(filename);
      return `data:${MIME[path.extname(filename).toLowerCase()]};base64,${bytes.toString("base64")}`;
    } catch (error) {
      if (
        /\.woff2?$/i.test(pathname) &&
        (error as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        missingFonts.add(pathname);
        return source;
      }
      throw new Error(`Cannot embed preview asset ${pathname}. Create the public asset before rendering.`, { cause: error });
    }
  })();
  assetCache.set(pathname, operation);
  return operation;
}

async function standalonePreview(html: string): Promise<string> {
  // Matches both HTML image attributes and CSS url(), including optional light icons.
  const assets = new Set(html.match(PUBLIC_ASSET) ?? []);
  const replacements = new Map(
    await Promise.all([...assets].map(async (asset) => [asset, await inlineAsset(asset)] as const)),
  );
  // Replace in one pass: a shorter asset URL must not partially replace a longer one.
  let preview = html.replace(
    PUBLIC_ASSET,
    (asset) => replacements.get(asset) ?? asset,
  );
  // Keep preview navigation out of the email frame; the original stays untouched.
  preview = preview.replace(/<head(?:\s[^>]*)?>/i, '$&<base target="_blank" />');
  return preview;
}

function gallery(emails: RenderedPreview[], logo: string): string {
  // Escape script delimiters even if a future fixture contains literal HTML.
  const data = JSON.stringify(emails)
    .replace(/</g, "\\u003c")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  const links = emails.map((email, index) => `
    <a href="#${escapeHtml(email.key)}" data-key="${escapeHtml(email.key)}" class="nav-link">
      <span class="number">${String(index + 1).padStart(2, "0")}</span>
      <span><strong>${escapeHtml(email.name)}</strong><small>${escapeHtml(email.category)}</small></span>
      <span class="nav-arrow" aria-hidden="true">↗</span>
    </a>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light" />
<title>LIT · Email reference designs</title>
<style>
:root{font-family:Arial,Helvetica,sans-serif;color:#17201e;background:#f5f6f3;font-synthesis:none;--muted:#63706a;--line:#dce2dc;--accent:#224f3e}
*{box-sizing:border-box}body{margin:0}button,a{-webkit-tap-highlight-color:transparent}button{font:inherit;cursor:pointer}a{color:inherit}button:focus-visible,a:focus-visible{outline:3px solid #a283e6;outline-offset:3px}
.layout{display:grid;grid-template-columns:280px minmax(0,1fr);min-height:100vh}.sidebar{position:sticky;top:0;height:100vh;background:#fff;border-right:1px solid var(--line);padding:30px 20px;display:flex;flex-direction:column;gap:24px}.sidebar>div:nth-child(2){min-height:0;overflow-y:auto;flex:1}.brand{display:flex;align-items:center;gap:11px}.monogram{width:40px;height:40px;border-radius:12px;background:var(--accent);color:white;display:grid;place-items:center;font-size:13px;font-weight:800;letter-spacing:1px}.brand strong{font-size:13px;display:block}.brand small{display:block;margin-top:5px;font-size:11px;color:var(--muted)}.eyebrow{text-transform:uppercase;letter-spacing:1.6px;font-size:10px;font-weight:700;color:var(--muted);margin:0 10px 10px}.nav-link{display:flex;align-items:center;gap:12px;padding:12px 10px;margin:3px 0;border-radius:9px;text-decoration:none;border:1px solid transparent}.nav-link:hover{background:#f5f7f3}.nav-link[aria-current="page"]{background:#edf3ec;border-color:#dce6d9}.number{font-size:10px;color:#7a877f;font-variant-numeric:tabular-nums}.nav-link strong{font-size:12px;display:block;line-height:1.4}.nav-link small{display:block;margin-top:4px;text-transform:capitalize;font-size:10px;color:var(--muted)}.nav-arrow{margin-left:auto;font-size:14px;color:#8d9a92}.sidebar-note{margin-top:auto;padding:16px 10px 0;border-top:1px solid var(--line);font-size:11px;line-height:1.7;color:var(--muted)}.sidebar-note strong{color:#35453c}
main{min-width:0;padding:34px 36px 26px}.page-top{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:28px}.page-top h1{font-size:25px;font-weight:600;letter-spacing:-.7px;margin:0 0 8px}.page-top p{font-size:12px;color:var(--muted);margin:0;line-height:1.6}.count{background:#e8eee4;border:1px solid #dbe4d5;color:#49603d;border-radius:30px;white-space:nowrap;font-size:10px;letter-spacing:.4px;padding:8px 12px}.panel{background:white;border:1px solid var(--line);border-radius:14px;overflow:hidden;box-shadow:0 8px 28px #22382c05}.message-meta{padding:22px 24px 18px;border-bottom:1px solid var(--line)}.message-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}.message-top h2{font-size:16px;margin:0;letter-spacing:-.2px}.category{font-size:9px;text-transform:uppercase;letter-spacing:1px;border-radius:4px;padding:5px 7px;background:#f1f3ef;color:#526348}.reference{font-size:11px;color:var(--muted);margin:0 0 10px}.subject{font-size:12px;line-height:1.6;margin:0;color:#394b40}.subject span{color:#7b867f;margin-right:10px}.toolbar{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;padding:14px 24px;border-bottom:1px solid var(--line);background:#fcfcfa}.controls{display:flex;gap:10px;flex-wrap:wrap}.segmented{display:inline-flex;gap:2px;padding:3px;background:#eef1eb;border:1px solid #e3e7df;border-radius:8px}.segmented button{border:0;background:transparent;color:#64715f;padding:7px 11px;font-size:11px;border-radius:5px}.segmented button[aria-pressed="true"]{background:#fff;color:#1f3427;box-shadow:0 1px 4px #15291a12}.download{font-size:11px;font-weight:700;text-decoration:none;background:var(--accent);color:white;border:0;border-radius:7px;padding:10px 13px}.stage{background:#eaece7;padding:28px 20px;min-height:700px;display:flex;justify-content:center;align-items:flex-start;overflow:auto}.device{width:100%;max-width:820px;transition:max-width .2s ease;box-shadow:0 8px 25px #15291a10;background:white;border-radius:3px;overflow:hidden}.device.mobile{max-width:390px}.device-bar{display:flex;align-items:center;justify-content:space-between;padding:10px 13px;background:#fff;border-bottom:1px solid #eef0eb;font-size:9px;color:#839080;letter-spacing:.7px}.device-dots{display:flex;gap:4px}.device-dots i{width:5px;height:5px;border-radius:100%;background:#dce2d8}iframe{display:block;width:100%;height:980px;border:0;background:#fff}.caption{font-size:10px;color:#6d7b70;text-align:center;line-height:1.7;margin:14px 0 0}.footer{font-size:10px;line-height:1.7;color:#778275;margin-top:18px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}@media(prefers-reduced-motion:reduce){.device{transition:none}}@media(max-width:1050px){main{padding:25px 20px}.layout{grid-template-columns:245px minmax(0,1fr)}.sidebar{padding:25px 14px}.toolbar{padding:12px 16px}.stage{padding:18px 10px}.message-meta{padding:18px}}@media(max-width:760px){.layout{display:block}.sidebar{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line);padding:18px;gap:16px}.sidebar nav{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px}.eyebrow,.sidebar-note{display:none}.nav-link{flex-shrink:0;padding:9px 10px;margin:0;min-width:150px}.nav-arrow{display:none}.brand{margin-bottom:0}.page-top{gap:10px;margin-bottom:20px}.page-top h1{font-size:21px}.count{font-size:9px;padding:7px 9px}main{padding:22px 12px}.toolbar{gap:10px}.stage{padding:14px 7px}.message-meta{padding:18px 16px}.footer{padding:0 4px}}
</style>
</head>
<body>
<div class="layout">
  <aside class="sidebar">
    <div class="brand"><img class="monogram" src="${escapeHtml(logo)}" alt="Logic Intelligence Technologies logo" width="40" height="40" /><div><strong>Logic Intelligence Technologies</strong><small>Email design collection / 2026</small></div></div>
    <div><p class="eyebrow">Reference families</p><nav aria-label="Choose an email design">${links}</nav></div>
    <p class="sidebar-note"><strong>A collection for review.</strong><br />Fictional examples, ready to explore. No messages have been sent. Email-client compatibility is unverified.</p>
  </aside>
  <main>
    <header class="page-top"><div><h1>Every message, considered.</h1><p>${emails.length} email previews for the moments that matter.</p></div><span class="count">${emails.length} EMAIL DESIGNS</span></header>
    <section class="panel" aria-labelledby="email-name">
      <div class="message-meta" aria-live="polite"><div class="message-top"><h2 id="email-name"></h2><span class="category" id="email-category"></span></div><p class="reference" id="email-reference"></p><p class="subject"><span>Subject</span><strong id="email-subject"></strong></p></div>
      <div class="toolbar">
        <div class="controls">
          <div class="segmented" role="group" aria-label="Preview width"><button type="button" data-device="desktop" aria-pressed="true">Desktop</button><button type="button" data-device="mobile" aria-pressed="false">Mobile</button></div>
          <div class="segmented" role="group" aria-label="Message format"><button type="button" data-format="html" aria-pressed="true">HTML</button><button type="button" data-format="text" aria-pressed="false">Plain text</button></div>
        </div>
        <a class="download" id="download-html" download>Download HTML ↓</a>
      </div>
      <div class="stage"><div class="device" id="device"><div class="device-bar"><span class="device-dots" aria-hidden="true"><i></i><i></i><i></i></span><span id="device-label">DESKTOP / RESPONSIVE</span><span aria-hidden="true">↗</span></div><iframe id="email-preview" title="Email design preview" sandbox="allow-popups allow-popups-to-escape-sandbox" referrerpolicy="no-referrer"></iframe></div></div>
    </section>
    <p class="caption">Preview artwork is embedded for offline viewing. Downloaded HTML uses the official website’s absolute asset URLs.</p>
    <footer class="footer"><span>Logic Intelligence Technologies · Reference design study</span><span>Fictional data · Browser preview only · No live deployment</span></footer>
  </main>
</div>
<script type="application/json" id="email-data">${data}</script>
<script>
(function () {
  const emails = JSON.parse(document.getElementById('email-data').textContent);
  const frame = document.getElementById('email-preview');
  const device = document.getElementById('device');
  const download = document.getElementById('download-html');
  let format = 'html';
  let active = emails[0];
  let downloadUrl;
  function escape(value) {
    return value.replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
  }
  function draw() {
    const key = location.hash.slice(1);
    active = emails.find(function (email) { return email.key === key; }) || emails[0];
    document.getElementById('email-name').textContent = active.name;
    document.getElementById('email-subject').textContent = active.subject;
    document.getElementById('email-reference').textContent = 'Reference · ' + active.reference;
    document.getElementById('email-category').textContent = active.category;
    document.title = active.name + ' · LIT email reference designs';
    document.querySelectorAll('[data-key]').forEach(function (link) {
      if (link.dataset.key === active.key) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    frame.title = active.name + ' — ' + (format === 'html' ? 'HTML preview' : 'plain text');
    frame.srcdoc = format === 'html' ? active.preview : '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Plain text</title></head><body style="margin:0;padding:24px;color:#17201e;background:#fff"><pre style="white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.8 ui-monospace,monospace;margin:0">' + escape(active.text) + '</pre></body></html>';
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = URL.createObjectURL(new Blob([active.html], {type: 'text/html;charset=utf-8'}));
    download.href = downloadUrl;
    download.download = active.key + '.html';
  }
  document.querySelectorAll('[data-device]').forEach(function (button) {
    button.addEventListener('click', function () {
      const mobile = button.dataset.device === 'mobile';
      device.classList.toggle('mobile', mobile);
      document.getElementById('device-label').textContent = mobile ? 'MOBILE / 390 PX MAX' : 'DESKTOP / RESPONSIVE';
      document.querySelectorAll('[data-device]').forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
    });
  });
  document.querySelectorAll('[data-format]').forEach(function (button) {
    button.addEventListener('click', function () {
      format = button.dataset.format;
      document.querySelectorAll('[data-format]').forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
      draw();
    });
  });
  window.addEventListener('hashchange', draw);
  window.addEventListener('pagehide', function () { if (downloadUrl) URL.revokeObjectURL(downloadUrl); });
  draw();
}());
</script>
</body>
</html>`;
}

const AUTH_PREVIEWS = [
  { key: "auth-confirmation", filename: "confirmation.html", name: "Auth · Email confirmation", subject: "Confirm your email address" },
  { key: "auth-recovery", filename: "recovery.html", name: "Auth · Password recovery", subject: "Reset your password" },
  { key: "auth-invite", filename: "invite.html", name: "Auth · Account invitation", subject: "You have been invited" },
  { key: "auth-magic-link", filename: "magic_link.html", name: "Auth · Magic link", subject: "Your sign-in link" },
] as const;

async function renderedPreview(metadata: PreviewMetadata, html: string): Promise<RenderedPreview> {
  return { ...metadata, html, text: toPlainText(html), preview: await standalonePreview(html) };
}

async function allPreviews(): Promise<RenderedPreview[]> {
  // Load only for --all. Keep every registry entry, even aliases sharing a
  // template key or identical rendered HTML; the registry key identifies the file.
  const { EMAIL_TEMPLATE_REGISTRY } = await import("../src/lib/email/template-registry");
  const registry = await Promise.all(Object.entries(EMAIL_TEMPLATE_REGISTRY).map(
    async ([registryKey, definition]) => renderedPreview({
      key: registryKey,
      registryKey,
      templateKey: definition.key,
      name: definition.name,
      subject: definition.subject,
      reference: definition.description,
      category: definition.category,
      description: definition.description,
      defaultSender: definition.defaultSender,
      replyTo: definition.replyTo,
      source: "registry",
    }, await render(definition.getElement())),
  ));
  const auth = await Promise.all(AUTH_PREVIEWS.map(async ({ filename, ...metadata }) => {
    const reference = `supabase/templates/${filename}`;
    // Preserve Supabase placeholders in the exported HTML; no auth links are minted.
    const html = await readFile(path.join(ROOT, reference), "utf8");
    return renderedPreview({ ...metadata, reference, category: "security", source: "auth" }, html);
  }));
  return [...registry, ...auth];
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: npx tsx scripts/render-reference-emails.tsx [--all] [output-directory]");
    console.log("Default: ten reference designs. --all: every registry entry plus four auth HTML templates.");
    return;
  }
  const all = args.includes("--all");
  const directories = args.filter((arg) => arg !== "--all");
  if (directories.length > 1 || directories.some((arg) => arg.startsWith("-")) || args.filter((arg) => arg === "--all").length > 1) {
    throw new Error("Pass --all and/or one optional output directory. Use --help for usage.");
  }
  const output = path.resolve(directories[0] ?? (all ? path.join(ROOT, "artifacts", "email-all-designs") : DEFAULT_OUTPUT));
  // Complete rendering and asset validation before writing any output files.
  const emails: RenderedPreview[] = all ? await allPreviews() : await Promise.all(
    REFERENCE_EMAIL_PREVIEWS.map(async ({ element, ...metadata }) =>
      renderedPreview({ ...metadata, source: "reference" }, await render(element))),
  );
  if (!emails.length) throw new Error("No email previews found.");
  const keys = new Set<string>();
  for (const email of emails) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(email.key) || keys.has(email.key)) {
      throw new Error(`Invalid or duplicate preview key: ${email.key}`);
    }
    keys.add(email.key);
  }
  const logo = await inlineAsset(`${SITE}/assets/logo-icon.jpg`);
  const index = gallery(emails, logo);
  const manifest = {
    version: 1,
    mode: all ? "all" : "reference",
    generatedAt: new Date().toISOString(),
    count: emails.length,
    counts: {
      reference: emails.filter((email) => email.source === "reference").length,
      registry: emails.filter((email) => email.source === "registry").length,
      auth: emails.filter((email) => email.source === "auth").length,
    },
    gallery: { path: "index.html", bytes: Buffer.byteLength(index, "utf8") },
    emails: emails.map(({ html, preview, text, ...metadata }) => ({
      ...metadata,
      files: {
        html: `html/${metadata.key}.html`,
        preview: `previews/${metadata.key}.html`,
        text: `text/${metadata.key}.txt`,
      },
      bytes: {
        html: Buffer.byteLength(html, "utf8"),
        preview: Buffer.byteLength(preview, "utf8"),
        text: Buffer.byteLength(text, "utf8"),
      },
    })),
  };
  await Promise.all(["html", "previews", "text"].map((folder) => mkdir(path.join(output, folder), { recursive: true })));
  await Promise.all(emails.flatMap((email) => [
    writeFile(path.join(output, "html", `${email.key}.html`), email.html, "utf8"),
    writeFile(path.join(output, "previews", `${email.key}.html`), email.preview, "utf8"),
    writeFile(path.join(output, "text", `${email.key}.txt`), email.text, "utf8"),
  ]));
  await writeFile(path.join(output, "index.html"), index, "utf8");
  await writeFile(path.join(output, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  if (missingFonts.size) {
    console.warn(`Optional fonts unavailable; browser fallback fonts apply offline: ${[...missingFonts].join(", ")}`);
  }
  console.log(`Rendered ${emails.length} ${all ? "registry and auth" : "reference"} emails (original HTML, standalone previews and plain text).`);
  console.log(`Open ${path.join(output, "index.html")}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
