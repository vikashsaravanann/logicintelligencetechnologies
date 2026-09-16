# Admin Button Audit

| Location | Button | Expected action | Route/API | Status |
|----------|--------|-----------------|-----------|--------|
| AdminNav | Command Center | Navigate | `/admin/command-center` | Implemented |
| AdminNav | Leads | Navigate | `/admin/leads` | Implemented |
| AdminNav | AI Leads | Navigate | `/admin/ai-leads` | Implemented |
| AdminNav | Bookings | Navigate | `/admin/bookings` | Implemented |
| AdminNav | Proposals | Navigate | `/admin/proposals` | Implemented |
| AdminNav | Support | Navigate | `/admin/support` | Implemented |
| AdminNav | Exit | Navigate | `/` | Implemented |
| Command Center | Draft Proposal | Navigate | `/admin/proposals/new` | Existing |
| Command Center | CRM Leads | Navigate | `/admin/leads` | Existing |
| Command Center | AI Leads | Navigate | `/admin/ai-leads` | Added |
| Command Center | Bookings | Navigate | `/admin/bookings` | Existing |
| Command Center | Proposals | Navigate | `/admin/proposals` | Existing |
| Command Center | Support | Navigate | `/admin/support` | Existing |
| Command Center | Create Invoice | API | `/api/admin/invoices` | Existing form |
| Command Center | Dispatch email | API | `/api/admin/send-trigger` | Session auth |
| New lead email | Open Admin Dashboard | Link | `/admin/command-center` | Fixed |
| New lead email | Open Leads | Link | `/admin/leads` | Fixed |

Browser tested: NOT VERIFIED in this session (no admin credentials).
