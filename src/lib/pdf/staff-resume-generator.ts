import { PDFDocument, rgb, PDFFont, PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import type { ResumeDto } from "@/lib/staff/resume-data";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_L = 14.7;
const MARGIN_R = 15;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

const NAVY = rgb(10 / 255, 36 / 255, 114 / 255);
const TEXT = rgb(26 / 255, 26 / 255, 26 / 255);
const BLACK = rgb(0, 0, 0);

const SIZE = {
  name: 16.71,
  headline: 9.8,
  section: 9.8,
  body: 8.07,
  job: 8.64,
  meta: 8.07,
};

function resolveFont(name: string): string | null {
  const candidates = [
    path.join(/*turbopackIgnore: true*/ process.cwd(), "src/lib/pdf/fonts", name),
    path.join(/*turbopackIgnore: true*/ process.cwd(), "public/fonts", name),
    path.join(__dirname, "fonts", name),
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ c)) return c;
    } catch {
      /* ignore */
    }
  }
  return null;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const trial = current ? `${current} ${w}` : w;
    if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
      current = trial;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

type DrawCtx = {
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
  boldOblique: PDFFont;
  doc: PDFDocument;
};

function ensureSpace(ctx: DrawCtx, need: number) {
  if (ctx.y - need < 28) {
    ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
    ctx.y = PAGE_H - 20;
  }
}

function drawCentered(ctx: DrawCtx, text: string, font: PDFFont, size: number, color: ReturnType<typeof rgb>) {
  const width = font.widthOfTextAtSize(text, size);
  ctx.page.drawText(text, {
    x: (PAGE_W - width) / 2,
    y: ctx.y,
    size,
    font,
    color,
  });
}

function sectionHeading(ctx: DrawCtx, title: string) {
  ensureSpace(ctx, 28);
  ctx.y -= 10;
  ctx.page.drawText(title, {
    x: MARGIN_L,
    y: ctx.y,
    size: SIZE.section,
    font: ctx.bold,
    color: NAVY,
  });
  ctx.y -= 4;
  ctx.page.drawLine({
    start: { x: MARGIN_L, y: ctx.y },
    end: { x: PAGE_W - MARGIN_R, y: ctx.y },
    thickness: 0.58,
    color: NAVY,
  });
  ctx.y -= 12;
}

function paragraph(ctx: DrawCtx, text: string, size = SIZE.body) {
  const lines = wrapText(text, ctx.regular, size, CONTENT_W);
  for (const line of lines) {
    ensureSpace(ctx, size + 2);
    ctx.page.drawText(line, {
      x: MARGIN_L,
      y: ctx.y,
      size,
      font: ctx.regular,
      color: TEXT,
    });
    ctx.y -= size + 1.7;
  }
}

function bullet(ctx: DrawCtx, text: string) {
  const indent = 10;
  const maxW = CONTENT_W - indent;
  const lines = wrapText(text, ctx.regular, SIZE.body, maxW);
  for (let i = 0; i < lines.length; i++) {
    ensureSpace(ctx, SIZE.body + 2);
    if (i === 0) {
      ctx.page.drawText("•", {
        x: MARGIN_L + 2,
        y: ctx.y,
        size: SIZE.body,
        font: ctx.regular,
        color: TEXT,
      });
    }
    ctx.page.drawText(lines[i], {
      x: MARGIN_L + indent,
      y: ctx.y,
      size: SIZE.body,
      font: ctx.regular,
      color: TEXT,
    });
    ctx.y -= SIZE.body + 2.2;
  }
}

export async function generateStaffResumePdf(data: ResumeDto): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const regPath = resolveFont("DejaVuSans.ttf");
  const boldPath = resolveFont("DejaVuSans-Bold.ttf");
  const boldObliquePath = resolveFont("DejaVuSans-BoldOblique.ttf");

  if (!regPath || !boldPath || !boldObliquePath) {
    throw new Error("DejaVu Sans fonts missing for resume generation");
  }

  const regular = await doc.embedFont(fs.readFileSync(/*turbopackIgnore: true*/ regPath));
  const bold = await doc.embedFont(fs.readFileSync(/*turbopackIgnore: true*/ boldPath));
  const boldOblique = await doc.embedFont(fs.readFileSync(/*turbopackIgnore: true*/ boldObliquePath));

  const page = doc.addPage([PAGE_W, PAGE_H]);
  const ctx: DrawCtx = {
    page,
    y: PAGE_H - 18,
    regular,
    bold,
    boldOblique,
    doc,
  };

  // Header — name
  const name = data.fullName.toUpperCase();
  drawCentered(ctx, name, bold, SIZE.name, NAVY);
  ctx.y -= SIZE.name + 4;

  // Headline
  if (data.headline) {
    drawCentered(ctx, data.headline, bold, SIZE.headline, BLACK);
    ctx.y -= SIZE.headline + 3;
  }

  // Contact
  if (data.contactLine) {
    drawCentered(ctx, data.contactLine, regular, SIZE.body, BLACK);
    ctx.y -= SIZE.body + 2.5;
  }

  // Links
  if (data.linksLine) {
    drawCentered(ctx, data.linksLine, regular, SIZE.body, BLACK);
    ctx.y -= SIZE.body + 6;
  }

  // Summary
  if (data.summary) {
    sectionHeading(ctx, "PROFESSIONAL SUMMARY");
    paragraph(ctx, data.summary);
  }

  // Skills
  if (data.skillGroups.length) {
    sectionHeading(ctx, "TECHNICAL SKILLS");
    for (const g of data.skillGroups) {
      const label = `${g.category}: `;
      const skills = g.skills.join(", ");
      const labelW = bold.widthOfTextAtSize(label, SIZE.body);
      const skillLines = wrapText(skills, regular, SIZE.body, CONTENT_W - labelW);
      ensureSpace(ctx, SIZE.body + 2);
      ctx.page.drawText(label, {
        x: MARGIN_L,
        y: ctx.y,
        size: SIZE.body,
        font: bold,
        color: TEXT,
      });
      if (skillLines[0]) {
        ctx.page.drawText(skillLines[0], {
          x: MARGIN_L + labelW,
          y: ctx.y,
          size: SIZE.body,
          font: regular,
          color: TEXT,
        });
      }
      ctx.y -= SIZE.body + 1.8;
      for (let i = 1; i < skillLines.length; i++) {
        ensureSpace(ctx, SIZE.body + 2);
        ctx.page.drawText(skillLines[i], {
          x: MARGIN_L,
          y: ctx.y,
          size: SIZE.body,
          font: regular,
          color: TEXT,
        });
        ctx.y -= SIZE.body + 1.8;
      }
    }
  }

  // Experience
  if (data.experience.length) {
    sectionHeading(ctx, "EXPERIENCE");
    for (const exp of data.experience) {
      const left = [exp.title, exp.organization].filter(Boolean).join(" | ");
      const rightParts = [
        [exp.startLabel, exp.endLabel].filter(Boolean).join(" – "),
        exp.location,
      ].filter(Boolean);
      const right = rightParts.join(" | ");

      ensureSpace(ctx, 20);
      const leftLines = wrapText(left, bold, SIZE.job, CONTENT_W * 0.62);
      const rightW = right ? boldOblique.widthOfTextAtSize(right, SIZE.meta) : 0;

      ctx.page.drawText(leftLines[0], {
        x: MARGIN_L,
        y: ctx.y,
        size: SIZE.job,
        font: bold,
        color: TEXT,
      });
      if (right) {
        ctx.page.drawText(right, {
          x: PAGE_W - MARGIN_R - rightW,
          y: ctx.y,
          size: SIZE.meta,
          font: boldOblique,
          color: BLACK,
        });
      }
      ctx.y -= SIZE.job + 2;
      for (let i = 1; i < leftLines.length; i++) {
        ctx.page.drawText(leftLines[i], {
          x: MARGIN_L,
          y: ctx.y,
          size: SIZE.job,
          font: bold,
          color: TEXT,
        });
        ctx.y -= SIZE.job + 1.5;
      }
      for (const b of exp.bullets) bullet(ctx, b);
      ctx.y -= 3;
    }
  }

  // Projects
  if (data.projects.length) {
    sectionHeading(ctx, "PROJECTS");
    for (const p of data.projects) {
      ensureSpace(ctx, 18);
      const titlePart = p.title;
      const tech = p.techLine ? ` | ${p.techLine}` : "";
      // Draw title bold + tech bold oblique on same flow
      const titleW = bold.widthOfTextAtSize(titlePart, SIZE.body);
      ctx.page.drawText(titlePart, {
        x: MARGIN_L,
        y: ctx.y,
        size: SIZE.body,
        font: bold,
        color: TEXT,
      });
      if (tech) {
        const techLines = wrapText(tech, boldOblique, SIZE.body, CONTENT_W - titleW);
        ctx.page.drawText(techLines[0], {
          x: MARGIN_L + titleW,
          y: ctx.y,
          size: SIZE.body,
          font: boldOblique,
          color: TEXT,
        });
        ctx.y -= SIZE.body + 2;
        for (let i = 1; i < techLines.length; i++) {
          ctx.page.drawText(techLines[i], {
            x: MARGIN_L,
            y: ctx.y,
            size: SIZE.body,
            font: boldOblique,
            color: TEXT,
          });
          ctx.y -= SIZE.body + 1.8;
        }
      } else {
        ctx.y -= SIZE.body + 2;
      }
      for (const b of p.bullets) bullet(ctx, b);
      ctx.y -= 2;
    }
  }

  // Education
  if (data.education.length) {
    sectionHeading(ctx, "EDUCATION");
    for (const ed of data.education) {
      ensureSpace(ctx, 18);
      const yearsW = ed.years ? boldOblique.widthOfTextAtSize(ed.years, SIZE.meta) : 0;
      ctx.page.drawText(ed.degree, {
        x: MARGIN_L,
        y: ctx.y,
        size: SIZE.body,
        font: bold,
        color: TEXT,
      });
      if (ed.years) {
        ctx.page.drawText(ed.years, {
          x: PAGE_W - MARGIN_R - yearsW,
          y: ctx.y,
          size: SIZE.meta,
          font: boldOblique,
          color: BLACK,
        });
      }
      ctx.y -= SIZE.body + 2;
      if (ed.detail) paragraph(ctx, ed.detail);
      ctx.y -= 2;
    }
  }

  // Certifications
  if (data.certifications.length) {
    sectionHeading(ctx, "CERTIFICATIONS");
    paragraph(ctx, data.certifications.join(" | "));
  }

  // Achievements
  if (data.achievements.length) {
    sectionHeading(ctx, "ACHIEVEMENTS & HIGHLIGHTS");
    for (const a of data.achievements) bullet(ctx, a);
  }

  return doc.save();
}

export function resumeFilename(fullName: string): string {
  const safe = fullName
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 60);
  return `${safe || "Staff"}_Resume.pdf`;
}
