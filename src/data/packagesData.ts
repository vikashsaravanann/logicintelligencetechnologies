export const packagesData = [
  {
    id: "digital-launch-pack",
    slug: "digital-launch-pack",
    title: "Digital Launch Pack",
    subtitle: "Everything You Need to Launch Your Business Online — Fast and Affordable",
    price: "Starting from ₹8,999",
    bestFor: "Small local businesses, Freelancers, Shops going online for the first time",
    inclusions: [
      { title: "Business or portfolio website (up to 5 pages)", desc: "We build your Home, About, Services, Portfolio, and Contact pages — all designed professionally with your brand colors and content." },
      { title: "Mobile responsive design", desc: "Your website will look perfect on iPhone, Android, tablet, and desktop — we test on all screen sizes before delivery." },
      { title: "Basic SEO setup", desc: "We set up your page titles, meta descriptions, and Google Search Console so your website can be found on Google." },
      { title: "Contact form integration", desc: "Visitors can send you messages directly from your website — delivered to your email instantly." },
      { title: "Google Maps embed", desc: "We embed your location on your website so customers can find you easily." },
      { title: "WhatsApp chat button", desc: "A floating WhatsApp button so customers can message you directly from your website." },
      { title: "1 month free support", desc: "After delivery, we fix any bugs or small changes within 1 month — completely free." },
      { title: "Domain + hosting setup assistance", desc: "We guide you step by step to buy your domain and set up hosting — we do it with you or for you." },
      { title: "SSL certificate setup", desc: "Your website will have HTTPS — the padlock that shows visitors your site is secure and trustworthy." },
      { title: "Delivery in 5–7 working days", desc: "You will have your live website within one week of providing us your content and photos." }
    ],
    whatYouNeed: [
      "Your business name and logo (or we design it)",
      "Photos of your business/products",
      "Your services list and descriptions",
      "Your contact details and location",
      "Color preference (we guide you if unsure)"
    ],
    paymentTerms: [
      "50% advance to begin work",
      "50% on final delivery before going live"
    ],
    timeline: [
      { day: "Day 1", desc: "You share content + we begin design" },
      { day: "Day 2–3", desc: "Homepage design shared for approval" },
      { day: "Day 4–5", desc: "All pages built" },
      { day: "Day 6", desc: "Review and revisions" },
      { day: "Day 7", desc: "Live! 🎉" }
    ]
  },
  {
    id: "business-pro-pack",
    slug: "business-pro-pack",
    title: "Business Pro Pack",
    subtitle: "Built to Generate Leads and Drive Serious Growth",
    price: "Starting from ₹18,999",
    bestFor: "Hotels, Travel Agencies, Restaurants, Growing Businesses",
    inclusions: [
      { title: "Everything in Digital Launch Pack", desc: "Plus all the premium features below." },
      { title: "Hotel OR Travel Agency Quotation System", desc: "Interactive modules to capture complex leads." },
      { title: "Admin panel for content updates", desc: "Easily update your website content yourself." },
      { title: "Blog section", desc: "Write articles to improve your SEO traffic." },
      { title: "Payment gateway", desc: "Accept payments via Razorpay (UPI, Netbanking, Cards)." },
      { title: "Advanced animations", desc: "Premium scroll and hover effects." },
      { title: "3 months support", desc: "Extended free support period." },
      { title: "2 rounds free revisions", desc: "Make sure it's absolutely perfect." },
      { title: "Up to 10 pages maximum", desc: "More room to explain your business." }
    ],
    whatYouNeed: [],
    paymentTerms: [
      "50% advance to begin work",
      "50% on final delivery before going live"
    ],
    timeline: []
  },
  {
    id: "enterprise-pack",
    slug: "enterprise-pack",
    title: "Enterprise Pack",
    subtitle: "Fully Custom Digital Platform for Large Scale Operations",
    price: "Custom Quote (starts from ₹50,000)",
    bestFor: "Large Enterprises, Custom Software Needs, Startups",
    inclusions: [
      { title: "Custom Scope Discussion", desc: "We build exactly what you need with no limitations." },
      { title: "Dedicated Project Manager", desc: "One point of contact for your entire project." },
      { title: "6 months support", desc: "Long term reliability and bug fixing." },
      { title: "Unlimited Pages & Revisions", desc: "Within reason based on initial scope." },
      { title: "Advanced Backend & Databases", desc: "Scalable architecture for massive traffic." }
    ],
    whatYouNeed: [],
    paymentTerms: ["Milestone based payments"],
    timeline: []
  }
];

export function getPackageVisual(slug: string): string {
  return `/images/packages/${slug}.svg`;
}
