# -*- coding: utf-8 -*-
"""LIT Client Onboarding Engine — 7 master PDF templates."""
import os, re, json, argparse
from docsys import *

HERE = os.path.dirname(os.path.abspath(__file__))
OWNER = "Vikash Saravanan, Founder & Lead Engineer"


def cover_meta(ref, status="[Draft / Issued / Signed]", version="[Version]", cls="Client-Confidential"):
    return [("Project", "[Project Name]"), ("Client", "[Client Company]"),
            ("Reference", ref), ("Issued", "[Date]"),
            ("Version", version), ("Classification", cls),
            ("Document Owner", "Vikash Saravanan"), ("Status", status)]


def ctrl_meta(ref, status="[Draft / Issued / Signed]"):
    return [("Document Reference", ref), ("Client", "[Client Company]"),
            ("Project", "[Project Name]"), ("Version", "[Version]"),
            ("Issue Date", "[Date]"), ("Classification", "Client-Confidential"),
            ("Document Owner", OWNER), ("Status", status)]


TEMPLATE_NOTE = ("Blank fields and underlined spaces are filled in per client (manually or by the LIT Command Center). "
                 "Legal and commercial clauses are a starting framework and should be reviewed by qualified "
                 "counsel for the jurisdictions and transaction involved before you rely on them.")


# ════════════════════════════════════════════════════════════════════════════
# 01  STATEMENT OF WORK + SERVICE AGREEMENT
# ════════════════════════════════════════════════════════════════════════════
SOW_SECTIONS = ["Document Information", "Parties / Client Information", "Project Overview", "Business Objectives",
                "Scope of Work", "Deliverables", "Technical Architecture", "Delivery Schedule & Milestones",
                "Client Responsibilities", "LIT Responsibilities", "Dependencies & Assumptions",
                "Acceptance Criteria", "Commercial Terms", "Payment Schedule", "Change Control",
                "Intellectual Property", "Confidentiality", "Data Handling & Security", "Third-Party Services",
                "Support / Warranty", "Limitations / Exclusions", "Termination / Project Closure",
                "Authorization & Signatures"]


def sow(d):
    ref = "LIT-SOW-[YEAR]-[PROJECT-ID]"
    d.cover("LIT / 01 · Master Template", ["Statement of Work", "& Service Agreement"],
            "The commercial and delivery foundation of every LIT engagement.", cover_meta("LIT-SOW-[YEAR]-[PROJECT-ID]"))
    d.control_page(ctrl_meta(ref), list(enumerate(SOW_SECTIONS, 1)), note=TEMPLATE_NOTE)

    d.new_page()
    d.h1(1, "Document Information")
    d.p("This Statement of Work (“SOW”) and Service Agreement sets out the scope, deliverables, schedule, "
        "commercial terms and governing conditions under which Logic Intelligence Technologies (“LIT”) will "
        "deliver the project described below for the Client. It should be read together with the related documents listed here.")
    d.table(["Related document", "Reference", "Role in this engagement"], [
        ["Project Proposal", "LIT-PROPOSAL-[CLIENT]-[PROJECT]-[V]", "Commercial basis accepted by the Client"],
        ["Client Onboarding Guide", "LIT-Client-Onboarding-Guide", "Access and information handover after signing"],
        ["Technical Specification", "LIT-TECHSPEC-[PROJECT-ID]-[V]", "Detailed technical design, issued after onboarding"],
        ["Change Requests", "LIT-CR-[PROJECT-ID]-[CR-NO]", "Any approved change to this SOW"],
    ], [0.27, 0.36, 0.37])

    d.h1(2, "Parties / Client Information")
    d.table(["", "Service Provider", "Client"], [
        ["Legal name", LEGAL_NAME, "[Client Company Legal Name]"],
        ["Registered address", "Coimbatore, Tamil Nadu, India", "[Registered Address]"],
        ["Represented by", "Vikash Saravanan, Founder & Lead Engineer", "[Authorized Signatory, Title]"],
        ["Email", EMAIL, "[Client Email]"],
        ["Phone", PHONE, "[Client Phone]"],
        ["Tax / GST ID", "[LIT GSTIN]", "[Client GSTIN, if applicable]"],
        ["Project contact", "Vikash Saravanan", "[Single Point of Contact]"],
    ], [0.22, 0.39, 0.39])

    d.h1(3, "Project Overview")
    d.p("[Project Summary]", col=AZURE)
    d.kv([["Project name", "[Project Name]"], ["Project ID", "[PROJECT-ID]"],
          ["Engagement type", "[Fixed scope / Milestone-based / Time & materials]"],
          ["Planned start", "[Date]"], ["Target completion", "[Date]"],
          ["Primary platform", "[Web application / Mobile web / Automation / AI workflow]"]])

    d.h1(4, "Business Objectives")
    d.p("The project is successful when the following measurable objectives are met. Each objective maps to one or more "
        "deliverables in Section 6 and acceptance criteria in Section 12.")
    d.table(["ID", "Objective", "Success measure"], [
        ["OBJ-01", "[Objective — e.g. launch a customer self-service portal]", "[Measurable indicator]"],
        ["OBJ-02", "[Objective]", "[Measurable indicator]"],
        ["OBJ-03", "[Objective]", "[Measurable indicator]"],
    ], [0.13, 0.52, 0.35])

    d.h1(5, "Scope of Work")
    d.p("LIT will perform the following work. Anything not expressly listed here is out of scope and may be added only "
        "through the Change Control process in Section 15.")
    d.table(["Workstream", "Included activities"], [
        ["Discovery & architecture", "Requirements confirmation, technical specification, architecture and data model design"],
        ["Frontend", "[Pages / screens / user flows to be built, responsive layouts, accessibility baseline]"],
        ["Backend & APIs", "[Business logic, API endpoints, background jobs, automations]"],
        ["Database", "[Schema, migrations, row-level security policies, seed data]"],
        ["Integrations", "[Payment, email, SMS, AI / LLM services, third-party APIs]"],
        ["Deployment", "Production and staging environments, CI/CD pipeline, domain and TLS configuration"],
        ["Handover", "Documentation, credential and ownership transfer, walkthrough session"],
    ], [0.27, 0.73])

    d.h1(6, "Deliverables")
    d.table(["ID", "Deliverable", "Description", "Acceptance"], [
        ["D-01", "Technical Specification", "Approved design document for the solution", "AC-01"],
        ["D-02", "[Frontend application]", "[Description]", "AC-02"],
        ["D-03", "[Backend services / APIs]", "[Description]", "AC-03"],
        ["D-04", "[Database & security policies]", "[Description]", "AC-04"],
        ["D-05", "Production deployment", "Live system on the agreed domain", "AC-05"],
        ["D-06", "Handover documentation", "Operating notes, architecture summary, access register", "AC-06"],
    ], [0.1, 0.27, 0.48, 0.15])

    d.h1(7, "Technical Architecture", keep=380)
    d.p("The indicative architecture below is confirmed or refined in the Technical Specification. The final diagram is "
        "generated from the project’s actual architecture.")
    d.arch(caption="Indicative only. Components are confirmed per project in the Technical Specification.")

    d.h1(8, "Delivery Schedule & Milestones")
    d.table(["Milestone", "Description", "Target date", "Payment linked"], [
        ["M1", "Kick-off and onboarding complete — access and information received", "[Date]", "[Yes / No]"],
        ["M2", "Technical Specification and design approved", "[Date]", "[Yes / No]"],
        ["M3", "Core build complete on staging", "[Date]", "[Yes / No]"],
        ["M4", "User acceptance testing complete", "[Date]", "[Yes / No]"],
        ["M5", "Production launch and handover", "[Date]", "[Yes / No]"],
    ], [0.13, 0.5, 0.17, 0.2])
    d.p("Dates assume the Client meets the responsibilities in Section 9. Delays in Client inputs move dependent "
        "milestones by an equivalent period.", sz=8.4, col=SLATE)

    d.h1(9, "Client Responsibilities")
    d.bullets([
        "Nominate a single point of contact with authority to make decisions and approve deliverables.",
        "Provide business information, content, brand assets and existing system details listed in the Onboarding Guide.",
        "Grant delegated, least-privilege access to required accounts (GitHub, domain/DNS, cloud, Supabase, Vercel) — never by sharing passwords.",
        "Review and respond to deliverables within [X] business days of submission.",
        "Own, and pay for, third-party accounts and subscriptions unless stated otherwise in Section 19.",
        "Carry out user acceptance testing and confirm acceptance in writing.",
    ])

    d.h1(10, "LIT Responsibilities")
    d.bullets([
        "Deliver the scope in Section 5 to professional engineering standards.",
        "Provide [weekly] written progress updates and flag risks or delays as soon as they are known.",
        "Maintain source code in a version-controlled repository the Client owns or will receive at handover.",
        "Follow the security practices in Section 18 and the Client’s reasonable written policies.",
        "Provide documentation and a handover walkthrough on completion.",
    ])

    d.h1(11, "Dependencies & Assumptions")
    d.bullets([
        "[Assumption — e.g. Client content is supplied in final form before M3.]",
        "[Dependency — e.g. third-party API access approved by the provider.]",
        "Third-party services remain available on materially the same terms during the project.",
        "Scope, schedule and fees are based on the information available at signing.",
    ])

    d.h1(12, "Acceptance Criteria", keep=180)
    d.p("Each deliverable is accepted through the following process:")
    d.steps([("Submit", "LIT notifies the Client that a deliverable is ready for review."),
             ("Review", "Client reviews within [X] business days against Section 6."),
             ("Respond", "Client accepts, or lists defects in writing against the agreed criteria."),
             ("Resolve", "LIT corrects listed defects and resubmits."),
             ("Accept", "Deliverable is accepted in writing, or deemed accepted if no response in [X] days.")])
    d.p("Defects are deviations from the agreed scope or specification. New requirements raised during review are handled "
        "through Change Control.", sz=8.6, col=SLATE)

    d.h1(13, "Commercial Terms")
    d.table(["Item", "Description", "Amount"], [
        ["Core implementation", "[Description]", "[₹ / $]"],
        ["Integration", "[Description]", "[₹ / $]"],
        ["Deployment", "[Description]", "[Included / ₹ / $]"],
        ["Support", "[Description]", "[₹ / $]"],
        ["Total (excluding taxes)", "", "[₹ / $]"],
    ], [0.3, 0.48, 0.22], total_row=True, align=["left", "left", "right"])
    d.p("Fees are exclusive of applicable taxes ([GST as applicable]). Third-party costs are billed as set out in Section 19. "
        "Pricing is populated per engagement by the LIT Command Center.", sz=8.4, col=SLATE)

    d.h1(14, "Payment Schedule")
    d.table(["Instalment", "Trigger", "Share", "Amount", "Due"], [
        ["1", "SOW signature", "[__%]", "[₹ / $]", "[On signing]"],
        ["2", "[Milestone M2 / M3]", "[__%]", "[₹ / $]", "[Within X days]"],
        ["3", "Production launch & handover (M5)", "[__%]", "[₹ / $]", "[Within X days]"],
    ], [0.14, 0.36, 0.12, 0.18, 0.2])
    d.p("Invoices are payable to the account details stated on the invoice. Late payment may pause work on subsequent "
        "milestones until the account is brought current.", sz=8.4, col=SLATE)

    d.h1(15, "Change Control")
    d.p("Either party may propose a change to scope, schedule or fees. Changes are documented in a Change Request "
        "(LIT-CR-[PROJECT-ID]-[CR-NO]) stating the technical, schedule and commercial impact. No change is binding until "
        "both parties approve the Change Request in writing; until then, work continues against this SOW.")

    d.h1(16, "Intellectual Property")
    d.clauses([
        ("16.1", "On receipt of full payment, the Client owns the custom deliverables created specifically for this project, including source code and design files."),
        ("16.2", "LIT retains ownership of its pre-existing materials, internal tools, frameworks and know-how. Where these are incorporated into the deliverables, LIT grants the Client a non-exclusive, perpetual licence to use them as part of the deliverables."),
        ("16.3", "Open-source components remain subject to their own licences, which LIT will identify in the handover documentation."),
        ("16.4", "[Portfolio reference: LIT may reference the project in its portfolio only with the Client’s prior written consent.]"),
    ])

    d.h1(17, "Confidentiality")
    d.clauses([
        ("17.1", "Each party will keep the other’s confidential information secret and use it only to perform this agreement."),
        ("17.2", "Confidential information excludes information that is public, already known to the recipient, independently developed, or lawfully received from a third party."),
        ("17.3", "These obligations survive termination for [__] years."),
    ])

    d.h1(18, "Data Handling & Security")
    d.clauses([
        ("18.1", "LIT accesses Client systems using delegated, least-privilege accounts. Passwords, API keys, private keys and tokens are never exchanged by email or the standard onboarding form."),
        ("18.2", "Secrets are stored only in environment variables or secret managers of the relevant platform, never in source code."),
        ("18.3", "Client data is processed solely to deliver this project and in line with applicable data protection laws, including the Digital Personal Data Protection Act, 2023 where applicable."),
        ("18.4", "On project closure, LIT returns or deletes Client data in its possession and the Client revokes LIT’s access unless a support agreement is in force."),
    ])

    d.h1(19, "Third-Party Services")
    d.table(["Service", "Purpose", "Account owner", "Cost borne by"], [
        ["Vercel", "Frontend hosting & deployments", "[Client]", "[Client]"],
        ["Supabase", "Database, auth and storage", "[Client]", "[Client]"],
        ["Domain registrar / DNS", "Domain and DNS records", "[Client]", "[Client]"],
        ["[Email / SMS provider]", "[Transactional messaging]", "[Client]", "[Client]"],
        ["[AI / LLM API]", "[Model inference]", "[Client]", "[Client]"],
    ], [0.27, 0.33, 0.2, 0.2])
    d.p("LIT is not responsible for outages, pricing changes or policy changes of third-party services outside its control.",
        sz=8.4, col=SLATE)

    d.h1(20, "Support / Warranty")
    d.p("For [__] days after production launch, LIT will correct defects in the delivered scope at no additional charge. "
        "Warranty does not cover new features, changes made by others, or third-party failures. Ongoing maintenance is "
        "available under a separate Maintenance & Support Agreement (LIT-SUPPORT-[CLIENT]-[YEAR]).")

    d.h1(21, "Limitations / Exclusions")
    d.bullets([
        "Content writing, photography and translation unless listed in Section 5.",
        "Third-party licence, subscription and usage fees.",
        "Legal, regulatory or compliance advice.",
        "[Liability cap — e.g. limited to the fees paid under this SOW; to be confirmed by counsel.]",
        "Neither party is liable for indirect or consequential loss [subject to counsel review].",
    ])

    d.h1(22, "Termination / Project Closure")
    d.clauses([
        ("22.1", "Either party may terminate on [__] days’ written notice if the other materially breaches this agreement and fails to remedy the breach within that period."),
        ("22.2", "On termination, the Client pays for work performed up to the termination date, and LIT delivers work in progress paid for."),
        ("22.3", "The project closes when the final deliverable is accepted, handover is complete and the Delivery & Acceptance Report is signed."),
    ])

    d.h1(23, "Authorization & Signatures", keep=262)
    d.p("By signing below, each party confirms that it has read and agrees to this Statement of Work and Service Agreement, "
        "and that the signatory is authorized to bind the party they represent.")
    d.signatures()
    d.p("Reference: LIT-SOW-[YEAR]-[PROJECT-ID]-[CLIENT]  ·  Version [Version]  ·  Signed copies are stored in private "
        "storage with a SHA-256 integrity record.", sz=7.8, col=SLATE_LT, font="LI")


# ════════════════════════════════════════════════════════════════════════════
# 02  PROJECT PROPOSAL + COMMERCIAL QUOTATION
# ════════════════════════════════════════════════════════════════════════════
PROP_SECTIONS = ["Executive Summary", "Client Challenge", "Proposed LIT Solution", "Solution Architecture",
                 "Features & Capabilities", "Deliverables", "Technology Stack", "Implementation Plan", "Timeline",
                 "Commercial Proposal", "Payment Milestones", "Assumptions", "Optional Add-ons", "Next Steps"]


def proposal(d):
    d.cover("LIT / 02 · Master Template", ["Project Proposal", "& Commercial Quotation"],
            "A clear plan, a fixed price, and a working prototype first.",
            cover_meta("LIT-PROPOSAL-[CLIENT]-[PROJECT]", status="[Draft / Sent / Accepted]"))
    d.control_page(ctrl_meta("LIT-PROPOSAL-[CLIENT]-[PROJECT]-[V]", "[Draft / Sent / Accepted]"),
                   list(enumerate(PROP_SECTIONS, 1)),
                   note="Pricing is never hard-coded into this template. The Command Center populates all amounts, dates and "
                        "client details per proposal.")
    d.new_page()
    d.h1(1, "Executive Summary")
    d.p("[Executive Summary]", col=AZURE)
    d.table(["At a glance", ""], [["Solution", "[Solution name]"], ["Timeline", "[__ weeks]"],
                                  ["Investment", "[₹ / $ total, excluding taxes]"], ["Proposal valid until", "[Date]"]],
            [0.3, 0.7])
    d.h1(2, "Client Challenge")
    d.p("[Client Challenge]", col=AZURE)
    d.bullets(["[Pain point 1 — e.g. manual processes consume staff time]",
               "[Pain point 2 — e.g. no single source of truth for customer data]",
               "[Pain point 3 — e.g. current website does not convert visitors]"])
    d.h1(3, "Proposed LIT Solution")
    d.p("[Proposed Solution]", col=AZURE)
    d.callout("How LIT works", "Free working prototype before any payment commitment  ·  The founder writes production "
              "code on every project  ·  Transparent, published pricing  ·  Deterministic AI with strict validation "
              "on every LLM integration.", tone="navy")
    d.h1(4, "Solution Architecture", keep=350)
    d.arch(caption="Indicative architecture. Final design is confirmed in the Technical Specification after onboarding.")
    d.h1(5, "Features & Capabilities")
    d.table(["Feature", "What it does for the client"], [
        ["[Feature 1]", "[Benefit]"], ["[Feature 2]", "[Benefit]"], ["[Feature 3]", "[Benefit]"],
        ["[Feature 4]", "[Benefit]"], ["[Feature 5]", "[Benefit]"], ["[Feature 6]", "[Benefit]"]], [0.32, 0.68])
    d.h1(6, "Deliverables")
    d.table(["ID", "Deliverable", "Format"], [
        ["D-01", "[Web application]", "[Live URL + source repository]"],
        ["D-02", "[Admin dashboard]", "[Live URL]"],
        ["D-03", "[Integrations]", "[Configured services]"],
        ["D-04", "Documentation & handover", "PDF + walkthrough session"]], [0.12, 0.5, 0.38])
    d.h1(7, "Technology Stack")
    d.table(["Layer", "Technology", "Why"], [
        ["Frontend", "[Next.js · React · TypeScript]", "Fast, SEO-friendly, maintainable UI"],
        ["Backend", "[FastAPI / Node.js]", "Typed APIs and background processing"],
        ["Database", "[Supabase PostgreSQL]", "Relational data with row-level security"],
        ["Hosting", "[Vercel / Render]", "Managed deployments with preview environments"],
        ["Automation", "[n8n / Playwright]", "Workflow and process automation"],
        ["CI/CD", "GitHub Actions", "Automated checks on every change"]], [0.18, 0.37, 0.45])
    d.h1(8, "Implementation Plan", keep=180)
    d.steps([("Discover", "Confirm requirements, access and success measures."),
             ("Design", "Technical specification, data model and UI direction."),
             ("Build", "Iterative development on staging with weekly demos."),
             ("Test", "Automated tests, security checks and client UAT."),
             ("Launch", "Production release, handover and warranty period.")])
    d.h1(9, "Timeline", keep=180)
    d.gantt([("Discover", 1, 1), ("Design", 2, 2), ("Build", 3, 5), ("Test", 7, 2), ("Launch & handover", 9, 2)], weeks=10)
    d.p("Indicative timeline. Confirmed dates are set in the Statement of Work.", sz=7.8, col=SLATE_LT, font="LI")
    d.h1(10, "Commercial Proposal")
    d.table(["Item", "Description", "Amount"], [
        ["Core implementation", "[Description]", "[₹ / $]"], ["Integration", "[Description]", "[₹ / $]"],
        ["Deployment", "[Description]", "[Included / ₹ / $]"], ["Support", "[Description]", "[₹ / $]"],
        ["Total", "", "[₹ / $]"]], [0.3, 0.48, 0.22], total_row=True, align=["left", "left", "right"])
    d.p("All amounts exclude applicable taxes. Third-party subscription costs are billed directly to the client.",
        sz=8.4, col=SLATE)
    d.h1(11, "Payment Milestones")
    d.table(["Milestone", "Trigger", "Share", "Amount"], [
        ["1", "SOW signature", "[__%]", "[₹ / $]"], ["2", "[Design approval / staging build]", "[__%]", "[₹ / $]"],
        ["3", "Production launch & handover", "[__%]", "[₹ / $]"]], [0.15, 0.5, 0.13, 0.22])
    d.h1(12, "Assumptions")
    d.bullets(["[Content and brand assets supplied by the client.]", "[Third-party accounts are owned by the client.]",
               "Scope is limited to the deliverables listed in Section 6.", "Feedback is returned within [X] business days."])
    d.h1(13, "Optional Add-ons")
    d.table(["Add-on", "Description", "Amount"], [
        ["[Maintenance & Support]", "[Monthly support plan]", "[₹ / $ per month]"],
        ["[AI assistant]", "[Knowledge-base chatbot]", "[₹ / $]"],
        ["[Automation workflow]", "[Process automation]", "[₹ / $]"]], [0.3, 0.48, 0.22], align=["left", "left", "right"])
    d.h1(14, "Next Steps", keep=180)
    d.steps([("Review", "Review this proposal and raise any questions."),
             ("Confirm", "Confirm scope and the commercial option."),
             ("Sign", "Sign the Statement of Work and pay instalment 1."),
             ("Onboard", "Receive the Onboarding Guide and kick-off.")])
    d.contact()


# ════════════════════════════════════════════════════════════════════════════
# 03  CLIENT ONBOARDING & ACCESS GUIDE (standard, reusable)
# ════════════════════════════════════════════════════════════════════════════
ONB = ["What Happens Next", "Technical Onboarding", "Information We Need", "GitHub Access", "Domain / DNS Access",
       "Cloud Access", "Supabase Access", "Vercel Access", "Third-Party Integrations", "Security Rules",
       "Communication", "Project Delivery Process", "Support"]


def onboarding(d):
    d.cover("LIT / 03 · Welcome", ["Welcome to LIT", "Your Onboarding Guide"],
            "Everything you need to get your project moving, safely.",
            [("Document", "Client Onboarding & Access Guide"), ("Reference", "LIT-Client-Onboarding-Guide"),
             ("Version", "1.0"), ("Classification", "Client-Confidential"),
             ("Document Owner", "Vikash Saravanan"), ("Accompanies", "Welcome email"),
             ("Support", EMAIL), ("Phone", PHONE)])
    d.new_page()
    T(d.c, ML, d.y, "BEFORE YOU BEGIN", f="PPM", sz=8, col=GOLD_DK, tr=2)
    T(d.c, ML, d.y - 26, "Thank you for choosing LIT", f="PPB", sz=19, col=NAVY)
    d.y -= 50
    d.p("This guide explains what happens after you sign, what access and information we need, and how we keep your "
        "systems secure. Most clients complete onboarding in a single sitting. If anything is unclear, reply to the "
        "welcome email and we will walk you through it.")
    d.callout("Security notice", "Never send passwords, API keys, private keys, database passwords or authentication "
              "tokens by email or through the standard onboarding form. LIT will request delegated team / member access "
              "wherever supported. If someone asks you for a password on behalf of LIT, contact us before responding.",
              tone="navy", icon="!")
    d.h2("In this guide")
    c = d.c; half = 7; cw = (CW - 24) / 2; y0 = d.y
    for i, t in enumerate(ONB):
        x = ML + (i // half) * (cw + 24); y = y0 - (i % half) * 17
        T(c, x, y, f"{i + 1:02d}", f="PPB", sz=8.2, col=GOLD_DK); T(c, x + 22, y, t, f="PP", sz=8.8, col=INK)
        hl(c, x, y - 5, cw, col=HexColor("#ECE9DF"), sw=0.5)
    d.y = y0 - half * 17 - SGAP

    d.new_page()
    d.h1(1, "What Happens Next", keep=180)
    d.steps([("Welcome", "You receive this guide and the onboarding form link."),
             ("Information", "You complete the form and share assets."),
             ("Access", "You invite LIT to the accounts listed in this guide."),
             ("Kick-off", "We meet to confirm scope, timeline and contacts."),
             ("Build", "Development starts and weekly updates begin.")])
    d.h1(2, "Technical Onboarding")
    d.p("Once we have access, LIT sets up the working environment for your project:")
    d.bullets(["A private source-code repository under your organization, or transferred to you at handover.",
               "Separate development, preview and production environments so changes are tested before going live.",
               "A project tracker and a shared channel for questions and approvals.",
               "An access register recording every account LIT has been granted, used again at handover to revoke access."])
    d.h1(3, "Information We Need")
    d.table(["Item", "Why we need it", "Format"], [
        ["Business details", "Legal name, address and contacts for documents and invoices", "Onboarding form"],
        ["Brand assets", "Logo, colours, fonts and imagery for the interface", "SVG / PNG, brand guide"],
        ["Content", "Page copy, product data, FAQs", "Docs, spreadsheets"],
        ["Existing systems", "Current website, tools and data sources we connect to", "Links, exports"],
        ["Users & roles", "Who uses the system and what each role can do", "Onboarding form"],
        ["Integrations", "Payment, email, SMS, CRM or AI services required", "Provider names"],
        ["Compliance needs", "Any regulatory or internal policies we must follow", "Policy documents"]],
        [0.22, 0.52, 0.26])
    d.h1(4, "GitHub Access")
    d.clauses([("1", "Create or confirm a GitHub organization for your company (recommended), or use an existing one."),
               ("2", "Invite the LIT GitHub account provided in your welcome email as a member or outside collaborator."),
               ("3", "Grant write access only to the project repositories. Admin access is not required."),
               ("4", "Never share personal access tokens or SSH private keys.")])
    d.h1(5, "Domain / DNS Access")
    d.p("We need to add records (for example A, CNAME and TXT) to point your domain to the application and to verify "
        "email services. Choose one option:")
    d.bullets(["Delegated access: invite LIT as a user at your registrar or DNS provider (e.g. Cloudflare member) where supported.",
               "Assisted change: LIT sends you the exact records and you add them yourself; we verify once they propagate."])
    d.h1(6, "Cloud Access")
    d.p("If your project uses Google Cloud, AWS or Azure, invite LIT through the provider’s identity and access "
        "management (IAM) with a role limited to the project resources. Billing ownership stays with you.")
    d.h1(7, "Supabase Access")
    d.bullets(["Invite LIT to your Supabase organization with the Developer role.",
               "Do not send the service-role key or database password — LIT works through the dashboard and the CLI with its own account.",
               "Row-level security is enabled on all tables we create."])
    d.h1(8, "Vercel Access")
    d.bullets(["Invite LIT to your Vercel team as a Member, or allow LIT to build under its team and transfer the project to you at handover.",
               "Environment variables are entered directly in Vercel, never shared in chat or email."])
    d.h1(9, "Third-Party Integrations")
    d.p("For payment gateways, email and SMS providers, WhatsApp, analytics and AI services, invite LIT as a team member "
        "where the provider supports it. If a provider only issues API keys, you add the key directly to the project’s "
        "environment variables in Vercel or Supabase — LIT will show you exactly where during a short call.")
    d.h1(10, "Security Rules")
    d.bullets(["No passwords, keys or tokens over email, chat or the onboarding form.",
               "Least privilege: LIT requests only the access the project needs.",
               "Multi-factor authentication is recommended on every account you own.",
               "Secrets live only in environment variables or secret managers, never in source code.",
               "At handover, LIT’s access is removed and any shared credentials are rotated."])
    d.h1(11, "Communication")
    d.table(["Channel", "Used for", "Details"], [
        ["Email", "Formal approvals, documents, invoices", EMAIL],
        ["Phone", "Urgent issues", PHONE],
        ["Project channel", "Day-to-day questions", "[WhatsApp / Slack / Teams]"],
        ["Status update", "Progress, risks, next steps", "[Weekly] written summary"],
        ["Review meetings", "Demos and approvals", "[Cadence agreed at kick-off]"]], [0.22, 0.38, 0.4])
    d.h1(12, "Project Delivery Process", keep=180)
    d.steps([("Specify", "Technical Specification approved."), ("Build", "Iterative development on staging."),
             ("Review", "Weekly demos and feedback."), ("Accept", "UAT and written acceptance."),
             ("Handover", "Production launch and ownership transfer.")])
    d.h1(13, "Support")
    d.p("After launch, defects in the delivered scope are fixed during the warranty period stated in your SOW. Ongoing "
        "maintenance is available through a Maintenance & Support Agreement. To report an issue, email "
        f"{EMAIL} with the subject “[Project ID] — short summary” and include steps to reproduce, "
        "screenshots and the time it occurred.")
    d.h2("Onboarding checklist")
    d.checklist(["Onboarding form completed", "Brand assets shared", "GitHub access granted", "Domain / DNS option chosen",
                 "Supabase invitation sent", "Vercel invitation sent", "Integration accounts listed",
                 "Kick-off meeting booked"], cols=2)
    d.contact()


# ════════════════════════════════════════════════════════════════════════════
# 04  PROJECT SCOPE + TECHNICAL SPECIFICATION
# ════════════════════════════════════════════════════════════════════════════
TS = ["Executive Technical Summary", "Business Requirements", "Functional Requirements", "Non-Functional Requirements",
      "System Architecture", "Frontend Architecture", "Backend Architecture", "Database Architecture",
      "Authentication & Authorization", "External Integrations", "Infrastructure", "Security Requirements",
      "Data Flow", "API Requirements", "Deployment Architecture", "Testing Strategy", "Performance Requirements",
      "Monitoring & Observability", "Acceptance Criteria", "Known Constraints", "Open Decisions", "Revision History"]


def techspec(d):
    d.cover("LIT / 04 · Master Template", ["Project Scope &", "Technical Specification"],
            "The engineering blueprint, generated after onboarding review.",
            cover_meta("LIT-TECHSPEC-[PROJECT-ID]", status="[Draft / In review / Approved]"))
    d.control_page(ctrl_meta("LIT-TECHSPEC-[PROJECT-ID]-[V]", "[Draft / In review / Approved]"), list(enumerate(TS, 1)),
                   note="Diagrams must be generated from the project’s real architecture, not copied from this template. "
                        "Blank targets are agreed per project.")
    d.new_page()
    d.h1(1, "Executive Technical Summary")
    d.p("[Technical Summary]", col=AZURE)
    d.kv([["Application type", "[Web app / PWA / Automation / AI workflow]"], ["Primary users", "[User groups]"],
          ["Hosting", "[Vercel / Render / GCP]"], ["Database", "[Supabase PostgreSQL]"], ["Authentication", "[Supabase Auth]"]])
    d.h1(2, "Business Requirements")
    d.table(["ID", "Requirement", "Priority", "Source"], [
        ["BR-01", "[Business requirement]", "[Priority]", "[SOW §4]"], ["BR-02", "[Business requirement]", "[Priority]", "[Workshop]"],
        ["BR-03", "[Business requirement]", "[Priority]", "[Proposal]"]], [0.11, 0.55, 0.14, 0.2], align=["left", "left", "center", "left"])
    d.h1(3, "Functional Requirements")
    d.table(["ID", "The system shall…", "Priority", "Acceptance"], [
        ["FR-01", "[Allow users to register and sign in]", "[Priority]", "AC-01"],
        ["FR-02", "[Functional requirement]", "[Priority]", "AC-02"], ["FR-03", "[Functional requirement]", "[Priority]", "AC-03"],
        ["FR-04", "[Functional requirement]", "[Priority]", "AC-04"]], [0.11, 0.55, 0.14, 0.2], align=["left", "left", "center", "left"])
    d.h1(4, "Non-Functional Requirements")
    d.table(["Category", "Requirement", "Target"], [
        ["Performance", "Pages and APIs respond quickly under expected load", "[Target]"],
        ["Availability", "Service is available during agreed hours", "[Target]"],
        ["Security", "OWASP Top 10 risks addressed; secrets never in code", "Verified at delivery"],
        ["Accessibility", "Interface usable with keyboard and screen readers", "[WCAG level]"],
        ["Compatibility", "Supported browsers and devices", "[Browser list]"],
        ["Scalability", "Expected users and data volume", "[Volume]"]], [0.2, 0.55, 0.25])
    d.h1(5, "System Architecture", keep=350)
    d.arch(caption="Replace with the project-specific diagram generated from the confirmed architecture.")
    d.h1(6, "Frontend Architecture")
    d.kv([["Framework", "[Next.js (App Router)]"], ["Language", "TypeScript"], ["Styling", "[Tailwind CSS / CSS modules]"],
          ["Rendering", "[SSR / SSG / ISR per route]"], ["State & data", "[Server components, React Query]"],
          ["Hosting", "[Vercel]"]])
    d.h1(7, "Backend Architecture")
    d.kv([["Runtime", "[Next.js route handlers / FastAPI / Node.js]"], ["Background jobs", "[n8n / queue / cron]"],
          ["Validation", "Typed schemas on every input (e.g. Zod / Pydantic)"], ["AI / LLM calls", "[Provider, structured JSON output, retries]"],
          ["Hosting", "[Vercel / Render / GCP VM]"]])
    d.h1(8, "Database Architecture")
    d.table(["Table", "Purpose", "Key fields", "Access policy"], [
        ["[profiles]", "[User profile data]", "[id, role, created_at]", "[Owner read/write]"],
        ["[table]", "[Purpose]", "[Fields]", "[RLS policy]"], ["[table]", "[Purpose]", "[Fields]", "[RLS policy]"]],
        [0.18, 0.3, 0.27, 0.25])
    d.bullets(["Row-level security enabled on every table.", "Schema changes managed as versioned migrations in the repository.",
               "Backups: [frequency and retention per Supabase plan]."])
    d.h1(9, "Authentication & Authorization")
    d.table(["Role", "Can do", "Cannot do"], [["[Admin]", "[Permissions]", "[Restrictions]"],
                                              ["[Member]", "[Permissions]", "[Restrictions]"],
                                              ["[Guest]", "[Permissions]", "[Restrictions]"]], [0.2, 0.4, 0.4])
    d.p("Provider: [Supabase Auth]  ·  Methods: [Email + password / magic link / OAuth]  ·  MFA: [Required for admins]",
        sz=8.6, col=SLATE)
    d.h1(10, "External Integrations")
    d.table(["Integration", "Purpose", "Auth method", "Owner", "Status"], [
        ["[Payment gateway]", "[Payments]", "[API key in env]", "[Client]", "[Status]"],
        ["[Email provider]", "[Transactional email]", "[API key in env]", "[Client]", "[Status]"],
        ["[AI / LLM API]", "[Inference]", "[API key in env]", "[Client]", "[Status]"]],
        [0.21, 0.22, 0.22, 0.15, 0.2], align=["left", "left", "left", "left", "center"])
    d.h1(11, "Infrastructure")
    d.table(["Environment", "URL", "Branch", "Purpose"], [
        ["Development", "localhost", "feature/*", "Local engineering"],
        ["Preview", "[auto per pull request]", "PR branches", "Review before merge"],
        ["Staging", "[staging.domain]", "[develop]", "Client demos and UAT"],
        ["Production", "[domain]", "main", "Live system"]], [0.2, 0.3, 0.2, 0.3])
    d.h1(12, "Security Requirements")
    d.bullets(["Least-privilege access for every account and service key.", "Secrets stored only in platform environment variables.",
               "HTTPS everywhere with managed TLS certificates.", "Input validation and output encoding on all user data.",
               "Dependency vulnerability scanning in CI.", "Audit of access register at handover; LIT access revoked."])
    d.h1(13, "Data Flow", keep=180)
    d.steps([("User action", "Request from browser or app."), ("Frontend", "Validates input and calls the API."),
             ("API", "Authenticates and applies business rules."), ("Database", "RLS-enforced read / write."),
             ("Response", "Result returned; events trigger integrations.")])
    d.h1(14, "API Requirements")
    d.table(["Method", "Endpoint", "Purpose", "Auth"], [
        ["GET", "[/api/resource]", "[List resources]", "[User]"], ["POST", "[/api/resource]", "[Create resource]", "[User]"],
        ["PATCH", "[/api/resource/:id]", "[Update resource]", "[Owner]"], ["DELETE", "[/api/resource/:id]", "[Delete resource]", "[Admin]"]],
        [0.13, 0.32, 0.37, 0.18])
    d.h1(15, "Deployment Architecture", keep=180)
    d.steps([("Commit", "Work on a feature branch."), ("Pull request", "CI runs lint, type checks and tests."),
             ("Preview", "Automatic preview deployment."), ("Merge", "Approved changes merged to main."),
             ("Release", "Production deployment with rollback.")])
    d.h1(16, "Testing Strategy")
    d.table(["Level", "Scope", "Tooling", "Owner"], [
        ["Unit", "Functions and components", "[Vitest / Pytest]", "LIT"],
        ["Integration", "API and database behaviour", "[Test suite]", "LIT"],
        ["End-to-end", "Critical user journeys", "[Playwright]", "LIT"],
        ["Security", "Dependency audit, RLS checks", "[npm audit / advisors]", "LIT"],
        ["UAT", "Business acceptance", "Staging environment", "Client"]], [0.18, 0.37, 0.27, 0.18])
    d.h1(17, "Performance Requirements")
    d.table(["Metric", "Target", "Measured with"], [
        ["Largest Contentful Paint", "[Target]", "Lighthouse / Vercel Analytics"], ["API response time (p95)", "[Target]", "[Monitoring]"],
        ["Concurrent users", "[Target]", "[Load test]"]], [0.38, 0.24, 0.38])
    d.h1(18, "Monitoring & Observability")
    d.bullets(["Application and function logs: [Vercel / Render logs].", "Database health and advisories: Supabase dashboard.",
               "Error tracking: [tool].", "Uptime checks and alerts to: [recipients]."])
    d.h1(19, "Acceptance Criteria", keep=180)
    d.table(["ID", "Criterion", "Verified by"], [["AC-01", "[Criterion linked to FR-01]", "[Test / demo]"],
                                                ["AC-02", "[Criterion]", "[Test / demo]"], ["AC-03", "[Criterion]", "[Test / demo]"]],
            [0.13, 0.6, 0.27])
    d.h1(20, "Known Constraints")
    d.bullets(["[Constraint — e.g. third-party API rate limits]", "[Constraint — e.g. budget or plan limits]",
               "[Constraint — e.g. legacy data quality]"])
    d.h1(21, "Open Decisions")
    d.table(["ID", "Decision", "Options", "Owner", "Due"], [
        ["OD-01", "[Decision needed]", "[Option A / B]", "[Client]", "[Date]"],
        ["OD-02", "[Decision needed]", "[Option A / B]", "[LIT]", "[Date]"]], [0.11, 0.33, 0.26, 0.14, 0.16])
    d.h1(22, "Revision History")
    d.table(["Version", "Date", "Description", "Prepared by"], [["1.0", "[Date]", "Initial issue", "LIT"],
                                                                ["1.1", "[Date]", "[Scope revision]", "LIT"]],
            [0.14, 0.2, 0.46, 0.2])
    d.ensure(250); d.h2("Approval")
    d.signatures(left_title="PREPARED BY — LIT", right_title="APPROVED BY — [CLIENT COMPANY]", extra=["Signature", "Date"])


# ════════════════════════════════════════════════════════════════════════════
# 05  PROJECT DELIVERY + ACCEPTANCE REPORT
# ════════════════════════════════════════════════════════════════════════════
DR = ["Executive Summary", "Original Scope", "Delivered Components", "Deployment Information", "Integration Status",
      "Testing Results", "Security Verification", "Performance Results", "Known Limitations", "Documentation Delivered",
      "Client Access / Handover", "Outstanding Items", "Support Period", "Acceptance", "Sign-Off"]


def delivery(d):
    d.cover("LIT / 05 · Master Template", ["Project Delivery", "& Acceptance Report"],
            "A verified, professional record of project closure.",
            [("Client", "[Client Company]"), ("Project", "[Project Name]"), ("Project ID", "[PROJECT-ID]"),
             ("Delivery Date", "[Date]"), ("Reference", "LIT-DELIVERY-[PROJECT-ID]-[DATE]"), ("Version", "1.0"),
             ("Document Owner", "Vikash Saravanan"), ("Status", "[Draft / Accepted]")])
    d.control_page(ctrl_meta("LIT-DELIVERY-[PROJECT-ID]-[DATE]", "[Draft / Accepted]"), list(enumerate(DR, 1)),
                   note="Status columns are left blank. Enter PASS only when verification evidence has been recorded; "
                        "otherwise enter PENDING, FAIL or N/A. Never pre-fill PASS.")
    d.new_page()
    d.h1(1, "Executive Summary")
    d.p("[Delivery Summary]", col=AZURE)
    d.h1(2, "Original Scope")
    d.table(["Reference", "Document"], [["SOW", "LIT-SOW-[YEAR]-[PROJECT-ID]"], ["Technical Specification", "LIT-TECHSPEC-[PROJECT-ID]-[V]"],
                                        ["Approved change requests", "[LIT-CR-… list or “None”]"]], [0.32, 0.68])
    d.h1(3, "Delivered Components")
    d.p("Status legend:  PASS = verified with evidence  ·  PENDING = awaiting verification  ·  FAIL = verification failed  "
        "·  N/A = not in scope.", sz=8.2, col=SLATE)
    d.table(["Deliverable", "Status", "Verification"], [
        ["Frontend", "[Status]", "[Reference]"], ["Backend", "[Status]", "[Reference]"], ["Database", "[Status]", "[Reference]"],
        ["Authentication", "[Status]", "[Reference]"], ["Production deployment", "[Status]", "[Reference]"]],
        [0.4, 0.2, 0.4], align=["left", "center", "left"])
    d.h1(4, "Deployment Information")
    d.table(["Environment", "URL", "Platform", "Version / commit", "Date"], [
        ["Production", "[https://domain]", "[Vercel]", "[tag / SHA]", "[Date]"],
        ["Staging", "[https://staging.domain]", "[Vercel]", "[tag / SHA]", "[Date]"],
        ["Database", "[Project ref]", "Supabase", "[Migration ID]", "[Date]"]], [0.17, 0.27, 0.16, 0.22, 0.18])
    d.h1(5, "Integration Status")
    d.table(["Integration", "Status", "Notes"], [["[Payment gateway]", "[Status]", "[Mode: live / test]"],
                                                ["[Email provider]", "[Status]", "[Domain verified]"],
                                                ["[AI / LLM API]", "[Status]", "[Notes]"]], [0.35, 0.2, 0.45], align=["left", "center", "left"])
    d.h1(6, "Testing Results")
    d.table(["Suite", "Cases", "Passed", "Failed", "Evidence"], [
        ["Unit", "[n]", "[n]", "[n]", "[CI run link]"], ["Integration", "[n]", "[n]", "[n]", "[CI run link]"],
        ["End-to-end", "[n]", "[n]", "[n]", "[Report]"], ["UAT", "[n]", "[n]", "[n]", "[Client sign-off]"]],
        [0.22, 0.12, 0.12, 0.12, 0.42], align=["left", "center", "center", "center", "left"])
    d.h1(7, "Security Verification")
    d.table(["Check", "Result", "Evidence"], [
        ["Row-level security enabled on all tables", "[Status]", "[Advisor report]"],
        ["No secrets in repository history", "[Status]", "[Scan result]"],
        ["HTTPS enforced on all domains", "[Status]", "[Check]"],
        ["Dependency audit — no critical issues", "[Status]", "[Audit output]"],
        ["Auth flows tested, incl. password reset", "[Status]", "[Test reference]"]], [0.5, 0.18, 0.32], align=["left", "center", "left"])
    d.h1(8, "Performance Results")
    d.table(["Metric", "Target", "Measured", "Result"], [
        ["Largest Contentful Paint", "[Target]", "[Value]", "[Status]"], ["API response (p95)", "[Target]", "[Value]", "[Status]"],
        ["Lighthouse performance", "[Target]", "[Value]", "[Status]"]], [0.36, 0.2, 0.2, 0.24], align=["left", "left", "left", "center"])
    d.h1(9, "Known Limitations")
    d.bullets(["[Limitation and its impact]", "[Limitation and any planned follow-up]"])
    d.h1(10, "Documentation Delivered")
    d.table(["Document", "Format", "Location"], [["Architecture summary", "PDF", "[Link]"], ["Operating / admin guide", "PDF", "[Link]"],
                                                ["Environment & access register", "Secure document", "[Link]"],
                                                ["Source code README", "Markdown", "[Repository]"]], [0.42, 0.2, 0.38])
    d.h1(11, "Client Access / Handover")
    d.table(["Asset", "Owner after handover", "Transfer status"], [
        ["Source repositories", "[Client]", "[Status]"], ["Vercel project", "[Client]", "[Status]"],
        ["Supabase project", "[Client]", "[Status]"], ["Domain & DNS", "[Client]", "[Status]"],
        ["LIT access revoked / credentials rotated", "[Client]", "[Status]"]], [0.45, 0.3, 0.25], align=["left", "left", "center"])
    d.h1(12, "Outstanding Items")
    d.table(["ID", "Item", "Owner", "Target date"], [["OI-01", "[Item]", "[LIT / Client]", "[Date]"],
                                                     ["OI-02", "[Item]", "[LIT / Client]", "[Date]"]], [0.12, 0.5, 0.2, 0.18])
    d.h1(13, "Support Period")
    d.p("Warranty period: [__ days] from [launch date], covering defects in the delivered scope as defined in the SOW. "
        "Ongoing support: [Covered by LIT-SUPPORT-[CLIENT]-[YEAR] / Not contracted].")
    d.h1(14, "Acceptance")
    d.p("The Client confirms one of the following:")
    d.checklist(["Accepted — all deliverables meet the agreed acceptance criteria.",
                 "Accepted with the outstanding items listed in Section 12.",
                 "Not accepted — defects listed in writing and attached."])
    d.h1(15, "Sign-Off", keep=262)
    d.signatures(left_title="DELIVERED BY — LIT", right_title="ACCEPTED BY — [CLIENT COMPANY]")


# ════════════════════════════════════════════════════════════════════════════
# 06  CHANGE REQUEST / ADDITIONAL WORK ORDER
# ════════════════════════════════════════════════════════════════════════════
def change_request(d):
    d.cover("LIT / 06 · Master Template", ["Change Request", "& Additional Work Order"],
            "Keeping the original SOW a controlled, agreed baseline.",
            [("CR Reference", "LIT-CR-[PROJECT-ID]-[CR-NO]"), ("Project", "[Project Name]"), ("Client", "[Client Company]"),
             ("Requested By", "[Name, Role]"), ("Request Date", "[Date]"), ("Related SOW", "LIT-SOW-[YEAR]-[PROJECT-ID]"),
             ("Version", "1.0"), ("Status", "[Requested / Approved / Rejected]")])
    d.new_page()
    T(d.c, ML, d.y, "CHANGE REQUEST", f="PPM", sz=8, col=GOLD_DK, tr=2)
    T(d.c, ML, d.y - 26, "Request Details", f="PPB", sz=19, col=NAVY)
    d.y -= 52
    d.steps([("Requested", "Change raised in writing."), ("Assessed", "LIT assesses impact."),
             ("Approved", "Both parties sign."), ("Scheduled", "Plan and SOW updated."), ("Delivered", "Work delivered and accepted.")])
    d.kv([["CR Reference", "LIT-CR-[PROJECT-ID]-[CR-NO]"], ["Project", "[Project Name]"], ["Client", "[Client Company]"],
          ["Requested by", "[Name, Role]"], ["Request date", "[Date]"], ["Priority", "[Low / Medium / High]"],
          ["Related SOW", "LIT-SOW-[YEAR]-[PROJECT-ID]"]], label_w=0.26)
    d.h1(1, "Original Scope")
    d.p("[Original Scope]", col=AZURE)
    d.h1(2, "Requested Change")
    d.p("[Requested Change]", col=AZURE)
    d.h1(3, "Reason")
    d.p("[Change Reason]", col=AZURE)
    d.h1(4, "Technical Impact")
    d.table(["Area", "Impact"], [["Frontend", "[Impact or “None”]"], ["Backend / APIs", "[Impact]"],
                                 ["Database", "[Impact]"], ["Integrations", "[Impact]"], ["Testing", "[Additional testing required]"]],
            [0.26, 0.74])
    d.h1(5, "Schedule Impact")
    d.table(["Milestone", "Original date", "Revised date", "Change"], [
        ["[M3 — Core build]", "[Date]", "[Date]", "[+ __ days]"], ["[M5 — Launch]", "[Date]", "[Date]", "[+ __ days]"]],
        [0.37, 0.21, 0.21, 0.21])
    d.h1(6, "Commercial Impact")
    d.table(["Item", "Description", "Amount"], [["[Additional work]", "[Description]", "[₹ / $]"],
                                                ["[Removed work credit]", "[Description]", "[− ₹ / $]"],
                                                ["Net change (excluding taxes)", "", "[₹ / $]"]],
            [0.32, 0.46, 0.22], total_row=True, align=["left", "left", "right"])
    d.p("Payment terms for this change: [e.g. 50% on approval, 50% on delivery].", sz=8.6, col=SLATE)
    d.h1(7, "New Deliverables")
    d.table(["ID", "Deliverable", "Acceptance criterion"], [["CR-D-01", "[Deliverable]", "[Criterion]"],
                                                           ["CR-D-02", "[Deliverable]", "[Criterion]"]], [0.15, 0.45, 0.4])
    d.h1(8, "Revised Completion Date")
    d.callout("Revised project completion", "[Original completion date]  →  [Revised completion date]. All other terms of the "
              "SOW remain unchanged unless stated in this Change Request.", tone="navy")
    d.h1(9, "Approval")
    d.checklist(["Approved — proceed as described", "Approved with modifications (attached)", "Rejected — continue under original SOW"],
                cols=1)
    d.signatures(left_title="LIT APPROVAL", right_title="CLIENT APPROVAL — [CLIENT COMPANY]", extra=["Signature", "Date"])


# ════════════════════════════════════════════════════════════════════════════
# 07  MAINTENANCE + SUPPORT AGREEMENT
# ════════════════════════════════════════════════════════════════════════════
SUP = ["Agreement Summary", "Covered Systems", "Included Services", "Excluded Services", "Support Channels", "Support Hours",
       "Incident Classification", "Response Targets", "Maintenance Windows", "Updates & Security Patches",
       "Infrastructure Responsibilities", "Third-Party Costs", "Backup Responsibilities", "Monitoring",
       "Monthly / Annual Charges", "Payment Terms", "Term", "Renewal", "Cancellation", "Signatures"]


def support(d):
    d.cover("LIT / 07 · Master Template", ["Maintenance &", "Support Agreement"],
            "Keeping your system secure, current and running after launch.",
            cover_meta("LIT-SUPPORT-[CLIENT]-[YEAR]", status="[Draft / Active / Expired]"))
    d.control_page(ctrl_meta("LIT-SUPPORT-[CLIENT]-[YEAR]", "[Draft / Active / Expired]"), list(enumerate(SUP, 1)),
                   note="Do not publish response or resolution times until LIT has decided what it can contractually support. "
                        "All service levels in this template are placeholders. " + TEMPLATE_NOTE)
    d.new_page()
    d.h1(1, "Agreement Summary")
    d.kv([["Provider", LEGAL_NAME], ["Client", "[Client Company]"], ["Plan", "[Essential / Standard / Priority]"],
          ["Start date", "[Date]"], ["Term", "[12 months]"], ["Related project", "[PROJECT-ID]"]])
    d.h1(2, "Covered Systems")
    d.table(["System", "Environment", "Platform"], [["[Web application]", "Production", "[Vercel]"],
                                                    ["[Database]", "Production", "[Supabase]"],
                                                    ["[Automations]", "Production", "[n8n / Render]"]], [0.4, 0.3, 0.3])
    d.h1(3, "Included Services")
    d.bullets(["Corrective maintenance of defects in covered systems.", "Dependency and framework updates, including security patches.",
               "Monitoring review and incident response per Section 8.", "[__ hours] per month of minor enhancements.",
               "[Monthly] health report."])
    d.h1(4, "Excluded Services")
    d.bullets(["New features or major redesigns (quoted separately via Change Request).", "Issues caused by changes made by others.",
               "Third-party service outages and fees.", "Content entry and data clean-up unless agreed."])
    d.h1(5, "Support Channels")
    d.table(["Channel", "Use for", "Contact"], [["Email", "All requests and incident reports", EMAIL],
                                               ["Phone", "Severity 1 incidents only", PHONE],
                                               ["[Ticket portal]", "[Tracking]", "[URL]"]], [0.2, 0.4, 0.4])
    d.h1(6, "Support Hours")
    d.p("Standard support hours: [Days], [Start – End] IST, excluding public holidays in Tamil Nadu, India. "
        "Out-of-hours coverage: [Not included / Severity 1 only / Included].")
    d.h1(7, "Incident Classification")
    d.table(["Severity", "Definition", "Example"], [
        ["S1", "System down or critical function unusable for all users", "Production site not loading"],
        ["S2", "Major function impaired, workaround difficult", "Payments failing for some users"],
        ["S3", "Minor function impaired, workaround available", "Report export slow"],
        ["S4", "Cosmetic issue or question", "Typo, styling issue"]], [0.14, 0.5, 0.36], align=["center", "left", "left"])
    d.h1(8, "Response Targets")
    d.table(["Severity", "First response", "Target resolution / workaround"], [
        ["S1", "[To be agreed]", "[To be agreed]"], ["S2", "[To be agreed]", "[To be agreed]"],
        ["S3", "[To be agreed]", "[To be agreed]"], ["S4", "[To be agreed]", "[To be agreed]"]],
        [0.18, 0.36, 0.46], align=["center", "left", "left"])
    d.p("Targets apply during support hours and are measured from receipt of a complete report.", sz=8.4, col=SLATE)
    d.h1(9, "Maintenance Windows")
    d.p("Planned maintenance is carried out in [window, e.g. Sunday 22:00–02:00 IST] with at least [__] days’ notice. "
        "Emergency security patches may be applied outside this window with notice as soon as practical.")
    d.h1(10, "Updates & Security Patches")
    d.bullets(["Critical security patches applied [as soon as practical after release].", "Routine dependency updates [monthly].",
               "Major framework upgrades quoted separately when they require code changes."])
    d.h1(11, "Infrastructure Responsibilities")
    d.table(["Responsibility", "LIT", "Client"], [["Hosting account ownership & billing", "", "●"],
                                                  ["Application code maintenance", "●", ""],
                                                  ["Platform configuration", "●", ""],
                                                  ["User administration", "", "●"],
                                                  ["Domain renewal", "", "●"]], [0.6, 0.2, 0.2], align=["left", "center", "center"])
    d.h1(12, "Third-Party Costs")
    d.p("Hosting, database, domain, messaging and AI usage fees are paid by the Client directly to providers unless "
        "otherwise agreed. LIT will notify the Client of any change that is expected to materially increase these costs.")
    d.h1(13, "Backup Responsibilities")
    d.bullets(["Database backups: [per Supabase plan / additional off-site export].", "Restore testing: [Quarterly].",
               "Source code: hosted in the Client’s Git repositories."])
    d.h1(14, "Monitoring")
    d.bullets(["Uptime checks on production URLs.", "Error and log review [weekly].", "Database advisories reviewed [monthly]."])
    d.h1(15, "Monthly / Annual Charges")
    d.table(["Plan", "Includes", "Monthly", "Annual"], [
        ["[Essential]", "[Inclusions]", "[₹ / $]", "[₹ / $]"], ["[Standard]", "[Inclusions]", "[₹ / $]", "[₹ / $]"],
        ["[Priority]", "[Inclusions]", "[₹ / $]", "[₹ / $]"]], [0.2, 0.44, 0.18, 0.18], align=["left", "left", "right", "right"])
    d.h1(16, "Payment Terms")
    d.p("Charges are invoiced [monthly / annually in advance] and payable within [__] days. Fees exclude applicable taxes. "
        "Services may be suspended for invoices overdue by more than [__] days, after written notice.")
    d.h1(17, "Term")
    d.p("This agreement starts on [start date] and continues for [__ months].")
    d.h1(18, "Renewal")
    d.p("The agreement [renews automatically for successive __-month terms / renews only by written agreement]. LIT will "
        "give [__] days’ notice of any change to charges before renewal.")
    d.h1(19, "Cancellation")
    d.p("Either party may cancel with [__] days’ written notice. On cancellation, LIT provides a handover of current "
        "system state and its access is revoked.")
    d.h1(20, "Signatures", keep=262)
    d.signatures()
    d.contact()


DOCS = [
    ("LIT-01-SOW-Service-Agreement.pdf", 1, "Statement of Work", "LIT-SOW-[YEAR]-[PROJECT-ID]-[CLIENT]", sow),
    ("LIT-02-Proposal-Commercial-Quotation.pdf", 2, "Project Proposal", "LIT-PROPOSAL-[CLIENT]-[PROJECT]-[V]", proposal),
    ("LIT-03-Client-Onboarding-Guide.pdf", 3, "Onboarding & Access Guide", "LIT-Client-Onboarding-Guide", onboarding),
    ("LIT-04-Technical-Specification.pdf", 4, "Technical Specification", "LIT-TECHSPEC-[PROJECT-ID]-[V]", techspec),
    ("LIT-05-Delivery-Acceptance-Report.pdf", 5, "Delivery & Acceptance", "LIT-DELIVERY-[PROJECT-ID]-[DATE]", delivery),
    ("LIT-06-Change-Request.pdf", 6, "Change Request", "LIT-CR-[PROJECT-ID]-[CR-NO]", change_request),
    ("LIT-07-Maintenance-Support-Agreement.pdf", 7, "Maintenance & Support", "LIT-SUPPORT-[CLIENT]-[YEAR]", support),
]

def slug(s):
    return re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-")


def main():
    ap = argparse.ArgumentParser(description="Build the 7 LIT client document templates.")
    ap.add_argument("--data", help="client JSON file (see data/example_client.json). Omit for blank templates.")
    ap.add_argument("--out", default=os.path.join(HERE, "output"), help="output folder (default: ./output)")
    ap.add_argument("--only", nargs="*", type=int, help="build only these documents, e.g. --only 1 2")
    ap.add_argument("--list", action="store_true", help="list every fillable field per document (writes data/FIELDS.md)")
    a = ap.parse_args()

    data = {}
    if a.data:
        with open(a.data, encoding="utf-8") as f:
            data = json.load(f)
    common = data.get("common", {})
    os.makedirs(a.out, exist_ok=True)
    report = ["# Fillable fields per document", "",
              "Use these keys in your client JSON. `Name` fills every occurrence; `Name#3` fills only the 3rd one.", ""]

    for fn, n, short, ref, f in DOCS:
        if a.only and n not in a.only:
            continue
        set_fill({**common, **data.get(f"{n:02d}", {})})
        client = FILL.get("Client Company", "")
        name = fn.replace(".pdf", f"-{slug(client)}.pdf") if client else fn
        d = Doc(os.path.join(a.out, name), n, short, ref, version="1.0" if n == 3 else "[Version]")
        pages = d.build(f)
        print(f"{name:60s} {pages:3d} pages")
        if a.list:
            report += [f"## {n:02d} \u2014 {short}  (JSON section \"{n:02d}\")", "", "| Section | Key |", "|---|---|"]
            report += [f"| {s} | `{k}` |" for s, k in RECORD]
            report.append("")
    if a.list:
        with open(os.path.join(HERE, "data", "FIELDS.md"), "w", encoding="utf-8") as fh:
            fh.write("\n".join(report))
        print("Field list written to data/FIELDS.md")


if __name__ == "__main__":
    main()
