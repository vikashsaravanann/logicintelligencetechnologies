# LIT PDF Generator — Client Onboarding Engine

Generates the 7 Logic Intelligence Technologies master documents as PDFs, either
**blank** (fill-in templates) or **filled** with one client's details from a JSON file.

| # | Document | Function in `build_templates.py` |
|---|----------|-----------------------------------|
| 01 | Statement of Work & Service Agreement | `sow()` |
| 02 | Project Proposal & Commercial Quotation | `proposal()` |
| 03 | Client Onboarding & Access Guide | `onboarding()` |
| 04 | Project Scope & Technical Specification | `techspec()` |
| 05 | Project Delivery & Acceptance Report | `delivery()` |
| 06 | Change Request / Additional Work Order | `change_request()` |
| 07 | Maintenance & Support Agreement | `support()` |

---

## 1. Setup (one time)

Requires Python 3.9+.

```bash
cd LIT-PDF-Generator
pip install -r requirements.txt
```

## 2. Build blank templates

```bash
python build_templates.py
```
PDFs are written to `output/`. Every placeholder is printed as an empty field
(blank table cell, underline, or ruled writing lines).

## 3. Build documents for a client

1. Copy `data/example_client.json` to e.g. `data/clients/acme.json`.
2. Change the values.
3. Run:

```bash
python build_templates.py --data data/clients/acme.json --out output/acme
```

The client name is added to the file names, e.g.
`LIT-01-SOW-Service-Agreement-Acme-Retail-Pvt-Ltd.pdf`.

Build only some documents:
```bash
python build_templates.py --data data/clients/acme.json --only 1 2
```

### How the client JSON works

```json
{
  "common": { "Client Company": "Acme Retail Pvt. Ltd.", "Project Name": "Acme Portal" },
  "01":     { "₹ / $#1": "₹ 1,20,000", "Description#4": "Portal frontend and APIs" },
  "02":     { "Executive Summary": "..." }
}
```

* **`common`** — used by all 7 documents.
* **`"01"` … `"07"`** — used only by that document; overrides `common`.
* **`"Name"`** — fills *every* `[Name]` placeholder in the document.
* **`"Name#3"`** — fills only the **3rd** `[Name]` in that document (useful for table
  rows that share a placeholder such as `[Date]`, `[Description]`, `[₹ / $]`).
* Any key you leave out (or leave as `""`) stays **blank**.
* `"Client Company"` automatically fills `[CLIENT COMPANY]` (signature box titles) in capitals.

### Finding the exact key names

```bash
python build_templates.py --list
```
writes `data/FIELDS.md`: every fillable field, per document, in page order, with the
section it belongs to and its `#number`. Example:

```
| 13 Commercial Terms | `Description#4` |
| 13 Commercial Terms | `₹ / $#1` |
```

Long paragraph placeholders have short names: `Project Summary`, `Executive Summary`,
`Client Challenge`, `Proposed Solution`, `Technical Summary`, `Delivery Summary`,
`Original Scope`, `Requested Change`, `Change Reason`.

Status / priority cells (`[Status]`, `[Priority]`) show as coloured chips when filled with
`PASS`, `FAIL`, `PENDING`, `N/A`, `MUST`, `SHOULD`, `COULD`, `OPEN`.

---

## 4. Changing the documents

All wording lives in **`build_templates.py`**, one function per document. It reads like the
document itself:

```python
d.h1(13, "Commercial Terms")                      # numbered section heading
d.p("Normal paragraph text. [Placeholder] inline.") # paragraph
d.bullets(["Point one", "[Placeholder point]"])     # bullet list
d.clauses([("16.1", "Clause text"), ...])           # numbered legal clauses
d.table(["Item", "Amount"], [["Core", "[₹ / $]"]], [0.7, 0.3])  # table: headers, rows, column widths (sum = 1)
d.kv([["Field", "[Value]"]])                        # 2-column field/value table
d.callout("Title", "Text", tone="navy")             # boxed note: navy / note / mist
d.steps([("Step", "Description"), ...])             # numbered horizontal process
d.checklist(["Item 1", "Item 2"], cols=2)           # tick boxes
d.signatures()                                      # two signature boxes
d.arch()                                            # architecture diagram
d.gantt([("Phase", start_week, length)], weeks=10)  # timeline grid
d.contact()                                         # LIT contact strip
d.new_page()                                        # force a page break
```

**Placeholders:** write any text in square brackets, e.g. `"[Client GSTIN]"`. It is printed
blank unless the JSON gives it a value. Pages break automatically; page numbers and the
contents list are calculated for you.

**Add a section:** add a `d.h1(...)` + content inside the function, and add the title to
that document's section list (`SOW_SECTIONS`, `PROP_SECTIONS`, `ONB`, `TS`, `DR`, `SUP`)
so it appears in the contents.

**Add a new document type:** write a new function `def mydoc(d): ...` (start with
`d.cover(...)`, optionally `d.control_page(...)`, then `d.new_page()` and content) and add a
line to the `DOCS` list at the bottom of `build_templates.py`.

---

## 5. Design and branding

| What | Where |
|------|-------|
| Colours (NAVY, GOLD, CYAN …), company name, email, phone, website | `helpers.py` (top) |
| Legal name, page header (round logo + name), footer, cover page layout | `docsys.py` → `COMPANY`, `LEGAL_NAME`, `Doc.header()`, `Doc.footer()`, `Doc.cover()` |
| Margins and spacing | `helpers.py` → `ML`, `MR`; `docsys.py` → `BODY_TOP`, `BODY_BOT`, `GAP`, `SGAP` |
| Fonts (Poppins, Lora) | `fonts/` — registered in `helpers.reg_fonts()` |
| Round logo | `assets/lit_logo_circle.png` (re-create with `python make_logo.py [image]`) |

> Note: Poppins has no `→` or `●` characters — avoid them in text.

---

## 6. Files

```
LIT-PDF-Generator/
├── build_templates.py   # content of the 7 documents + command line
├── docsys.py            # document engine: pages, header/footer, tables, fill-in logic
├── helpers.py           # colours, fonts, low-level drawing helpers
├── make_logo.py         # turns the full logo into the round page logo
├── requirements.txt
├── assets/
│   ├── lit_logo_full.png    # original logo
│   └── lit_logo_circle.png  # round logo used on every page
├── fonts/               # Poppins + Lora (SIL Open Font License)
├── data/
│   ├── example_client.json  # sample client data
│   └── FIELDS.md            # all fillable keys (regenerate with --list)
└── output/              # generated PDFs
```

Legal and commercial clauses are a starting framework. Have qualified counsel review them
for your jurisdiction before relying on them.
