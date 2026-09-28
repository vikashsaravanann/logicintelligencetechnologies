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

/**
 * Portfolio imagery: distinct, realistic Unsplash sources (next.config remotePatterns
 * already allows images.unsplash.com). Local /images/work/* paths were 404 in production
 * and several shared identical binary blobs — each project must have a unique image.
 */
export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "freshbite",
    title: "FreshBite — Restaurant Ordering Platform",
    description:
      "Full-stack food ordering with real-time order tracking, secure payments, and a multi-location admin dashboard for restaurant operators.",
    category: "E-Commerce",
    tags: ["Next.js", "Payments", "Supabase", "Tailwind CSS"],
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&h=800&q=80",
    client: "FreshBite Restaurants",
    problem:
      "Phone and WhatsApp orders were error-prone during peak hours. Staff juggled handwritten tickets, payment confirmation lagged, and kitchen throughput stalled when volume spiked.",
    solution:
      "We shipped a customer-facing ordering web app with cart, location-aware menus, payment gateway checkout, and live order status. Operators manage outlets, menus, and fulfillment from a single admin console backed by Supabase realtime.",
    metrics: [
      { label: "Order capture", value: "Phone → digital in 1 sprint" },
      { label: "Payment", value: "Card + UPI" },
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
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&h=800&q=80",
    client: "Mid-market services firm",
    problem:
      "HR data lived in disconnected sheets. Leave requests stalled in email threads, onboarding checklists were incomplete, and payroll prep consumed days each cycle.",
    solution:
      "Role-based HR workspace with employee profiles, approval workflows, leave balances, and export-ready payroll inputs. Built on React + Node with PostgreSQL on AWS for predictable access control and auditability.",
    metrics: [
      { label: "Leave cycle", value: "Days → hours" },
      { label: "Source of truth", value: "Single HR system" },
      { label: "Access", value: "Role-based" },
    ],
    results:
      "HR operations centralized with clearer approvals and faster leave and payroll cycles.",
  },
  {
    slug: "luxe-interiors",
    title: "Luxe Interiors — Design Showcase",
    description:
      "Portfolio and inquiry platform for an interior design studio: project galleries, mood boards, and qualified lead capture.",
    category: "Marketing",
    tags: ["Next.js", "CMS", "Tailwind CSS", "Vercel"],
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&h=800&q=80",
    client: "Luxe Interiors Studio",
    problem:
      "Work lived in Instagram and PDFs. Prospects could not browse projects by room type or budget, and inquiries lacked structured context.",
    solution:
      "Case-study-led marketing site with filtered project galleries, high-resolution imagery, and a structured inquiry form that routes to the studio pipeline.",
    metrics: [
      { label: "Gallery", value: "Filterable projects" },
      { label: "Leads", value: "Structured intake" },
      { label: "Brand", value: "Studio-grade presentation" },
    ],
    results:
      "A owned web presence that presents the portfolio professionally and captures qualified design inquiries.",
  },
  {
    slug: "mediconnect",
    title: "MediConnect — Clinic Appointment System",
    description:
      "Patient booking, reminders, and clinic schedule management so front desks stop relying on paper diaries and ad-hoc calls.",
    category: "Healthcare",
    tags: ["Next.js", "FastAPI", "PostgreSQL", "SMS"],
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&h=800&q=80",
    client: "Regional outpatient clinics",
    problem:
      "Double-bookings and no-shows were common. Patients could not self-schedule; staff spent hours confirming appointments by phone.",
    solution:
      "Patient-facing booking with slot availability, clinic console for doctors and rooms, and automated SMS reminders before visits.",
    metrics: [
      { label: "Booking", value: "Self-serve slots" },
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
    tags: ["Next.js", "Payments", "Sanity CMS", "Vercel"],
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&h=800&q=80",
    client: "GreenLeaf Organics",
    problem:
      "Marketplace commissions eroded margin, and the brand lacked a owned channel for subscriptions and product storytelling.",
    solution:
      "Headless commerce on Next.js with Sanity-managed content, secure checkout and subscriptions, and inventory signals so customers never order out-of-stock SKUs.",
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
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&h=800&q=80",
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
