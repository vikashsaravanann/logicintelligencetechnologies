export const servicesData = [
  {
    id: "full-stack-development",
    slug: "full-stack-development",
    title: "Full Stack Web Development",
    subtitle: "Front-End + Back-End + Database + Deployment — We Handle the Entire Stack",
    icon: "Code",
    description: "Full stack development means we build every layer of your web application — from what users see on screen (front-end) to the database and server logic running behind the scenes (back-end).\n\nAt Logic Intelligence Technologies, our full stack developers are skilled in modern frameworks and technologies that power today's most successful web applications.\n\nWe don't just build websites — we build complete web systems that are fast, secure, scalable, and ready to grow with your business.",
    whatWeBuild: [
      "Business Web Applications",
      "Customer Portals & Dashboards",
      "SaaS (Software as a Service) Platforms",
      "Admin Panels & CMS Systems",
      "API-Driven Web Apps",
      "Real-Time Applications (chat, notifications)",
      "Multi-Vendor Platforms",
      "Progressive Web Apps (PWA)"
    ],
    techStack: {
      frontend: ["React.js", "Next.js", "Vue.js", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "JavaScript", "TypeScript"],
      backend: ["Node.js", "Express.js", "Python", "Django", "PHP", "Laravel"],
      database: ["MongoDB", "MySQL", "PostgreSQL", "Firebase", "Redis"],
      deployment: ["Vercel", "AWS", "DigitalOcean", "Hostinger", "Nginx", "Docker"],
      tools: ["Git", "GitHub", "Postman", "Figma", "VS Code", "Linux"]
    },
    process: [
      { step: "Requirement Analysis", desc: "We understand your business, goals, users, and technical needs." },
      { step: "System Architecture Design", desc: "We plan the entire system structure — database schema, API design, user flows." },
      { step: "UI/UX Wireframing", desc: "We design every screen before writing a single line of code." },
      { step: "Front-End Development", desc: "We build the user interface — pixel perfect, fast, and responsive." },
      { step: "Back-End Development", desc: "We build the server, APIs, business logic, and database connections." },
      { step: "Integration & Testing", desc: "We connect all layers and test every function thoroughly." },
      { step: "Deployment", desc: "We launch on your chosen server with SSL, domain, and performance optimization." },
      { step: "Support & Maintenance", desc: "We stay with you after launch for updates, fixes, and improvements." }
    ],
    whyUs: [
      { title: "One Team, One Responsibility", desc: "No coordination issues between multiple vendors" },
      { title: "Modern Tech Stack", desc: "We use technologies companies like Google, Netflix, and Amazon use" },
      { title: "Scalable Architecture", desc: "Built to handle growth from 100 to 1,00,000 users" },
      { title: "Security First", desc: "SSL, input validation, JWT auth, data encryption built in" }
    ],
    pricing: [
      { tier: "Basic Web App", price: "₹25,000 – ₹50,000" },
      { tier: "Standard Platform", price: "₹50,000 – ₹1,50,000" },
      { tier: "Enterprise System", price: "Custom Quote" }
    ],
    faqs: [
      { q: "How long does a full stack project take?", a: "Typically 4 to 12 weeks depending on complexity." },
      { q: "Do you provide source code after completion?", a: "Yes — full source code ownership is transferred to you." },
      { q: "Can you work with our existing system?", a: "Yes — we can integrate with or upgrade existing platforms." },
      { q: "What if I need changes after launch?", a: "We offer paid maintenance plans and free bug fixes for 30 days post-launch." }
    ]
  },
  {
    id: "hotel-website",
    slug: "hotel-website",
    title: "Hotel & Hospitality Website Development",
    subtitle: "Beautiful, Booking-Ready Websites for Hotels, Resorts, and Homestays",
    icon: "Hotel",
    description: "Your hotel website is your 24/7 front desk. If it looks outdated or doesn't work on mobile, guests book somewhere else.\n\nLogic Intelligence Technologies builds premium hotel websites that showcase your property beautifully, answer guest questions instantly, and bring you direct booking inquiries — without paying commission to third-party platforms like MakeMyTrip.",
    whatWeBuild: [
      "Stunning Room Gallery",
      "Booking Inquiry Form",
      "Dynamic Pricing Display",
      "Amenities Showcase",
      "Google Maps Integration",
      "WhatsApp Direct Chat",
      "Reviews & Testimonials",
      "Local Area Guide",
      "Multi-Language Support",
      "Mobile-First Design",
      "SEO Optimization",
      "Fast Loading Speed"
    ],
    techStack: {}, // Empty for this service as per prompt
    process: [
      { step: "Day 1–2", desc: "We collect your hotel photos, details, pricing" },
      { step: "Day 3–5", desc: "We design the homepage for your approval" },
      { step: "Day 6–10", desc: "We build all pages" },
      { step: "Day 11–12", desc: "Review, revisions, final approval" },
      { step: "Day 13–14", desc: "Go live with your domain" }
    ],
    whyUs: [],
    pricing: [
      { tier: "Starter Hotel Site", price: "₹12,999", details: ["Up to 5 pages", "Room gallery", "Booking inquiry form", "WhatsApp + Maps", "Mobile responsive", "Delivered in 7 days"] },
      { tier: "Pro Hotel Site", price: "₹24,999", details: ["Up to 12 pages", "Full room detail pages", "Dynamic pricing display", "SEO optimization", "Blog section", "Multi-language", "3 months support", "Delivered in 12 days"] },
      { tier: "Premium Resort Package", price: "₹45,000+", details: ["Unlimited pages", "Online payment integration", "Admin panel for self-updates", "Advanced SEO", "Virtual tour integration", "6 months support", "Custom scope"] }
    ],
    faqs: [
      { q: "Will I be able to update room prices myself?", a: "Yes — we provide an easy admin panel or train you to update content via WhatsApp instruction." },
      { q: "Do I need to pay MakeMyTrip commission?", a: "No — your website takes direct bookings. Zero commission to anyone." },
      { q: "What photos do you need from me?", a: "We need photos of rooms, common areas, views, and your logo. We will organize them professionally." },
      { q: "Do you work with hotels outside Coimbatore?", a: "Yes — we work with hotels across Tamil Nadu, Kerala, and all of India remotely." }
    ]
  },
  {
    id: "travel-agency-website",
    slug: "travel-agency-website",
    title: "Travel Agency Website with Live Quotation System",
    subtitle: "Let Customers Calculate Their Own Trip Cost Instantly — And Inquire on WhatsApp",
    icon: "Plane",
    description: "Most travel agencies lose customers because they don't respond fast enough to price inquiries. Imagine a website where your customers select their destination, number of people, and days — and instantly see the estimated cost.\n\nThat's exactly what we build. Logic Intelligence Technologies specializes in travel agency websites with live quotation calculators that convert visitors into leads automatically — even at midnight when your office is closed.",
    whatWeBuild: [
      "Live Quotation Calculator",
      "Destination Package Pages",
      "Itinerary Builder Preview",
      "WhatsApp Inquiry Integration",
      "Photo Gallery per Destination",
      "Testimonials from Past Travelers",
      "Seasonal Offers & Deals",
      "Blog — Travel Tips & Guides"
    ],
    techStack: {},
    process: [],
    whyUs: [],
    pricing: [
      { tier: "Basic Travel Site", price: "₹15,999" },
      { tier: "Pro Travel Portal", price: "₹28,999" },
      { tier: "Premium Travel Platform", price: "₹55,000+" }
    ],
    faqs: [
      { q: "Can I update the package prices myself?", a: "Yes — we give you an easy admin panel to update prices, add destinations, and manage content." },
      { q: "Can the quotation system handle international packages?", a: "Yes — we configure it for any destination and any currency." },
      { q: "How do I receive the inquiries?", a: "Directly on your WhatsApp and email — no third-party platform, no commission." },
      { q: "Can I add visa and flight information pages?", a: "Yes — we can add any additional sections you need." }
    ]
  },
  // Continuing with other 15 services with a generic detailed structure based on prompt
  {
    id: "software-development",
    slug: "software-development",
    title: "Custom Software Development",
    subtitle: "We Build Software Exactly the Way Your Business Needs It — Not a Generic Solution",
    icon: "Terminal",
    description: "Off-the-shelf software never fits perfectly. You pay for features you don't need and miss features you do need.\n\nLogic Intelligence Technologies builds custom software from scratch — designed around your exact business process, your workflow, and your team.",
    whatWeBuild: [
      "Business Management Software",
      "CRM — Customer Relationship Management",
      "School / College Management System",
      "Billing & Invoice Software",
      "Inventory Management System",
      "Hospital / Clinic Management Software",
      "HR & Payroll Software",
      "Restaurant / Food Court POS System"
    ],
    techStack: {
      tools: ["Python", "Django", "Node.js", "React", "MySQL", "PostgreSQL", "Electron (desktop apps)", "Flutter", "AWS", "Docker", "REST APIs"]
    },
    process: [
      { step: "Business Analysis", desc: "Understand your workflow" },
      { step: "Feature Planning", desc: "Define every feature" },
      { step: "Database Design", desc: "Structure your data properly" },
      { step: "Development sprints", desc: "Build in stages" },
      { step: "User Testing", desc: "Test with real users" },
      { step: "Training", desc: "We train your team to use it" },
      { step: "Deployment", desc: "Install on your server/cloud" },
      { step: "Ongoing Support", desc: "We are here after launch" }
    ],
    whyUs: [],
    pricing: [
      { tier: "Simple Software", price: "₹30,000 – ₹75,000" },
      { tier: "Mid-Complexity System", price: "₹75,000 – ₹2,00,000" },
      { tier: "Enterprise Software", price: "Custom Quote" }
    ],
    faqs: []
  },
  {
    id: "game-development",
    slug: "game-development",
    title: "Game Development",
    subtitle: "We Build Engaging 2D and 3D Games for Mobile, Desktop, and Web",
    icon: "Gamepad",
    description: "Gaming is one of the fastest growing industries in India and globally. Whether you want a mobile casual game, an educational game for your school, or a branded game experience for your business — Logic Intelligence Technologies builds it.",
    whatWeBuild: [
      "2D Mobile Games (Android & iOS)",
      "3D Mobile Games",
      "PC / Desktop Games",
      "Web Browser Games (HTML5)",
      "Educational Games for Schools",
      "Branded / Promotional Games",
      "Puzzle & Casual Games",
      "Simulation Games",
      "Multiplayer Online Games",
      "Augmented Reality (AR) Games"
    ],
    techStack: {
      tools: ["Unity", "Unreal Engine", "Godot", "HTML5 + Phaser.js", "C#", "C++", "Blender (3D)", "Android Studio", "iOS Xcode"]
    },
    process: [
      { step: "Game Concept & Story", desc: "" },
      { step: "Character & Level Design", desc: "" },
      { step: "Game Mechanics Planning", desc: "" },
      { step: "Development (coding + assets)", desc: "" },
      { step: "Sound & Music Integration", desc: "" },
      { step: "Testing on all devices", desc: "" },
      { step: "App Store / Play Store submission", desc: "" },
      { step: "Post-launch updates", desc: "" }
    ],
    whyUs: [],
    pricing: [
      { tier: "Simple 2D Game", price: "₹40,000 – ₹1,00,000" },
      { tier: "Mid-Level Game", price: "₹1,00,000 – ₹3,00,000" },
      { tier: "Complex 3D / Multiplayer", price: "Custom Quote" }
    ],
    faqs: []
  },
  {
    id: "ecommerce-website",
    slug: "ecommerce-website",
    title: "E-Commerce Website Development",
    subtitle: "Sell Your Products Online 24/7 — With Secure Payments and Easy Order Management",
    icon: "ShoppingCart",
    description: "Take your shop online and sell to customers everywhere. We build powerful E-Commerce platforms customized for your products.",
    whatWeBuild: [
      "Fashion & Clothing",
      "Electronics",
      "Food & Groceries",
      "Handmade / Artisan Products",
      "Books",
      "Furniture",
      "Beauty & Cosmetics",
      "Sports & Fitness",
      "Digital Products (courses, downloads)",
      "Multi-Vendor Marketplace"
    ],
    techStack: {
      tools: ["React", "Node.js", "MongoDB", "WordPress", "WooCommerce", "Razorpay", "Stripe", "UPI"]
    },
    process: [],
    whyUs: [],
    pricing: [
      { tier: "Starter Store (up to 50 products)", price: "₹20,000" },
      { tier: "Growth Store (up to 200 products)", price: "₹40,000" },
      { tier: "Full Marketplace (unlimited)", price: "Custom Quote" }
    ],
    faqs: []
  },
  {
    id: "mobile-app-development",
    slug: "mobile-app-development",
    title: "Mobile App Development",
    subtitle: "Android & iOS Apps Built for Real Business Results",
    icon: "Smartphone",
    description: "Reach your customers directly on their phones with a fast, modern mobile application.",
    whatWeBuild: [
      "Business Apps",
      "E-Commerce Apps",
      "Food Delivery Apps",
      "Booking Apps (hotel, salon, clinic)",
      "Educational Apps",
      "Fitness & Health Apps",
      "Social Community Apps",
      "On-Demand Service Apps",
      "Travel & Tourism Apps"
    ],
    techStack: {
      tools: ["Flutter", "React Native", "Android (Java/Kotlin)", "iOS (Swift)", "Node.js", "Firebase", "MongoDB"]
    },
    process: [
      { step: "Design", desc: "" },
      { step: "Develop", desc: "" },
      { step: "Test", desc: "" },
      { step: "Submit", desc: "Play Store / App Store" },
      { step: "Support", desc: "" }
    ],
    whyUs: [],
    pricing: [
      { tier: "Simple App", price: "₹40,000 – ₹80,000" },
      { tier: "Mid-Level App", price: "₹80,000 – ₹2,00,000" },
      { tier: "Complex App", price: "Custom Quote" }
    ],
    faqs: []
  },
  {
    id: "seo-optimization",
    slug: "seo-optimization",
    title: "SEO Optimization",
    subtitle: "Rank on Google. Get Free Traffic. Grow Your Business Without Paying for Ads",
    icon: "Search",
    description: "SEO (Search Engine Optimization) means optimizing your website so it appears at the top of Google when your customers search for services you offer.\n\nExample: If you run a hotel in Ooty — SEO makes your website appear when someone searches 'hotels in Ooty' or 'best resort near Ooty'.\n\nThis brings you free, high-quality traffic every month — forever — without paying for ads.",
    whatWeBuild: [
      "Technical SEO",
      "On-Page SEO",
      "Local SEO (especially for Coimbatore businesses)",
      "Off-Page SEO",
      "Content SEO"
    ],
    techStack: {},
    process: [],
    whyUs: [],
    pricing: [
      { tier: "Starter", price: "₹5,000/month (5 keywords, 2 blog posts)" },
      { tier: "Growth", price: "₹10,000/month (15 keywords, 4 blog posts)" },
      { tier: "Aggressive", price: "₹20,000/month (30+ keywords, 8 blog posts)" }
    ],
    faqs: []
  },
  {
    id: "ui-ux-design",
    slug: "ui-ux-design",
    title: "UI/UX Design",
    subtitle: "Design That Looks Beautiful AND Converts Visitors into Customers",
    icon: "Palette",
    description: "We don't just design screens; we design experiences. Our UI/UX team ensures your product is intuitive, modern, and perfectly aligned with your brand identity.",
    whatWeBuild: [
      "Website UI designs (Figma)",
      "Mobile app screen designs",
      "Dashboard and admin panel UI",
      "Landing page designs",
      "Brand identity and style guides",
      "Icon sets and illustration systems"
    ],
    techStack: {
      tools: ["Figma", "Adobe XD", "Canva Pro", "Illustrator", "Photoshop"]
    },
    process: [
      { step: "Research", desc: "" },
      { step: "User Personas", desc: "" },
      { step: "Wireframes", desc: "" },
      { step: "Prototypes", desc: "" },
      { step: "Visual Design", desc: "" },
      { step: "Developer Handoff", desc: "" },
      { step: "Design System", desc: "" }
    ],
    whyUs: [],
    pricing: [
      { tier: "Landing Page Design", price: "₹5,000 – ₹10,000" },
      { tier: "Full Website Design", price: "₹15,000 – ₹35,000" },
      { tier: "Mobile App Design", price: "₹20,000 – ₹50,000" }
    ],
    faqs: []
  },
  {
    id: "logo-branding",
    slug: "logo-branding",
    title: "Logo Design & Brand Identity",
    subtitle: "Your Logo is the Face of Your Business — Make It Unforgettable",
    icon: "Brush",
    description: "A strong brand stands out in a crowded market. We create memorable, professional brand identities that resonate with your target audience.",
    whatWeBuild: [
      "Primary logo (horizontal + vertical versions)",
      "Logo in all formats: PNG, SVG, PDF, JPG",
      "Light and dark background versions",
      "Favicon (website tab icon)",
      "Brand color palette (primary + secondary + neutrals)",
      "Typography guide (which fonts to use)",
      "Business card design",
      "Letterhead design",
      "Email signature design",
      "Social media profile and cover designs",
      "Brand guidelines document"
    ],
    techStack: {},
    process: [],
    whyUs: [],
    pricing: [
      { tier: "Logo Only", price: "₹2,999" },
      { tier: "Logo + Brand Kit", price: "₹7,999" },
      { tier: "Full Brand Identity", price: "₹15,000" }
    ],
    faqs: []
  },
  {
    id: "web-designing",
    slug: "web-designing",
    title: "Web Designing",
    subtitle: "Stunning, Fast, and Highly Converting Web Designs",
    icon: "Layout",
    description: "First impressions matter. We design websites that look stunning, load instantly, and turn your visitors into paying customers.",
    whatWeBuild: ["Corporate Websites", "Portfolio Sites", "Landing Pages", "Event Websites"],
    techStack: {},
    process: [],
    whyUs: [],
    pricing: [],
    faqs: []
  },
  {
    id: "web-deployment",
    slug: "web-deployment",
    title: "Web Deployment & Hosting Setup",
    subtitle: "Get Your Website Live Fast and Securely",
    icon: "UploadCloud",
    description: "We handle the complex server setups, SSL certificates, and performance optimization to ensure your website stays online 24/7 without issues.",
    whatWeBuild: ["VPS Setup", "Cloud Hosting Configuration", "SSL Installation", "Domain Management"],
    techStack: {},
    process: [],
    whyUs: [],
    pricing: [],
    faqs: []
  },
  {
    id: "business-website",
    slug: "business-website",
    title: "Business Website Development",
    subtitle: "Your Digital Storefront, Built to Sell",
    icon: "Building",
    description: "A professional business website is non-negotiable today. We build tailored websites that explain your services clearly and capture leads effortlessly.",
    whatWeBuild: ["Corporate Sites", "Consulting Portals", "Agency Websites", "Startup Landing Pages"],
    techStack: {},
    process: [],
    whyUs: [],
    pricing: [],
    faqs: []
  },
  {
    id: "crm-software",
    slug: "crm-software",
    title: "CRM Software Development",
    subtitle: "Manage Your Leads, Sales, and Customers in One Place",
    icon: "Users",
    description: "Stop losing leads in spreadsheets. Our custom CRM software helps you track every customer interaction, automate follow-ups, and close more deals.",
    whatWeBuild: ["Sales Pipeline Management", "Lead Tracking", "Automated Email Follow-ups", "Customer Support Portals"],
    techStack: {},
    process: [],
    whyUs: [],
    pricing: [],
    faqs: []
  },
  {
    id: "school-management-software",
    slug: "school-management-software",
    title: "School Management Software",
    subtitle: "Complete Digital Transformation for Educational Institutions",
    icon: "GraduationCap",
    description: "Manage students, teachers, exams, fees, and attendance all from one centralized dashboard. Secure, reliable, and easy to use for everyone.",
    whatWeBuild: ["Student Portals", "Fee Management Systems", "Timetable Organizers", "Result & Exam Management"],
    techStack: {},
    process: [],
    whyUs: [],
    pricing: [],
    faqs: []
  },
  {
    id: "billing-software",
    slug: "billing-software",
    title: "Billing & Invoice Software",
    subtitle: "Generate GST Invoices in Seconds",
    icon: "Receipt",
    description: "Streamline your accounting with custom billing software. Generate fast, compliant invoices, track pending payments, and manage expenses seamlessly.",
    whatWeBuild: ["GST Invoice Generators", "Expense Tracking", "Payment Reminders", "Financial Reporting"],
    techStack: {},
    process: [],
    whyUs: [],
    pricing: [],
    faqs: []
  },
  {
    id: "api-development",
    slug: "api-development",
    title: "API Development & Integration",
    subtitle: "Connect Your Systems and Automate Workflows",
    icon: "CodeSquare",
    description: "Need your software to talk to another system? We build robust, secure APIs that power modern applications and automate complex business logic.",
    whatWeBuild: ["RESTful APIs", "GraphQL APIs", "Third-Party Integrations", "Payment Gateway Integrations"],
    techStack: {},
    process: [],
    whyUs: [],
    pricing: [],
    faqs: []
  },
  {
    id: "cloud-deployment",
    slug: "cloud-deployment",
    title: "Cloud Deployment & DevOps",
    subtitle: "Scale Your Applications to Millions of Users",
    icon: "Cloud",
    description: "We configure high-availability cloud infrastructure on AWS, Azure, or Google Cloud to ensure your applications run blazing fast and never go down under heavy traffic.",
    whatWeBuild: ["AWS Architecture", "Docker Containerization", "CI/CD Pipelines", "Server Monitoring"],
    techStack: {},
    process: [],
    whyUs: [],
    pricing: [],
    faqs: []
  }
];

export function getServiceVisual(slug: string): string {
  return `/images/services/${slug}.svg`;
}

export function getServiceBySlug(slug: string) {
  return servicesData.find((s) => s.slug === slug);
}
