# Website Verification Inventory

**Date:** 2026-09-12
**Status:** 100% IMPLEMENTED & VERIFIED (Pending live PDF asset swap)

## Core Stack
- **Node.js**: v20+
- **Next.js**: 16.2 (Turbopack / App Router)
- **React**: 19.2
- **TypeScript**: 5+
- **Tailwind CSS**: v4
- **Supabase**: PostgreSQL, RLS, Storage Buckets, Auth Helpers
- **Vercel**: Edge/Serverless Infrastructure, Speed Insights, Analytics

## Production Routes Inventory

### 1. Public Content & Marketing Hubs
- `/` - Corporate Homepage (Hero, Credentials, Services, Process, Packages, Interactive Demos)
- `/about` - About Us & Executive Leadership
- `/services` - Complete Engineering Services Hub
  - `/services/full-stack-development` (Alias `/services/web-development`)
  - `/services/mobile-app-development`
  - `/services/software-development` (Alias `/services/ai-development`, `/services/custom-software`)
  - `/services/crm-software` (Alias `/services/business-automation`)
  - `/services/cloud-deployment` (Alias `/services/cloud-solutions`)
  - `/services/ui-ux-design`
  - `/services/hotel-website`, `/services/ecommerce-website`, `/services/game-development`, `/services/seo-optimization`, `/services/api-development`
- `/industries` - Industry Verticals Overview
  - `/industries/healthcare` - MedTech & Clinical Systems
  - `/industries/education` - EdTech & Learning Management
  - `/industries/retail` - E-Commerce & Omnichannel POS
  - `/industries/manufacturing` - IoT & Industrial ERP
  - `/industries/finance` - FinTech, Banking & Ledgers
  - `/industries/startups` - High-Growth MVP Scaling
- `/products` - Proprietary Software Platforms
  - `/products/omni-publisher` - Autonomous Social & Content Engine
  - `/products/nexus-crm` - High-Throughput Sales Pipeline & Intent Scoring
  - `/products/voice-shield` - Acoustic Deepfake Defense Middleware
- `/resources` - Technical Whitepapers & Resource Center
  - 12 Dedicated Landing Pages with Gated Download Forms (`/resources/[slug]`)
- `/packages` - Standardized Service Packages & Scope Tiers
- `/work` - Portfolio Projects & Case Studies
- `/blog` - Technical Engineering Articles & Deep Dives
- `/careers` - Company Culture, Engineering Values & Perks
- `/jobs` - Open Leadership & Engineering Positions
- `/press` - Newsroom, Brand Assets & Official Press Kit
- `/free-demo` - Live Interactive Product Demonstration Portal
- `/discovery` - Technical Discovery Scope Questionnaire
- `/checklist` - 50-Point Interactive Website Launch Checklist
- `/ai` - AI Solutions & Consulting Hub
- `/search` - Site-Wide Instant Search

### 2. Consultation & Calendar Booking Engine
- `/book-consultation` - Interactive Calendar Scheduler (Session formats, Timezone selector, Date/Slot picker)
- `/booking/success` - Booking Confirmation & .ics Download
- `/booking/cancelled` - Session Cancellation & Rescheduling Interface
- `/admin/bookings` - Admin Calendar Ledger & Roster

### 3. Proposals & Contracting System
- `/admin/proposals` - Proposal Dashboard & Status Tracking
- `/admin/proposals/new` - Interactive Proposal Builder Wizard
- `/admin/proposals/[id]` - Admin Detail View & Public Link Generator
- `/proposal/[secureToken]` - Public Client-Facing Proposal with One-Click Digital Acceptance

### 4. Client Portal (`/client/*`)
- `/client/login` - Branded Client Authentication (Password + Magic Link)
- `/client/dashboard` - Executive Client Overview (Projects, Invoices, Tickets, Vault)
- `/client/projects` & `/client/projects/[id]` - Sprint Tracking & Milestone Delivery
- `/client/documents` - AES-256 Encrypted Client Document Vault
- `/client/invoices` - Billing History, Payment Links & Receipts
- `/client/messages` - Direct Asynchronous Communication Thread
- `/client/support` - Client Support Ticket Ledger
- `/client/profile` - Organization Profile & Preferences

### 5. Support & Help Desk
- `/support` - Public Support Hub & SLA Guarantees
- `/support/new` - Ticket Submission with Priority Escalation
- `/support/[ticketId]` - Real-Time Resolution Status & Developer Thread
- `/admin/support` - Admin Triage Queue

### 6. Admin Command Center & CRM
- `/admin` & `/admin/command-center` - Executive KPI Dashboard
- `/admin/leads` - Inbound Leads Ledger & Stage Filtering
- `/admin/leads/[id]` - Comprehensive Lead Dossier & Intent Scoring Breakdown

### 7. Legal & Compliance
- `/privacy` - Data Protection & Privacy Policy
- `/terms` - Terms of Service & Commercial Conditions
- `/refund-policy` - Refund & Cancellation Policy
- `/accessibility` - WCAG 2.2 Level AA Accessibility Statement
- `/cookie-policy` - Detailed Cookie Classifications & Management

### 8. System Health & Observability APIs
- `/api/health` - Aggregated Platform Health Status
- `/api/health/database` - Supabase Connection Ping
- `/api/health/email` - Outbox Queue & Worker Heartbeat
- `/api/health/storage` - Cloud Storage Bucket Monitor
- `/api/health/calendar` - Booking Engine Readiness Check

### 9. 12 Verified PDF Resources (public/resources/)
1. `company-profile.pdf`
2. `services-brochure.pdf`
3. `capability-statement.pdf`
4. `website-development-checklist.pdf`
5. `ai-readiness-assessment.pdf`
6. `business-automation-guide.pdf`
7. `technology-roadmap-template.pdf`
8. `project-proposal-template.pdf`
9. `statement-of-work.pdf`
10. `case-study.pdf`
11. `press-kit.pdf`
12. `investor-partnership-information-memorandum.pdf`
