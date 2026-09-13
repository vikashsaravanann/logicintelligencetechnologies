# Email Integration & Delivery Architecture Report

**Logic Intelligence Technologies**  
*Document Version: 1.0.0 — Production Release*

---

## 1. Executive Summary & Critical Mandate

The primary requirement for transactional and outbound notifications:
1. **Absolute Removal of Email Header Banner**: The banner image (`/assets/og-banner.jpg`) was permanently eliminated from the email header across all templates.
2. **Standardized Brand Header**: Outgoing emails now render a clean, professional header containing the official company logo (`https://www.logicintelligencetechnologies.in/assets/logo.jpg`), the company name **LOGIC INTELLIGENCE TECHNOLOGIES**, and the studio description **Enterprise Software & AI Systems**.
3. **Cross-Client Compatibility**: Zero client-side script dependencies, table-based structural columns (`@react-email/components`), inline CSS styles, and resilient plain-text fallback headers.

---

## 2. Updated Email Header Layout

### Visual Specification
```text
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  [LIT LOGO]   LOGIC INTELLIGENCE TECHNOLOGIES             │
│   (44x44)     Enterprise Software & AI Systems            │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Contextual Email Body & Action Call                      │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Component Code (`emails/components/email-header.tsx`)
```tsx
export const EmailHeader = () => {
  return (
    <Section style={header}>
      <Row>
        <Column style={logoColumn}>
          <Img
            src={LOGO_URL}
            alt="Logic Intelligence Technologies Logo"
            width="44"
            height="44"
            style={logo}
          />
        </Column>
        <Column style={textColumn}>
          <Text style={brandTitle}>LOGIC INTELLIGENCE TECHNOLOGIES</Text>
          <Text style={brandSubtitle}>Enterprise Software & AI Systems</Text>
        </Column>
      </Row>
    </Section>
  );
};
```

---

## 3. Comprehensive Email Workflow Catalog

Every email event in the platform utilizes this standardized header via `<EmailHeader />`:

| Event / Workflow | Trigger Route / Action | Recipient Type | Template | Sender Address | Reply-To Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Contact Form** | `/api/contact` | Customer | `lead-confirmation-email.tsx` | `support@logicintelligencetechnologies.in` | `support@logicintelligencetechnologies.in` |
| **Internal Lead Alert** | `/api/contact` | LIT Team | `new-lead-notification-email.tsx` | `notifications@logicintelligencetechnologies.in` | Customer's submitted email |
| **Free Demo Request** | `/api/free-demo` | Customer | `free-demo-confirmation-email.tsx` | `sales@logicintelligencetechnologies.in` | `sales@logicintelligencetechnologies.in` |
| **Demo Ready Alert** | Admin Command | Customer | `demo-ready-email.tsx` | `sales@logicintelligencetechnologies.in` | `sales@logicintelligencetechnologies.in` |
| **Discovery Consultation** | `/api/booking` | Customer | `welcome-email.tsx` / `lead-confirmation-email.tsx` | `consulting@logicintelligencetechnologies.in` | `consulting@logicintelligencetechnologies.in` |
| **Website Checklist** | `/api/checklist` | Customer | `checklist-download-email.tsx` | `resources@logicintelligencetechnologies.in` | `support@logicintelligencetechnologies.in` |
| **Checklist Submission Alert**| `/api/checklist` | LIT Team | `checklist-submission-email.tsx` | `notifications@logicintelligencetechnologies.in` | Customer's email |
| **Job Application** | `/api/jobs/apply` | Applicant | `job-application-email.tsx` | `careers@logicintelligencetechnologies.in` | `careers@logicintelligencetechnologies.in` |
| **Newsletter Opt-in** | `/api/newsletter` | Subscriber | `newsletter-double-optin-email.tsx` | `newsletter@logicintelligencetechnologies.in` | `newsletter@logicintelligencetechnologies.in` |
| **Newsletter Welcome** | `/api/newsletter/confirm` | Subscriber | `newsletter-confirmation-email.tsx` | `newsletter@logicintelligencetechnologies.in` | `newsletter@logicintelligencetechnologies.in` |
| **Proposal Dispatch** | Admin Dashboard | Client Signer | `proposal-sent-email.tsx` | `billing@logicintelligencetechnologies.in` | `billing@logicintelligencetechnologies.in` |
| **Invoice Notice** | `/api/admin/invoices` | Client Billing | `invoice-email.tsx` | `billing@logicintelligencetechnologies.in` | `billing@logicintelligencetechnologies.in` |
| **Payment Received** | Stripe Webhook | Client Billing | `payment-received-email.tsx` | `billing@logicintelligencetechnologies.in` | `billing@logicintelligencetechnologies.in` |
| **Project Kickoff** | Admin Trigger | Client Team | `project-kickoff-email.tsx` | `projects@logicintelligencetechnologies.in` | `projects@logicintelligencetechnologies.in` |
| **Project Delivered** | Admin Trigger | Client Team | `project-delivered-email.tsx` | `projects@logicintelligencetechnologies.in` | `projects@logicintelligencetechnologies.in` |
| **Maintenance Renewal** | Cron / Admin | Client Owner | `maintenance-renewal-email.tsx` | `support@logicintelligencetechnologies.in` | `support@logicintelligencetechnologies.in` |
| **Login Security Alert**| `/api/auth/login-notification` | LIT Admin | `login-notification-email.tsx` | `security@logicintelligencetechnologies.in` | `security@logicintelligencetechnologies.in` |
| **Password Reset** | Auth Recovery | User | `password-reset-email.tsx` | `auth@logicintelligencetechnologies.in` | `support@logicintelligencetechnologies.in` |

---

## 4. Email Security & Anti-Abuse Standards

- **SSRF & Header Injection Protection**: Every address and subject line is strictly passed through `src/lib/email/validation.ts` and verified with tests (`src/lib/email/ssrf.test.ts`, `validation.test.ts`).
- **No Secret Exposure**: Zero service keys, SMTP credentials, or raw DB IDs are ever exposed in outgoing HTML or plain text.
- **Double Opt-In & List-Unsubscribe**: HMAC-signed one-click unsubscribe links generated for all broadcast and newsletter workflows.
- **DKIM / SPF / BIMI Compliance**: Emails are authored with HTTPS-hosted assets, valid sender domains, and compliant markup conforming to Zoho Mail, Gmail, Outlook, and Apple Mail rendering guidelines.
