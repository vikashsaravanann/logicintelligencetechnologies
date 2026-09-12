# Email deliverability

Provider: Zoho Mail for `@logicintelligencetechnologies.in`.

## DNS

Do **not** copy invented SPF/DKIM values. Copy the records Zoho shows in its control panel.

| Record | Status | Manual action |
| ------ | ------ | ------------- |
| MX | Requires DNS configuration | Zoho MX for the domain |
| SPF | Requires DNS configuration | Include Zoho’s SPF mechanism |
| DKIM | Requires DNS configuration | Zoho-generated selector |
| DMARC | Requires DNS configuration | Start at `p=none` then tighten |
| BIMI | Requires company verification | See `docs/bimi-dns.md` — SVG + VMC not verified here |
| Return-path | Requires provider configuration | Zoho bounce address |

This environment cannot query production DNS or Zoho. **Unable to verify automatically — manual verification required.**

## List-Unsubscribe

Marketing and newsletter confirmation messages add:

```
List-Unsubscribe: <https://www.logicintelligencetechnologies.in/api/unsubscribe?token=…>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

Human confirmation page: `/unsubscribe`.

## BIMI / inbox avatar

HTML cannot set the Gmail sender face. That is the Zoho mailbox photo plus BIMI DNS.

## Sending limits

Respect Zoho mailbox daily limits. Cron batches are capped (weekly recognition: 20). There is no bulk campaign engine.
