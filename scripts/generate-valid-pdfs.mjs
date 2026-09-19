import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resourcesDir = path.resolve(__dirname, '../public/resources');

if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
} else {
  // Remove existing PDFs
  const files = fs.readdirSync(resourcesDir);
  for (const file of files) {
    if (file.endsWith('.pdf')) {
      fs.unlinkSync(path.join(resourcesDir, file));
    }
  }
}

const proposalSections = [
  '1. Cover & Title Page',
  '2. Proposal No & Version Control',
  '3. Executive Summary',
  '4. Company Profile & Background',
  '5. Client Needs & Objectives',
  '6. Proposed Solution Overview',
  '7. Scope of Work (SOW)',
  '8. Technical Architecture',
  '9. AI Engine & Models Used',
  '10. Integration Capabilities',
  '11. User Interface & Experience',
  '12. Security Specification',
  '13. Data Privacy & Compliance',
  '14. Performance & Reliability',
  '15. Implementation Plan & Phases',
  '16. Delivery Timeline',
  '17. Testing & QA Protocol',
  '18. Deployment Strategy',
  '19. Training & Handoff',
  '20. Maintenance & Support SLA',
  '21. Service Level Agreements (SLA)',
  '22. Assumption & Dependencies',
  '23. Out of Scope Exclusions',
  '24. Commercial Terms & Conditions',
  '25. Pricing Breakdown',
  '26. Payment Schedule',
  '27. Intellectual Property Rights',
  '28. Liability & Warranties',
  '29. Confidentiality (NDA)',
  '30. Proposal Validity Period',
  '31. Next Steps & Acceptance',
  '32. Contact Information & Signatures'
];

const PDF_DOCS = [
  {
    filename: '01-LIT-AI-Website-Agents-Proposal-Commercial-Quotation.pdf',
    title: 'AI Website Agents Proposal & Quotation',
    subtitle: 'Logic Intelligence Technologies — Commercial Proposal',
    sections: proposalSections
  },
  {
    filename: '02-LIT-AI-Voice-Agents-Proposal-Commercial-Quotation.pdf',
    title: 'AI Voice Agents Proposal & Quotation',
    subtitle: 'Logic Intelligence Technologies — Commercial Proposal',
    sections: proposalSections
  },
  {
    filename: '03-LIT-VoiceShield-Enterprise-Product-Commercial-Proposal.pdf',
    title: 'VoiceShield Enterprise Commercial Proposal',
    subtitle: 'Logic Intelligence Technologies — Commercial Proposal',
    sections: proposalSections
  },
  {
    filename: '04-LIT-Pricing-Guide-AI-Products-Services.pdf',
    title: 'LIT Pricing Guide: AI Products & Services',
    subtitle: 'Official Pricing Source of Truth',
    sections: [
      '1. Executive Summary',
      '2. Website Agent Tiered Pricing (Free, Pro, Enterprise)',
      '3. Voice Agent Tiered Pricing (Pro, Enterprise)',
      '4. VoiceShield Enterprise Pricing',
      '5. Add-on Services & Integrations',
      '6. Terms & Conditions'
    ]
  },
  {
    filename: '05-LIT-Revenue-Growth-Strategy-INTERNAL.pdf',
    title: 'LIT Revenue Growth Strategy (INTERNAL)',
    subtitle: 'Confidential Internal Business Strategy',
    sections: [
      '1. Revenue Targets & Goals',
      '2. Target Market: 50-100 Clients',
      '3. MRR & ARR Projections (50,00,000+ ARR target)',
      '4. Unit Economics (LTV, CAC, Margins)',
      '5. Sales & Go-to-Market Strategy',
      '6. Risk Assessment & Mitigation'
    ]
  }
];

function escapePdfText(str) {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function createPdfBuffer(doc) {
  const streamLines = [];
  streamLines.push('BT');
  streamLines.push('/F1 22 Tf');
  streamLines.push('50 740 Td');
  streamLines.push(`(${escapePdfText(doc.title)}) Tj`);
  streamLines.push('/F1 12 Tf');
  streamLines.push('0 -24 Td');
  streamLines.push(`(${escapePdfText(doc.subtitle)}) Tj`);
  streamLines.push('/F1 10 Tf');
  streamLines.push('0 -30 Td');
  streamLines.push('(Logic Intelligence Technologies — Official Corporate Publication) Tj');
  streamLines.push('0 -20 Td');
  streamLines.push('(----------------------------------------------------------------------------------------------------) Tj');

  let currentYOffset = 0;
  for (const sec of doc.sections) {
    const isHeading = /^[0-9]+\./.test(sec) || /^Phase/.test(sec);
    streamLines.push('0 -18 Td'); // Reduced line spacing to fit more sections
    if (isHeading) {
      streamLines.push('/F1 10 Tf');
      streamLines.push(`(${escapePdfText(sec)}) Tj`);
    } else {
      const words = sec.split(' ');
      let currentLine = '';
      for (const w of words) {
        if ((currentLine + ' ' + w).length > 85) {
          streamLines.push(`(${escapePdfText(currentLine.trim())}) Tj`);
          streamLines.push('0 -12 Td');
          currentLine = w;
        } else {
          currentLine += (currentLine ? ' ' : '') + w;
        }
      }
      if (currentLine) {
        streamLines.push(`(${escapePdfText(currentLine.trim())}) Tj`);
      }
    }
  }

  streamLines.push('0 -35 Td');
  streamLines.push('/F1 9 Tf');
  streamLines.push('(Confidential & Proprietary — Logic Intelligence Technologies | https://www.logicintelligencetechnologies.in) Tj');
  streamLines.push('ET');

  const streamContent = streamLines.join('\n');
  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  const objects = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj');
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
  objects.push(`5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`);

  let body = '%PDF-1.4\n';
  const offsets = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(body, 'utf-8'));
    body += objects[i] + '\n';
  }

  const startXref = Buffer.byteLength(body, 'utf-8');
  body += 'xref\n';
  body += `0 ${objects.length + 1}\n`;
  body += '0000000000 65535 f \n';
  for (const off of offsets) {
    body += String(off).padStart(10, '0') + ' 00000 n \n';
  }
  body += 'trailer\n';
  body += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  body += 'startxref\n';
  body += `${startXref}\n`;
  body += '%%EOF\n';

  return Buffer.from(body, 'utf-8');
}

let generatedCount = 0;
for (const doc of PDF_DOCS) {
  const filePath = path.join(resourcesDir, doc.filename);
  const pdfBuffer = createPdfBuffer(doc);
  fs.writeFileSync(filePath, pdfBuffer);
  console.log(`Generated valid PDF: ${doc.filename} (${pdfBuffer.length} bytes)`);
  generatedCount++;
}
console.log(`Successfully generated ${generatedCount} PDF files.`);
