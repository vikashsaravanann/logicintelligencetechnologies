# StartupWithVikash to Logic Intelligence Technologies Migration Matrix

## Overview
This document records the exact mapping of assets and information extracted from the `startupwithvikash` personal portfolio repository and integrated into the **Logic Intelligence Technologies** corporate presentation.

### 1. Biography and Company Capabilities Integration
**Source**: `index.html#summary`
**Destination**: `src/config/founder.ts`
**Integration Notes**:
- The personal summary detailing the objective to "leverage raw data to engineer scalable, real-world solutions" was mapped to `companyCapabilities.dataAndSystemsEngineering`.
- First-person language was converted to third-person corporate capability language representing the engineering foundation of the company.

### 2. Technical Competencies Integration
**Source**: `index.html#competencies`
**Destination**: `src/config/founder.ts` & `src/app/(marketing)/expertise/page.tsx`
**Integration Notes**:
- Reorganized the three main pillars (Prompt Eng & Web Dev, Full-Stack, Network & AI) into 6 detailed engineering domains:
  1. Automation & AI Systems
  2. Backend & API Engineering
  3. Frontend Engineering
  4. Core Programming
  5. Cloud & Infrastructure
  6. Network & Systems
- Progress bars were removed in favor of a mature capability-driven layout showcasing specific engineering logic.

### 3. Professional Certifications Integration
**Source**: `certifications.html` & `assets/certs/`
**Destination**: `src/config/founder.ts` & `src/app/(marketing)/certifications/page.tsx`
**Integration Notes**:
- Extracted all 15 credentials.
- Converted the `.png` badge images to optimized `.webp` format using `sharp`.
- Saved the converted images to `public/images/certifications/` with semantic names (e.g., `data-analysis-microsoft.webp`).
- Built a premium dark-themed certification grid utilizing `SafeImage` from the company design system.

### Migration Status
- [x] Content Extracted
- [x] Images Optimized and Transferred
- [x] Central Configuration Updated (`src/config/founder.ts`)
- [x] `/expertise` Route Live
- [x] `/certifications` Route Live
- [x] Navigation Configuration Updated

**QA Verification Complete.**
