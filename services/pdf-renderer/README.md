# LIT PDF Renderer

The LIT document system: the seven approved master templates and the ReportLab
generator that produces them, blank or filled for one client.

This directory is the **authoritative, version-controlled source** for the LIT
master documents. The original approved designs were supplied by the founder;
they are preserved here unchanged so document generation reproduces them exactly
rather than inventing a new design.

```
generator/   ReportLab generator (build_templates.py + docsys.py + helpers.py),
             fonts (Poppins, Lora), logos, data/example_client.json, data/FIELDS.md
masters/     the 7 approved blank master PDFs + SHA256SUMS.txt (fidelity baseline)
```

## The seven documents

| # | Document | Function |
|---|----------|----------|
| 01 | Statement of Work & Service Agreement | `sow()` |
| 02 | Project Proposal & Commercial Quotation | `proposal()` |
| 03 | Client Onboarding & Access Guide | `onboarding()` |
| 04 | Project Scope & Technical Specification | `techspec()` |
| 05 | Project Delivery & Acceptance Report | `delivery()` |
| 06 | Change Request / Additional Work Order | `change_request()` |
| 07 | Maintenance & Support Agreement | `support()` |

## Generating documents (local)

```bash
cd generator
pip install -r requirements.txt
python build_templates.py                                 # blank templates → output/
python build_templates.py --data data/example_client.json # filled for a client
python build_templates.py --list                          # list every fillable field
```

Placeholders are written in `build_templates.py` as text in `[square brackets]`.
A client data file has a `common` block (applied to all 7 documents) and
per-document blocks (`"01"`…`"07"`) that override it; `Key#2` targets the 2nd
occurrence. Missing keys stay blank. See `generator/README.md` and
`generator/data/FIELDS.md`.

Note: the Poppins font has no `→` or `●` glyphs — keep those out of added text.

## Production use (Command Center)

The Command Center drives this generator through an HTTP wrapper (added in the
document-engine batch): the corporate server POSTs a validated, typed client
data object over an authenticated, isolated boundary; the service returns the
PDF bytes; the server hashes (SHA-256), versions and stores it privately. The
service never has database or network access of its own.

Legal and commercial clauses in these templates are a starting framework and
must be reviewed by qualified counsel before anything is issued or signed.
