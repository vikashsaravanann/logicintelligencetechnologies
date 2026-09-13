/**
 * Centralized Route Inventory and Route Metadata for Logic Intelligence Technologies.
 */

export interface AppRoute {
  path: string;
  label: string;
  isProtected: boolean;
  category: "marketing" | "portal" | "admin" | "auth" | "legal" | "tool";
  backTarget?: {
    label: string;
    href: string;
  };
}

export const APP_ROUTES: Record<string, AppRoute> = {
  // Public Marketing Routes
  home: { path: "/", label: "Home", isProtected: false, category: "marketing" },
  about: { path: "/about", label: "About", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  founder: { path: "/about/founder", label: "Founder Profile", isProtected: false, category: "marketing", backTarget: { label: "Back to About", href: "/about" } },
  services: { path: "/services", label: "Solutions", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  industries: { path: "/industries", label: "Industries", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  products: { path: "/products", label: "Products", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  work: { path: "/work", label: "Work", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  packages: { path: "/packages", label: "Packages", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  blog: { path: "/blog", label: "Blog", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  resources: { path: "/resources", label: "Resources", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  careers: { path: "/careers", label: "Careers", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  press: { path: "/press", label: "Press", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  investors: { path: "/investors", label: "Investors", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  contact: { path: "/contact", label: "Contact", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  bookConsultation: { path: "/book-consultation", label: "Book Consultation", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  freeDemo: { path: "/free-demo", label: "Free Demo", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  discovery: { path: "/discovery", label: "Discovery", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  checklist: { path: "/checklist", label: "Website Checklist", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  support: { path: "/support", label: "Support Hub", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  search: { path: "/search", label: "Search", isProtected: false, category: "marketing", backTarget: { label: "Back to Home", href: "/" } },
  ai: { path: "/ai", label: "AI Assistant", isProtected: false, category: "tool", backTarget: { label: "Back to Home", href: "/" } },

  // Legal Routes
  privacy: { path: "/privacy", label: "Privacy Policy", isProtected: false, category: "legal", backTarget: { label: "Back to Home", href: "/" } },
  terms: { path: "/terms", label: "Terms of Service", isProtected: false, category: "legal", backTarget: { label: "Back to Home", href: "/" } },
  refundPolicy: { path: "/refund-policy", label: "Refund Policy", isProtected: false, category: "legal", backTarget: { label: "Back to Home", href: "/" } },
  cookiePolicy: { path: "/cookie-policy", label: "Cookie Policy", isProtected: false, category: "legal", backTarget: { label: "Back to Home", href: "/" } },
  accessibility: { path: "/accessibility", label: "Accessibility Statement", isProtected: false, category: "legal", backTarget: { label: "Back to Home", href: "/" } },

  // Authentication Routes
  login: { path: "/login", label: "Sign In", isProtected: false, category: "auth", backTarget: { label: "Back to Home", href: "/" } },
  resetPassword: { path: "/reset-password", label: "Reset Password", isProtected: false, category: "auth", backTarget: { label: "Back to Sign In", href: "/login" } },

  // Unified Authenticated Portal
  profile: { path: "/profile", label: "Account Profile", isProtected: true, category: "portal", backTarget: { label: "Back to Home", href: "/" } },
  clientDashboard: { path: "/client/dashboard", label: "Client Dashboard", isProtected: true, category: "portal" },
  clientProjects: { path: "/client/projects", label: "Client Projects", isProtected: true, category: "portal", backTarget: { label: "Back to Dashboard", href: "/client/dashboard" } },
  clientDocuments: { path: "/client/documents", label: "Documents Vault", isProtected: true, category: "portal", backTarget: { label: "Back to Dashboard", href: "/client/dashboard" } },
  clientInvoices: { path: "/client/invoices", label: "Invoices & Billing", isProtected: true, category: "portal", backTarget: { label: "Back to Dashboard", href: "/client/dashboard" } },
  clientMessages: { path: "/client/messages", label: "Direct Messages", isProtected: true, category: "portal", backTarget: { label: "Back to Dashboard", href: "/client/dashboard" } },
  clientSupport: { path: "/client/support", label: "Client Support", isProtected: true, category: "portal", backTarget: { label: "Back to Dashboard", href: "/client/dashboard" } },

  // Admin Routes (Strict Staff / Admin Protected)
  adminCommandCenter: { path: "/admin/command-center", label: "Command Center", isProtected: true, category: "admin" },
  adminLeads: { path: "/admin/leads", label: "Leads Management", isProtected: true, category: "admin", backTarget: { label: "Back to Command Center", href: "/admin/command-center" } },
  adminBookings: { path: "/admin/bookings", label: "Bookings Ledger", isProtected: true, category: "admin", backTarget: { label: "Back to Command Center", href: "/admin/command-center" } },
  adminProposals: { path: "/admin/proposals", label: "Proposals", isProtected: true, category: "admin", backTarget: { label: "Back to Command Center", href: "/admin/command-center" } },
  adminSupport: { path: "/admin/support", label: "Admin Support", isProtected: true, category: "admin", backTarget: { label: "Back to Command Center", href: "/admin/command-center" } },
};

export const ROUTE_MIGRATION_MAP: Record<string, string> = {
  "/client/profile": "/profile",
  "/client/login": "/login",
  "/vikashs-portfolio": "/about",
  "/vikash-portfolio": "/about",
};
