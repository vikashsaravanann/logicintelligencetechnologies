# Global Jurisdiction & Channel Compliance Matrix
**Organization:** Logic Intelligence Technologies (LIT)  
**Date:** October 11, 2026  
**Document:** `docs/compliance/JURISDICTION-CHANNEL-MATRIX.md`  
**Review Standard:** Strict Regulatory Alignment (Zero Presumption of Legality)  
**Next Formal Legal Re-Review:** April 11, 2027  

---

## 1. Governance Principles

1. **Default-Deny:** In the absence of an explicit, verified, and documented legal basis plus formal compliance officer signoff, all direct marketing communications are prohibited.
2. **Channel Separation:** Authorization for one channel (e.g., B2B email) **never** implies or permits authorization for other channels (e.g., SMS, automated telephone calls, WhatsApp, or LinkedIn messaging).
3. **Recipient Granularity:** Corporate entities (Ltd, Inc, LLC, AG, GmbH, Private Limited) are subject to distinct regulatory regimes compared to individuals, consumers, and sole proprietorships.
4. **Distinction Between Solicited & Unsolicited:** Inbound requests (demo inquiries, whitepaper downloads, contact form submissions) constitute solicited communications and are governed by contract performance / explicit consent, not anti-spam cold outreach prohibitions.
5. **No AI Compliance Authority:** Large Language Models (Groq, etc.) may only assist in drafting text or summarizing statutory rules. Only deterministic code and human compliance officers can clear a communication for dispatch.

---

## 2. Comprehensive Country-by-Country Matrix

### 1. United States (US)
- **Primary Statutes & Regulators:**
  - Federal Trade Commission (FTC) CAN-SPAM Act (15 U.S.C. 7701–7713) — [FTC CAN-SPAM Compliance Guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)
  - Telephone Consumer Protection Act (TCPA, 47 U.S.C. § 227) & FCC Telemarketing Sales Rule
  - State Privacy & Telemarketing Laws (California CCPA/CPRA, Texas Sec. 302, Florida Telemarketing Act)
- **Channel Analysis:**
  | Channel | Recipient Class | Legal Requirement | Technical Posture | Scoped Status |
  | :--- | :--- | :--- | :--- | :--- |
  | **Unsolicited B2B Email** | Corporate Entity | Opt-out regime. Accurate header/routing info, non-deceptive subject, valid physical postal address of sender, functioning one-click opt-out honored within 10 business days. | Default-deny until campaign approval and physical address configured. | `Legal review required` |
  | **Unsolicited B2B Email** | Sole Trader / Individual | Same as corporate under federal law, but heightened state-level consumer opt-out protections apply. | Blocked until confirmed corporate subscriber. | `Restricted — evidence required` |
  | **Solicited Inbound Email** | Any | Transactional / solicited inquiry. | Permitted with explicit consent record. | `Permitted for verified scenario` |
  | **SMS / MMS** | Any | Prior Express Written Consent (PEWC) mandatory under TCPA. Severe statutory damages ($500–$1,500/violation). | Strictly Blocked. No cold SMS. | `Not approved for this channel` |
  | **Voice Calls / Robocalls**| Any | National DNC Registry, state DNC, TCPA autodialer restrictions. | Strictly Blocked. | `Not approved for this channel` |
  | **WhatsApp / Social DM** | Corporate | WhatsApp Business Messaging Policy forbids unsolicited promotional templates. Platform opt-in required. | Strictly Blocked without prior platform opt-in. | `Not approved for this channel` |

---

### 2. United Kingdom (GB)
- **Primary Statutes & Regulators:**
  - Information Commissioner’s Office (ICO)
  - Privacy and Electronic Communications Regulations (PECR, Regulation 22 & 23) — [ICO B2B Marketing Guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/)
  - UK General Data Protection Regulation (UK GDPR) & Data Protection Act 2018
- **Channel Analysis:**
  | Channel | Recipient Class | Legal Requirement | Technical Posture | Scoped Status |
  | :--- | :--- | :--- | :--- | :--- |
  | **Unsolicited B2B Email** | Corporate Subscriber (Ltd, PLC, LLP, Scottish Partnership) | PECR Reg 22 does **not** mandate prior opt-in for corporate subscribers. Legitimate Interests Assessment (LIA) required under UK GDPR Art 6(1)(f). Must identify sender, provide valid contact address, offer immediate opt-out. | Blocked until LIA documented and audience verified as corporate entity. | `Legal review required` |
  | **Unsolicited B2B Email** | Sole Trader / Partnership | Treated as **individual subscriber** under PECR. Prior opt-in consent mandatory unless strict soft opt-in applies. | Strictly Blocked for cold outreach. | `Restricted — evidence required` |
  | **Solicited Inbound Email** | Any | Responding to inquiry; Art 6(1)(b) performance of steps prior to contract. | Permitted. | `Permitted for verified scenario` |
  | **SMS / Phone Calls** | Any | Prior consent for SMS; TPS / CTPS screening mandatory for voice calls. | Strictly Blocked. | `Not approved for this channel` |
  | **WhatsApp** | Any | WhatsApp terms require prior opt-in; PECR rules apply. | Strictly Blocked. | `Not approved for this channel` |

---

### 3. Germany (DE)
- **Primary Statutes & Regulators:**
  - Section 7 of the Act Against Unfair Competition (Gesetz gegen den unlauteren Wettbewerb — UWG § 7) — [UWG § 7 Official Text](https://www.gesetze-im-internet.de/uwg_2004/BJNR141400004.html)
  - Federal Network Agency (Bundesnetzagentur) & Federal Data Protection Act (BDSG) / EU GDPR
- **Channel Analysis:**
  | Channel | Recipient Class | Legal Requirement | Technical Posture | Scoped Status |
  | :--- | :--- | :--- | :--- | :--- |
  | **Unsolicited B2B Email** | Any (Corporate or Individual) | UWG § 7(2) No. 3 explicitly defines cold electronic marketing as an unreasonable nuisance (*unzumutbare Belästigung*) without **prior express consent** (*ausdrückliche Einwilligung*). Presumed consent is not recognized for cold outreach. | **Strictly Blocked.** Default-deny enforced at DB. | `Restricted — evidence required` |
  | **Solicited Inbound Email** | Inbound Lead | Permitted: Double Opt-In (DOI) recommended to prove identity. | Permitted with documented inbound evidence. | `Permitted for verified scenario` |
  | **SMS / Voice / WhatsApp** | Any | Unsolicited calls and electronic messages prohibited without express prior consent. | Strictly Blocked. | `Not approved for this channel` |

---

### 4. France (FR)
- **Primary Statutes & Regulators:**
  - Commission Nationale de l'Informatique et des Libertés (CNIL)
  - French Postal and Electronic Communications Code (CPCE, Art. L. 34-5) — [CNIL Commercial Prospecting Rules](https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique-sms-mms-et-automate-dappel)
  - EU GDPR & French Data Protection Act
- **Channel Analysis:**
  | Channel | Recipient Class | Legal Requirement | Technical Posture | Scoped Status |
  | :--- | :--- | :--- | :--- | :--- |
  | **Unsolicited B2B Email** | Professional Address (e.g. name@company.fr) | CNIL exception: Prior consent is not required if the message is sent to a professional address AND the offer is directly relevant to the recipient's professional role/activity. Must provide clear opt-out. | High-risk; blocked until verified professional relevance and LIA documented. | `Legal review required` |
  | **Unsolicited B2B Email** | Generic Box (contact@company.fr) | Outside individual consent scope, but must respect opt-out. | Review required. | `Legal review required` |
  | **Unsolicited B2B Email** | Individual / Personal Email | Prior consent mandatory under Art. L. 34-5 CPCE. | Strictly Blocked. | `Restricted — evidence required` |
  | **SMS / Phone / WhatsApp** | Any | Prior consent for SMS; Bloctel check for calls. | Strictly Blocked. | `Not approved for this channel` |

---

### 5. Canada (CA)
- **Primary Statutes & Regulators:**
  - Canadian Radio-television and Telecommunications Commission (CRTC)
  - Canada’s Anti-Spam Legislation (CASL, S.C. 2010, c. 23) — [CRTC CASL Compliance Guide](https://crtc.gc.ca/eng/com500/guide.htm)
  - Office of the Privacy Commissioner of Canada (PIPEDA)
- **Channel Analysis:**
  | Channel | Recipient Class | Legal Requirement | Technical Posture | Scoped Status |
  | :--- | :--- | :--- | :--- | :--- |
  | **Unsolicited B2B Email** | Any Commercial Electronic Message (CEM) | Strict opt-in regime. Implied consent exists only under narrow conditions: conspicuous publication without non-solicitation statement (Section 10(9)) AND message directly relevant to recipient's business role; or existing business relationship (EBR) within 24 months. | Extremely high statutory liability ($10M CAD). Blocked by default. | `Restricted — evidence required` |
  | **Solicited Inbound Email** | Inbound Lead | Express consent given via form submission. Valid for 6 months or until revoked. | Permitted with form submission audit record. | `Permitted for verified scenario` |
  | **SMS / Messaging** | Any | Prior express consent required for CEM via SMS/MMS. | Strictly Blocked. | `Not approved for this channel` |

---

### 6. Australia (AU)
- **Primary Statutes & Regulators:**
  - Australian Communications and Media Authority (ACMA)
  - Spam Act 2003 (Cth) — [ACMA Anti-Spam Guidance](https://www.acma.gov.au/avoid-sending-spam)
  - Privacy Act 1988 (Cth) & Australian Privacy Principles (APPs)
- **Channel Analysis:**
  | Channel | Recipient Class | Legal Requirement | Technical Posture | Scoped Status |
  | :--- | :--- | :--- | :--- | :--- |
  | **Unsolicited B2B Email** | Corporate / Professional | Consent-based regime (Express or Inferred). Inferred consent via conspicuous publication requires the message to be directly relevant to their work role and no statement prohibiting unsolicited contact. Mandatory unsubscribe mechanism valid for 30 days. | Default-deny; requires proof of conspicuous publication and role-relevance. | `Legal review required` |
  | **Solicited Inbound Email** | Any | Express consent established by inbound inquiry. | Permitted with proof of request. | `Permitted for verified scenario` |
  | **SMS / Telemarketing** | Any | Express consent required for SMS. Do Not Call Register (DNCR) Act 2006 applies to telemarketing. | Strictly Blocked. | `Not approved for this channel` |

---

### 7. India (IN)
- **Primary Statutes & Regulators:**
  - Telecom Regulatory Authority of India (TRAI) — [TRAI Sender Advice](https://www.trai.gov.in/advice-to-senders)
  - Telecom Commercial Communications Customer Preference Regulations (TCCCPR 2018)
  - Digital Personal Data Protection Act 2023 (DPDP Act 2023)
  - Information Technology Act 2000 (Section 43A / 72A)
- **Channel Analysis:**
  | Channel | Recipient Class | Legal Requirement | Technical Posture | Scoped Status |
  | :--- | :--- | :--- | :--- | :--- |
  | **Unsolicited B2B Email** | Corporate Business | DPDP Act 2023 governs personal data processing; consent or "certain legitimate uses" required. TRAI regulations focus heavily on SMS/Voice, but commercial emails must have clear identity, no misrepresentation, and opt-out. | LIT home jurisdiction. Default review required until DPDP rules notified and internal basis established. | `Legal review required` |
  | **Solicited Inbound Email** | Any Inbound Lead | Explicit customer request under contract performance / service provision. | Permitted. | `Permitted for verified scenario` |
  | **SMS / Voice Calls** | Any | Mandatory registration with telecom operators on Distributed Ledger Technology (DLT) platform; scrubbing against National Customer Preference Register (NCPR). Unregistered commercial SMS strictly prohibited. | Strictly Blocked. LIT does not send telemarketing SMS. | `Not approved for this channel` |
  | **WhatsApp Business** | Any | Meta WhatsApp Business API requires user opt-in before business-initiated messages can be sent. | Blocked without verified WhatsApp opt-in. | `Not approved for this channel` |

---

### 8. United Arab Emirates (AE)
- **Primary Statutes & Regulators:**
  - Telecommunications and Digital Government Regulatory Authority (TDRA)
  - Cabinet Resolution No. 56 of 2024 (Regulation of Telemarketing Calls)
  - Federal Decree-Law No. 45 of 2021 on Personal Data Protection (UAE PDPL)
- **Channel Analysis:**
  | Channel | Recipient Class | Legal Requirement | Technical Posture | Scoped Status |
  | :--- | :--- | :--- | :--- | :--- |
  | **Unsolicited B2B Email** | Corporate Business | UAE PDPL mandates prior consent for processing personal data for marketing purposes unless statutory exemption applies. Clear commercial disclosures and unsubscribe mandatory. | Strict posture. Requires formal legal verification of corporate B2B exemptions. | `Legal review required` |
  | **Voice Calls (Cold Calling)**| Any | Cabinet Res. 56/2024 strictly prohibits telemarketing calls without prior licensed approval; calls permitted only 9 AM–6 PM local time; Do Not Call Register (DNCR) mandatory; cold calling on personal numbers strictly banned. | **Strictly Prohibited.** | `Not approved for this channel` |
  | **SMS / WhatsApp** | Any | TDRA registration and prior consent required. | Strictly Blocked. | `Not approved for this channel` |

---

### 9. Unlisted / All Other Jurisdictions
- **Default Posture:** `Restricted — evidence required` / Blocked.
- **Rule:** If a business has no ISO country code or is located outside the approved pilot jurisdictions, all outreach dispatches are rejected automatically by code and database triggers.
