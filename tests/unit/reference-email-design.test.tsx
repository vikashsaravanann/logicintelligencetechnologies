import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import { render, toPlainText } from "@react-email/components";
import { REFERENCE_EMAIL_PREVIEWS } from "../../emails/reference-design/previews";
import { ReferenceButton, safeEmailUrl } from "../../emails/reference-design/components";
import { ReferenceStageApprovalEmail, ReferenceSupportReplyEmail } from "../../emails/reference-design/templates";

test("all ten reference emails render compact HTML and useful plain text", async () => {
  assert.equal(REFERENCE_EMAIL_PREVIEWS.length, 10);
  assert.equal(new Set(REFERENCE_EMAIL_PREVIEWS.map(x => x.key)).size, 10);
  for (const preview of REFERENCE_EMAIL_PREVIEWS) {
    const html = await render(preview.element);
    assert.match(html, /LOGIC INTELLIGENCE TECHNOLOGIES/);
    assert.match(html, /white-space:nowrap/);
    assert.match(html, /social-linkedin/);
    assert.match(html, /social-instagram/);
    assert.match(html, /social-x/);
    assert.match(html, /social-youtube/);
    assert.doesNotMatch(html, /headspace|lorem ipsum|javascript:/i);
    assert.ok(Buffer.byteLength(html) < 90_000, `${preview.key} HTML should remain below 90KB before provider wrapping`);
    assert.ok(toPlainText(html).includes("Logic Intelligence Technologies"));
    assert.ok(toPlainText(html).length > 200);
  }
});

test("email actions reject script, credential and control-character URLs", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,test", "http://example.com", "https://user:password@example.com", "https://example.com/\r\nheader"]) {
    assert.throws(() => safeEmailUrl(url));
  }
  assert.equal(safeEmailUrl("https://example.com/verify?token=one&next=two"), "https://example.com/verify?token=one&next=two");
});

test("dynamic CTA text and message bodies cannot inject HTML", async () => {
  const html = await render(<ReferenceButton href="https://example.com/review?a=1&b=2">{'Review <script>alert("x")</script>'}</ReferenceButton>);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /a=1&amp;b=2/);
  const reply = await render(<ReferenceSupportReplyEmail ticketReference="TEST-1" subject="Test" ticketUrl="https://example.com/ticket" replyMessage={'<img src=x onerror="alert(1)">'} />);
  assert.doesNotMatch(reply, /<img src=x/);
  assert.match(reply, /&lt;img/);
});

test("stage email does not invent a next stage or claim unconfirmed attachments", async () => {
  const html = await render(<ReferenceStageApprovalEmail approvedStageOrdinal={13} approvedStageTitle="Support setup" documents={[{ filename: "support-agreement.pdf" }]} />);
  const text = toPlainText(html);
  assert.doesNotMatch(text, /Stage 14|Documents attached|unlocked/i);
  assert.match(text, /support-agreement.pdf/);
  const withAttachments = await render(<ReferenceStageApprovalEmail approvedStageOrdinal={5} approvedStageTitle="Statement of Work" documents={[{ filename: "sow.pdf" }]} documentsAttached />);
  assert.match(toPlainText(withAttachments), /Documents attached to this email/);
});
