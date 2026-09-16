export const DEFAULT_OUTREACH_STEPS = [
  {
    delay_days: 0,
    subject: "Thank you for reaching out \u2014 Logic Intelligence Technologies",
    body_html: `<p>Hello{{firstNameBlock}},</p>
<p>Thank you for contacting Logic Intelligence Technologies. We received your enquiry and will review it carefully.</p>
<p>If you would like to schedule a discovery conversation, you can book a consultation on our website.</p>
<p>Best regards,<br/>Logic Intelligence Technologies<br/><a href="https://www.logicintelligencetechnologies.in">logicintelligencetechnologies.in</a></p>`,
  },
  {
    delay_days: 3,
    subject: "Following up on your enquiry",
    body_html: `<p>Hello{{firstNameBlock}},</p>
<p>I wanted to follow up on your recent enquiry with Logic Intelligence Technologies. Happy to answer questions about architecture, delivery approach, or next steps.</p>
<p>Reply to this email or book a consultation when convenient.</p>
<p>Best regards,<br/>Logic Intelligence Technologies</p>`,
  },
  {
    delay_days: 7,
    subject: "Resources and a short discovery call",
    body_html: `<p>Hello{{firstNameBlock}},</p>
<p>Sharing a brief note in case it helps: our team builds production web applications and AI systems for businesses that need reliable engineering.</p>
<p>You can explore our work and book a discovery call at <a href="https://www.logicintelligencetechnologies.in/book-consultation">logicintelligencetechnologies.in/book-consultation</a>.</p>
<p>Best regards,<br/>Logic Intelligence Technologies</p>`,
  },
  {
    delay_days: 14,
    subject: "Closing the loop",
    body_html: `<p>Hello{{firstNameBlock}},</p>
<p>I will close the loop on this thread for now. If your priorities change, reply anytime \u2014 we are glad to help.</p>
<p>Best regards,<br/>Logic Intelligence Technologies</p>`,
  },
];
