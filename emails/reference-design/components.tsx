import * as React from "react";
import { Body, Container, Font, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import { REFERENCE_EMAIL as R } from "./theme";

type Tone = "light" | "orange" | "dark" | "sky";
type Art = "verification" | "welcome" | "campaign" | "night" | "onboarding" | "workspace" | "milestone" | "payment" | "support" | "maintenance";
const bgFor = (tone: Tone) => tone === "orange" ? R.colors.orangeHero : tone === "dark" ? R.colors.navy : tone === "sky" ? R.colors.sky : R.colors.white;

/** HTML attributes are escaped before insertion into Outlook's conditional VML. */
const escapeAttribute = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;");

export function safeEmailUrl(value: string): string {
  if (/[\r\n\u0000-\u001f]/.test(value)) throw new Error("Invalid email action URL");
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("Email actions require an absolute HTTPS URL without credentials");
  return url.href;
}

export function ReferenceFrame({ preview, tone = "light", unsubscribeUrl, children }: {
  preview: string; tone?: Tone; unsubscribeUrl?: string; children: React.ReactNode;
}) {
  const dark = tone === "dark";
  const headerBg = tone === "orange" || dark ? bgFor(tone) : R.colors.white;
  return <Html lang="en"><Head>
    <meta name="color-scheme" content={dark ? "dark" : "light"} />
    <meta name="supported-color-schemes" content={dark ? "dark" : "light"} />
    {([400, 600, 700, 800] as const).map(weight => <Font key={weight} fontFamily="Nunito Sans" fallbackFontFamily="Arial" webFont={{ url: `${R.assetUrl}/nunito-sans-latin.woff2`, format: "woff2" }} fontWeight={weight} fontStyle="normal" />)}
    <style>{`body,table,td,a,p,h1,h2{font-family:${R.font};}a{color:inherit;} .ref-cta{transition:none;} @media only screen and (max-width:620px){.ref-canvas{padding:0!important;}.ref-wordmark{font-size:11px!important;letter-spacing:.025em!important;}.ref-brand{padding:30px 18px 24px!important;}.ref-heading{font-size:32px!important;line-height:37px!important;}.ref-section{padding-left:24px!important;padding-right:24px!important;}.ref-footer{padding:42px 22px 32px!important;}.ref-body-text{font-size:15px!important;line-height:25px!important;}.ref-hero{padding-left:22px!important;padding-right:22px!important;}.ref-cta{max-width:100%!important;box-sizing:border-box!important;}.ref-label{width:37%!important;}.ref-detail-value{overflow-wrap:anywhere!important;}.ref-full-art{width:100%!important;height:auto!important;}} @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;}}`}</style>
  </Head><Preview>{preview}</Preview><Body className="ref-canvas" style={{ margin: 0, padding: "32px 12px", backgroundColor: R.colors.canvas, fontFamily: R.font, color: R.colors.ink }}>
    <Container style={{ width: "100%", maxWidth: 600, margin: "0 auto", backgroundColor: dark ? R.colors.navy : R.colors.white }}>
      <Section className="ref-brand" style={{ padding: "36px 24px 28px", textAlign: "center", backgroundColor: headerBg }}>
        <Img src={R.logoUrl} alt="Logic Intelligence Technologies company logo" width="78" height="78" style={{ display: "block", margin: "0 auto 14px", borderRadius: "50%", border: "0", width: 78, height: 78 }} />
        <Text className="ref-wordmark" style={{ margin: 0, fontFamily: R.font, fontSize: 14, lineHeight: "20px", fontWeight: 800, letterSpacing: ".045em", whiteSpace: "nowrap", textAlign: "center", color: dark || tone === "orange" ? "#FFFFFF" : R.colors.ink }}>{R.wordmark}</Text>
      </Section>
      {children}
      <ReferenceFooter dark={dark} unsubscribeUrl={unsubscribeUrl} />
    </Container>
  </Body></Html>;
}

export function ReferenceHero({ title, eyebrow, image, tone = "light", compact = false }: { title: string; eyebrow?: string; image?: Art; tone?: Tone; compact?: boolean }) {
  const effectiveTone = compact ? "light" : tone;
  const inverse = effectiveTone !== "light";
  const artFirst = effectiveTone === "light";
  const artwork = image ? <Img src={`${R.assetUrl}/${image}.png`} alt="" width={compact ? "280" : "600"} style={{ display: "block", width: compact ? "70%" : "100%", maxWidth: compact ? 280 : 600, height: "auto", margin: compact ? "4px auto 30px" : "24px auto 0", borderRadius: compact ? 5 : 0 }} /> : null;
  return <Section style={{ backgroundColor: bgFor(effectiveTone), paddingBottom: inverse ? 0 : 4 }}>
    {artFirst ? artwork : null}
    <Section className="ref-hero" style={{ padding: "12px 38px 0", textAlign: "center" }}>
      {eyebrow ? <Text style={{ margin: "0 0 13px", fontSize: 10, lineHeight: "16px", fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase", color: inverse ? "#EEE6FF" : R.colors.muted }}>{eyebrow}</Text> : null}
      <Heading as="h1" className="ref-heading" style={{ margin: "0 auto 16px", maxWidth: compact ? 380 : 480, fontFamily: R.font, color: inverse ? "#FFFFFF" : R.colors.ink, fontSize: 40, lineHeight: "45px", fontWeight: 800, letterSpacing: "-.035em", textAlign: "center" }}>{title}</Heading>
    </Section>
    {!artFirst ? artwork : null}
  </Section>;
}

export function ReferenceSection({ children, cream = false }: { children: React.ReactNode; cream?: boolean }) {
  return <Section className="ref-section" style={{ padding: "20px 46px 8px", backgroundColor: cream ? R.colors.cream : undefined }}>{children}</Section>;
}

export function ReferenceText({ children, muted = false, align = "center", dark = false }: { children: React.ReactNode; muted?: boolean; align?: "center" | "left"; dark?: boolean }) {
  return <Text className="ref-body-text" style={{ color: dark ? (muted ? "#CBC4DC" : "#F4F0FC") : muted ? R.colors.muted : R.colors.body, margin: "0 0 19px", fontSize: muted ? 13 : 16, lineHeight: muted ? "22px" : "28px", fontWeight: 400, textAlign: align, overflowWrap: "anywhere" }}>{children}</Text>;
}

/** Fixed-height VML roundrect for Outlook; normal clients receive the real HTML anchor. */
export function ReferenceButton({ href, children, variant = "orange" }: { href: string; children: string; variant?: "orange" | "blue" | "charcoal" | "purple" }) {
  const url = escapeAttribute(safeEmailUrl(href));
  const label = escapeAttribute(children);
  const color = variant === "blue" ? R.colors.blue : variant === "charcoal" ? R.colors.charcoal : variant === "purple" ? R.colors.purple : R.colors.orange;
  const width = Math.min(310, Math.max(200, children.length * 8 + 52));
  const html = `<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:50px;v-text-anchor:middle;width:${width}px;" arcsize="100%" strokecolor="${color}" fillcolor="${color}"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${label}</center></v:roundrect><![endif]--><!--[if !mso]><!--><a class="ref-cta" href="${url}" style="display:inline-block;background-color:${color};border-radius:999px;color:#ffffff;font-family:${R.font.replace(/'/g, "&quot;")};font-size:15px;font-weight:800;line-height:22px;text-align:center;text-decoration:none;padding:14px 30px;max-width:100%;box-sizing:border-box;mso-hide:all;">${label}</a><!--<![endif]-->`;
  return <Section style={{ textAlign: "center", margin: "28px 0 30px" }}><div dangerouslySetInnerHTML={{ __html: html }} /></Section>;
}

export function ReferenceDetails({ rows }: { rows: Array<{ label: string; value: React.ReactNode }> }) {
  if (!rows.length) return null;
  return <Section style={{ margin: "14px 0 22px", backgroundColor: R.colors.cream, borderRadius: 12, padding: "8px 18px" }}><table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse", tableLayout: "fixed" }}><tbody>{rows.map((row, index) => <tr key={index}>
    <td className="ref-label" width="38%" style={{ padding: "11px 10px 11px 0", borderBottom: index < rows.length - 1 ? `1px solid ${R.colors.divider}` : undefined, fontSize: 12, lineHeight: "20px", color: R.colors.muted, verticalAlign: "top", fontFamily: R.font }}>{row.label}</td>
    <td className="ref-detail-value" style={{ padding: "11px 0", borderBottom: index < rows.length - 1 ? `1px solid ${R.colors.divider}` : undefined, fontSize: 13, lineHeight: "20px", color: R.colors.ink, fontWeight: 700, verticalAlign: "top", wordBreak: "break-word", overflowWrap: "anywhere", fontFamily: R.font }}>{row.value}</td>
  </tr>)}</tbody></table></Section>;
}

export function ReferenceDocumentList({ documents, attached = false }: { documents: Array<{ filename: string; url?: string }>; attached?: boolean }) {
  if (!documents.length) return null;
  return <Section style={{ margin: "20px 0" }}><Text style={{ fontSize: 12, fontWeight: 800, color: R.colors.ink, margin: "0 0 10px", textAlign: "left" }}>{attached ? "Documents attached to this email" : "Project documents"}</Text>{documents.map((doc, index) => <Text key={index} style={{ fontSize: 13, lineHeight: "22px", margin: "6px 0", color: R.colors.body, overflowWrap: "anywhere" }}>{doc.url ? <Link href={safeEmailUrl(doc.url)} style={{ color: R.colors.blue, textDecoration: "underline" }}>{doc.filename}</Link> : doc.filename}</Text>)}</Section>;
}

function ReferenceFooter({ dark, unsubscribeUrl }: { dark: boolean; unsubscribeUrl?: string }) {
  const ink = dark ? "#F4F0FC" : R.colors.body;
  const muted = dark ? "#CBC4DC" : R.colors.muted;
  return <Section className="ref-footer" style={{ padding: "48px 38px 34px", textAlign: "center", backgroundColor: dark ? R.colors.navy : R.colors.white }}>
    <Text style={{ margin: "0 auto 25px", fontSize: 12, lineHeight: "20px", color: ink, maxWidth: 420 }}>Questions? We’re here to help. Visit our <Link href={`${R.siteUrl}/support`} style={{ color: dark ? "#FFD865" : "#C2500A", fontWeight: 800, textDecoration: "none" }}>support page</Link> or email <Link href={`mailto:${R.supportEmail}`} style={{ color: dark ? "#FFD865" : "#C2500A", fontWeight: 800, textDecoration: "none", overflowWrap: "anywhere" }}>{R.supportEmail}</Link>.</Text>
    <Hr style={{ width: 160, margin: "0 auto 20px", border: "none", borderTop: `1px solid ${dark ? "#51476D" : R.colors.divider}` }} />
    <table role="presentation" cellPadding="0" cellSpacing="0" align="center" style={{ margin: "0 auto 22px" }}><tbody><tr>{R.socials.map(social => <td key={social.name} style={{ padding: "0 12px" }}><Link href={social.href} aria-label={social.name}><Img src={`${R.assetUrl}/social-${social.icon}${dark ? "-light" : ""}.png`} width="19" height="19" alt={social.name} style={{ display: "block", border: 0 }} /></Link></td>)}</tr></tbody></table>
    <Text style={{ margin: "0 0 23px", fontSize: 11, lineHeight: "22px", color: muted }}><Link href={R.siteUrl} style={{ color: ink, textDecoration: "none" }}>Our website</Link>{"  ·  "}<Link href={`${R.siteUrl}/login`} style={{ color: ink, textDecoration: "none" }}>My account</Link>{"  ·  "}<Link href={`${R.siteUrl}/terms`} style={{ color: ink, textDecoration: "none" }}>Terms</Link>{"  ·  "}<Link href={`${R.siteUrl}/privacy`} style={{ color: ink, textDecoration: "none" }}>Privacy</Link></Text>
    {unsubscribeUrl ? <Text style={{ margin: "0 0 15px", color: muted, fontSize: 11, lineHeight: "18px" }}>You’re receiving company news and updates. <Link href={safeEmailUrl(unsubscribeUrl)} style={{ color: ink, textDecoration: "underline" }}>Manage preferences or unsubscribe</Link>.</Text> : null}
    <Text style={{ margin: "0 0 4px", fontSize: 10, lineHeight: "17px", color: muted }}>{R.company}<br />{R.address}<br />MSME / Udyam: {R.registration}</Text>
    <Text style={{ margin: "10px 0 0", fontSize: 10, lineHeight: "17px", color: muted }}>© {new Date().getFullYear()} {R.company}.<br />All rights reserved.</Text>
  </Section>;
}
