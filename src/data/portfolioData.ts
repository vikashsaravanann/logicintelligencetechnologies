export type PortfolioProject = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
  externalUrl?: string;
  results?: string;
  client?: string;
  problem?: string;
  solution?: string;
  metrics?: { label: string; value: string }[];
  testimonialId?: string;
};

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "freshbite",
    title: "FreshBite — Restaurant Ordering Platform",
    description:
      "Full-stack food ordering with real-time order tracking, secure payments, and a multi-location admin dashboard for restaurant operators.",
    category: "E-Commerce",
    tags: ["Next.js", "Stripe", "Supabase", "Tailwind CSS"],
    image: "/portfolio/freshbite.jpg",
    client: "FreshBite Restaurants",
    problem:
      "Phone and WhatsApp orders were error-prone during peak hours. Staff juggled handwritten tickets, payment confirmation lagged, and kitchen throughput stalled when volume spiked.",
    solution:
      "We shipped a customer-facing ordering web app with cart, location-aware menus, Stripe checkout, and live order status. Operators manage outlets, menus, and fulfillment from a single admin console backed by Supabase realtime.",
    metrics: [
      { label: "Order capture", value: "Phone → digital in 1 sprint" },
      { label: "Payment", value: "Card + UPI via Stripe" },
      { label: "Ops", value: "Multi-outlet dashboard" },
    ],
    results:
      "Digitized ordering for a multi-outlet kitchen with live status for guests and a unified ops view for managers.",
  },
  {
    slug: "vaulthr",
    title: "VaultHR — HR Management Suite",
    description:
      "Cloud HR platform covering onboarding, leave, attendance, and payroll workflows for growing teams that outgrew spreadsheets.",
    category: "SaaS",
    tags: ["React", "Node.js", "PostgreSQL", "AWS"],
    image: "/portfolio/vaulthr.jpg",
    client: "Mid-market services firm",
    problem:
      "HR data lived in disconnected sheets. Leave requests stalled in email threads, onboarding checklists were incomplete, and payroll prep consumed days each cycle.",
    solution:
      "Role-based HR workspace with employee profiles, approval workflows, leave balances, and export-ready payroll inputs. Built on React + Node with PostgreSQL on AWS for predictable access control and auditability.",
    metrics: [
      { label: "Leave cycle", value: "Days → hours" },
      { label: "Source of truth", value: "Single employee record" },
      { label: "Access", value: "RBAC by role" },
    ],
    results:
      "Centralized people operations with clear approvals and fewer payroll reconciliation errors.",
  },
  {
    slug: "luxe-interiors",
    title: "Luxe Interiors — Design Studio Portfolio",
    description:
      "High-conversion portfolio for an interior design studio: project storytelling, image-led galleries, and a structured inquiry path for qualified leads.",
    category: "Corporate",
    tags: ["Next.js", "Framer Motion", "Vercel"],
    image: "/portfolio/luxe.jpg",
    client: "Luxe Interiors Studio",
    problem:
      "The previous site buried strong project photography behind slow pages and a generic contact form. Serious clients could not quickly assess fit or start a project conversation.",
    solution:
      "A performance-focused Next.js site with case-style project pages, motion used sparingly for hierarchy, and a guided inquiry form that captures budget, space type, and timeline for the studio team.",
    metrics: [
      { label: "Storytelling", value: "Project-first layout" },
      { label: "Leads", value: "Structured brief form" },
      { label: "Deploy", value: "Vercel edge delivery" },
    ],
    results:
      "A portfolio that presents the studio as premium and routes qualified inquiries with context the designers can act on.",
  },
  {
    slug: "mediconnect",
    title: "MediConnect — Clinic Booking System",
    description:
      "Appointment scheduling, patient-facing booking, and automated reminders designed for clinics that still relied on phone-only booking.",
    category: "Web App",
    tags: ["Next.js", "Supabase", "Twilio", "Tailwind CSS"],
    image: "/portfolio/mediconnect.jpg",
    client: "Multi-doctor clinic group",
    problem:
      "Front desk was overwhelmed by inbound calls. No-shows were high because reminders were manual, and doctors could not see a reliable day view of the schedule.",
    solution:
      "Patient booking portal with specialty and doctor filters, admin calendar, and Twilio SMS/WhatsApp reminders. Supabase powers auth, scheduling tables, and row-level access for clinic staff.",
    metrics: [
      { label: "Booking", value: "Self-serve online" },
      { label: "Reminders", value: "Automated SMS" },
      { label: "No-shows", value: "Reduced with nudges" },
    ],
    results:
      "Fewer missed appointments and a calmer front desk with a shared, accurate schedule.",
  },
  {
    slug: "greenleaf",
    title: "GreenLeaf — Organic E-Commerce Store",
    description:
      "Direct-to-consumer storefront for organic products: subscriptions, inventory-aware catalog, and delivery status for repeat customers.",
    category: "E-Commerce",
    tags: ["Next.js", "Stripe", "Sanity CMS", "Vercel"],
    image: "/portfolio/greenleaf.jpg",
    client: "GreenLeaf Organics",
    problem:
      "Marketplace commissions eroded margin, and the brand lacked a owned channel for subscriptions and product storytelling.",
    solution:
      "Headless commerce on Next.js with Sanity-managed content, Stripe Checkout and subscriptions, and inventory signals so customers never order out-of-stock SKUs.",
    metrics: [
      { label: "Channel", value: "Owned D2C store" },
      { label: "Recurring", value: "Subscription SKUs" },
      { label: "Content", value: "CMS-driven catalog" },
    ],
    results:
      "A brand-owned store that supports one-time and subscription orders without marketplace fees.",
  },
  {
    slug: "urbanfit",
    title: "UrbanFit — Gym Management Platform",
    description:
      "Memberships, class schedules, trainer profiles, and local payment rails for fitness centers that needed more than a static brochure site.",
    category: "SaaS",
    tags: ["React", "FastAPI", "PostgreSQL", "Razorpay"],
    image: "/portfolio/urbanfit.jpg",
    client: "UrbanFit Gyms",
    problem:
      "Memberships were tracked offline; class capacity was oversold; payments did not reconcile cleanly with attendance.",
    solution:
      "Member portal and staff console with class booking, capacity limits, trainer profiles, and Razorpay payment flows. FastAPI + PostgreSQL provide a clean API boundary for future mobile apps.",
    metrics: [
      { label: "Memberships", value: "Digital records" },
      { label: "Classes", value: "Capacity-aware booking" },
      { label: "Payments", value: "Razorpay integrated" },
    ],
    results:
      "Operators see who is paid, who is booked, and which classes still have seats — without spreadsheet gymnastics.",
  },
];

export function getProjectBySlug(slug: string): PortfolioProject | undefined {
  return portfolioProjects.find((project) => project.slug === slug);
}
