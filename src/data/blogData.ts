export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string; // 1-2 sentences shown on the blog list page
  category: string;
  publishedAt: string; // "2026-08-28"
  readingTime: string; // "5 min read"
  image: string;
  author: {
    name: string;
    role: string;
  };
  // Body is an array of simple content blocks so we don't need a markdown
  // parser dependency — add paragraphs, headings, and lists as plain objects.
  body: (
    | { type: "paragraph"; text: string }
    | { type: "heading"; text: string }
    | { type: "list"; items: string[] }
  )[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-much-should-a-business-website-cost-in-india-2026",
    title: "How Much Should a Business Website Cost in India in 2026?",
    excerpt:
      "A plain breakdown of what actually drives website pricing — so you know what you're paying for before you get a quote.",
    category: "Guides",
    publishedAt: "2026-08-28",
    readingTime: "6 min read",
    image: "/images/blog/website-pricing-breakdown.svg",
    author: {
      name: "Vikash Saravanan",
      role: "Founder & Lead Architect",
    },
    body: [
      {
        type: "paragraph",
        text: "If you've asked three different agencies for a quote, you've probably gotten three very different numbers — anywhere from ₹15,000 to ₹5,00,000+. That range isn't agencies padding their prices; it reflects genuinely different products. Here's what actually separates a ₹20,000 website from a ₹2,00,000 one, so you can tell what you're really paying for before you sign anything.",
      },
      { type: "heading", text: "The three broad price bands" },
      {
        type: "list",
        items: [
          "₹15,000 – ₹50,000: A brochure-style site — home, about, services, contact. Good for establishing credibility when someone Googles you. No custom functionality beyond a contact form.",
          "₹50,000 – ₹2,00,000: Business sites with real functionality — booking systems, payment integration, a blog, an admin panel so you can update content yourself without calling the developer every time.",
          "₹2,00,000+: Custom web applications — think a full ordering platform, a client portal, or a SaaS product. This is software development, not just a website.",
        ],
      },
      { type: "heading", text: "What actually drives the cost" },
      {
        type: "list",
        items: [
          "Number of unique page designs — not total pages. A blog with one template and 50 posts costs the same to build as one with 3 posts. What's expensive is unique layouts.",
          "Custom functionality — booking systems, payment gateways, multi-user dashboards, and third-party integrations (CRM, WhatsApp, SMS) each add real development time.",
          "Content readiness — if you don't have copy, photos, or a logo ready, expect extra time and cost for content creation, not just building.",
          "Ongoing maintenance — a one-time build is cheaper upfront than a retainer, but if your site needs regular updates, factor in monthly maintenance from the start rather than as a surprise later.",
        ],
      },
      { type: "heading", text: "The question that matters more than the price" },
      {
        type: "paragraph",
        text: "Before comparing quotes, ask what happens after launch. A cheap site with no support plan often costs more in the long run — every small change becomes a new invoice, and if the developer disappears, you're stuck. Ask specifically: who owns the code, where is it hosted, and what does a content update cost six months from now?",
      },
      {
        type: "paragraph",
        text: "If you want a straight answer on what your specific project would actually cost, we'll give you a real number after a short conversation — no inflated \"starting from\" pricing designed to get you on a call.",
      },
    ],
  },
  {
    slug: "saas-vs-custom-software-which-does-your-business-need",
    title: "SaaS vs Custom Software: Which Does Your Business Actually Need?",
    excerpt:
      "The honest trade-offs between buying an off-the-shelf tool and building something custom for your business.",
    category: "Guides",
    publishedAt: "2026-08-28",
    readingTime: "5 min read",
    image: "/images/blog/saas-vs-custom-software.svg",
    author: {
      name: "Vikash Saravanan",
      role: "Founder & Lead Architect",
    },
    body: [
      {
        type: "paragraph",
        text: "Every SaaS tool's landing page will tell you it's the answer to everything, and every custom-software agency will tell you off-the-shelf tools can't handle your business. Neither is fully honest. Here's the actual test: it comes down to whether your workflow is genuinely different from everyone else's, or whether you just think it is.",
      },
      { type: "heading", text: "When SaaS wins" },
      {
        type: "list",
        items: [
          "Your process is standard — invoicing, basic CRM, email marketing, project tracking. Thousands of businesses need exactly this; someone has already built and refined it.",
          "You need it running this week, not in three months.",
          "Your budget is monthly and small, not a large one-time spend.",
          "You don't have in-house technical people to maintain something custom.",
        ],
      },
      { type: "heading", text: "When custom software is worth it" },
      {
        type: "list",
        items: [
          "Your workflow actually is different — a booking system that needs to handle multi-location scheduling with rules no generic tool supports.",
          "You're stitching together 4-5 different SaaS tools with manual work in between, and that manual work is costing real hours every week.",
          "The tool is core to your competitive advantage, not just internal admin — customers interact with it directly.",
          "You've outgrown the per-seat or per-transaction pricing of SaaS tools and it's now cheaper to own the software outright.",
        ],
      },
      { type: "heading", text: "The honest middle ground" },
      {
        type: "paragraph",
        text: "Most businesses don't need to choose one path forever. It's common to start on SaaS tools to validate a process cheaply, then move to custom software once you know exactly what you need and the SaaS costs or limitations start to hurt. Building custom on day one, before you've proven the workflow, is often the more expensive mistake.",
      },
      {
        type: "paragraph",
        text: "If you're not sure which side of this line your business is on, that's a conversation worth having before you commit budget either way — tell us what you're trying to solve and we'll give you a straight answer, even if that answer is \"you don't need us yet.\"",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
