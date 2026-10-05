import os
import json
import asyncio
import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer
from peft import PeftModel
from threading import Thread

app = FastAPI(title="Logic Intelligence Technologies AI Core")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://www.logicintelligencetechnologies.in",
        "https://logicintelligencetechnologies.in",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. EXPANDED RAG KNOWLEDGE BASE (verified facts) ---
KNOWLEDGE_BASE = [
    # PACKAGES
    {
        "keywords": ["digital launch", "8999", "8,999", "entry level", "starter", "basic", "cheapest", "launch pack", "5 pages", "delivery in 5", "delivery in 7"],
        "context": "Fact: Digital Launch Pack starts from Rs.8,999. Includes: business/portfolio website up to 5 pages (Home, About, Services, Portfolio, Contact), mobile-responsive design, basic SEO setup, contact form, Google Maps embed, WhatsApp chat button, SSL certificate, domain + hosting setup assistance, and 1 month free support after delivery. Payment terms: 50% advance to begin, 50% on final delivery before going live. Delivery timeline: 5-7 working days. Best for small local businesses, freelancers, and shops going online for the first time."
    },
    {
        "keywords": ["business pro", "18999", "18,999", "booking", "payment gateway", "admin panel", "pro pack", "10 pages", "3 months support"],
        "context": "Fact: Business Pro Pack starts from Rs.18,999. Includes: everything in the Digital Launch Pack plus: Hotel OR Travel Agency quotation system, admin panel for content updates, blog section, payment gateway integration (Razorpay - UPI/Netbanking/Cards), advanced scroll and hover animations, up to 10 pages maximum, 2 rounds of free revisions, and 3 months free support. Payment terms: 50% advance to begin, 50% on final delivery before going live. Best for hotels, travel agencies, restaurants, and growing businesses."
    },
    {
        "keywords": ["enterprise", "custom software", "large scale", "saas", "50000", "50,000", "enterprise pack", "custom quote", "unlimited pages", "6 months support"],
        "context": "Fact: Enterprise Pack is custom-priced starting from Rs.50,000. Includes: custom scope discussion with no limitations, dedicated project manager, advanced backend and databases (scalable for massive traffic), unlimited pages and revisions (within initial scope), and 6 months of free support. Payment terms: milestone-based payments tied to project stages. Best for large enterprises, custom SaaS platforms, and funded startups."
    },
    {
        "keywords": ["payment split", "advance payment", "50 percent", "how to pay", "payment structure", "payment terms"],
        "context": "Fact: Digital Launch Pack and Business Pro Pack use a 50/50 payment split: 50% advance to begin work, 50% on final delivery before going live. Enterprise Pack uses milestone-based payments tied to project completion stages. Standard invoice terms are Net 15 or Net 30 days as per the Statement of Work (SOW)."
    },
    # SERVICES
    {
        "keywords": ["full stack", "full-stack", "web application", "react", "next.js", "node", "saas platform", "customer portal", "admin panel", "dashboard"],
        "context": "Fact: Logic Intelligence Technologies offers Full Stack Web Development using React, Next.js, TypeScript, TailwindCSS (front-end), Node.js/Express/Python/Django (back-end), PostgreSQL/MongoDB/MySQL/Firebase (databases), deployed on Vercel/AWS/DigitalOcean. They build business web applications, SaaS platforms, customer portals, real-time apps. Pricing: Basic Web App Rs.25,000-50,000; Standard Platform Rs.50,000-1,50,000; Enterprise Custom Quote. Timeline: 4-12 weeks depending on complexity."
    },
    {
        "keywords": ["hotel website", "hotel", "resort", "homestay", "hospitality", "booking inquiry", "room gallery"],
        "context": "Fact: Logic Intelligence Technologies builds Hotel and Hospitality websites for direct booking inquiries without MakeMyTrip commission. Includes room gallery, booking inquiry form, dynamic pricing display, Google Maps, WhatsApp chat, multi-language support, SEO. Pricing: Starter Hotel Site Rs.12,999 (5 pages, 7-day delivery); Pro Hotel Site Rs.24,999 (12 pages, 12-day delivery, 3 months support); Premium Resort Package Rs.45,000+ (unlimited pages, admin panel, 6 months support)."
    },
    {
        "keywords": ["travel agency", "travel website", "quotation calculator", "tour package", "itinerary", "destination"],
        "context": "Fact: Logic Intelligence Technologies builds Travel Agency websites with live quotation calculators - visitors select destination, people count, and days to see instant estimated cost, then inquire on WhatsApp. Pricing: Basic Travel Site Rs.15,999; Pro Travel Portal Rs.28,999; Premium Travel Platform Rs.55,000+."
    },
    {
        "keywords": ["custom software", "business management", "erp", "inventory management", "hr software", "payroll", "pos system", "restaurant software", "hospital software", "clinic software"],
        "context": "Fact: Logic Intelligence Technologies builds custom software from scratch - Business Management Software, CRM, School/College Management, Billing/Invoice Software, Inventory Management, Hospital/Clinic Management, HR/Payroll Software, Restaurant POS. Tech: Python, Django, Node.js, React, MySQL, PostgreSQL, Flutter, Docker. Pricing: Simple Software Rs.30,000-75,000; Mid-Complexity Rs.75,000-2,00,000; Enterprise Custom Quote."
    },
    {
        "keywords": ["crm", "crm software", "customer relationship", "lead tracking", "sales pipeline", "follow up", "crm system"],
        "context": "Fact: Logic Intelligence Technologies builds custom CRM (Customer Relationship Management) software - Sales Pipeline Management, Lead Tracking, Automated Email Follow-ups, Customer Support Portals. Custom-built, not an off-the-shelf product."
    },
    {
        "keywords": ["billing software", "invoice software", "gst invoice", "billing system", "invoice generator", "payment reminder", "expense tracking"],
        "context": "Fact: Logic Intelligence Technologies builds custom Billing and Invoice Software for shops and businesses - GST Invoice Generators, Expense Tracking, Payment Reminders, Financial Reporting. Fast and compliant invoice generation."
    },
    {
        "keywords": ["school management", "college management", "school software", "student portal", "fee management", "attendance", "exam management", "timetable"],
        "context": "Fact: Logic Intelligence Technologies builds School Management Software - Student Portals, Fee Management Systems, Timetable Organizers, Result and Exam Management. A complete digital platform for educational institutions."
    },
    {
        "keywords": ["api", "api development", "api integration", "rest api", "graphql", "third party integration", "payment integration"],
        "context": "Fact: Logic Intelligence Technologies builds and integrates APIs - RESTful APIs, GraphQL APIs, Third-Party Integrations, Payment Gateway Integrations (Razorpay, Stripe, PayPal). They connect software systems and automate workflows."
    },
    {
        "keywords": ["cloud", "devops", "aws", "docker", "ci cd", "deployment", "server", "vps", "ssl", "server monitoring"],
        "context": "Fact: Logic Intelligence Technologies offers Cloud Deployment and DevOps services - AWS Architecture, Docker Containerization, CI/CD Pipelines, Server Monitoring on AWS/Azure/Google Cloud. Also basic Web Deployment/Hosting: VPS Setup, SSL installation, domain management."
    },
    {
        "keywords": ["logo design", "branding", "brand identity", "logo", "brand kit", "color palette", "typography", "business card"],
        "context": "Fact: Logic Intelligence Technologies offers Logo Design and Brand Identity - primary logo in all formats (PNG/SVG/PDF/JPG), brand color palette, typography guide, business card, letterhead, email signature, social media designs, brand guidelines document. Pricing: Logo Only Rs.2,999; Logo + Brand Kit Rs.7,999; Full Brand Identity Rs.15,000."
    },
    {
        "keywords": ["web design", "web designing", "website design", "landing page", "corporate website", "portfolio site"],
        "context": "Fact: Logic Intelligence Technologies offers Web Designing - corporate websites, portfolio sites, landing pages, event websites. UI/UX Design pricing: Landing Page Rs.5,000-10,000; Full Website Design Rs.15,000-35,000; Mobile App Design Rs.20,000-50,000. Tools: Figma, Adobe XD, Canva Pro, Illustrator."
    },
    {
        "keywords": ["e-commerce", "online store", "shopping website", "inventory", "woocommerce", "sell online", "product catalog"],
        "context": "Fact: Logic Intelligence Technologies builds E-Commerce websites with Razorpay/Stripe/PayPal/UPI payments. They build for Fashion, Electronics, Food, Handmade products, Books, Furniture, Beauty, Sports, Digital Products, Multi-Vendor Marketplaces. Pricing: Starter Store (up to 50 products) Rs.20,000; Growth Store (up to 200 products) Rs.40,000; Full Marketplace Custom Quote."
    },
    {
        "keywords": ["mobile app", "android app", "ios app", "flutter", "react native", "app development"],
        "context": "Fact: Logic Intelligence Technologies builds Android and iOS apps using Flutter, React Native, Android (Java/Kotlin), iOS (Swift), Firebase. Types: Business Apps, E-Commerce, Food Delivery, Booking Apps, Educational, Fitness, Social, On-Demand, Travel Apps. Pricing: Simple App Rs.40,000-80,000; Mid-Level Rs.80,000-2,00,000; Complex Custom Quote."
    },
    {
        "keywords": ["game", "game development", "unity", "unreal", "2d game", "3d game", "mobile game", "educational game"],
        "context": "Fact: Logic Intelligence Technologies builds 2D and 3D games for mobile, desktop, and web. Types: casual, educational, branded, puzzle, simulation, multiplayer, AR games. Tech: Unity, Unreal Engine, Godot, HTML5/Phaser.js. Pricing: Simple 2D Game Rs.40,000-1,00,000; Mid-Level Rs.1,00,000-3,00,000; Complex/Multiplayer Custom Quote."
    },
    {
        "keywords": ["seo", "search engine", "google ranking", "organic traffic", "keywords", "local seo"],
        "context": "Fact: Logic Intelligence Technologies offers SEO Optimization - On-Page SEO, Technical SEO, Local SEO (especially for Coimbatore businesses), Off-Page SEO, Content SEO. Pricing: Starter Rs.5,000/month (5 keywords, 2 blog posts); Growth Rs.10,000/month (15 keywords, 4 blog posts); Aggressive Rs.20,000/month (30+ keywords, 8 blog posts)."
    },
    # PORTFOLIO
    {
        "keywords": ["freshbite", "restaurant ordering", "food ordering", "restaurant platform", "food delivery", "order tracking"],
        "context": "Portfolio: FreshBite - Restaurant Ordering Platform. Full-stack food ordering with order tracking, payments, and admin dashboard for multi-location restaurants. Tech: Next.js, Stripe, Supabase, Tailwind CSS. Category: E-Commerce. Demonstrates complex food/restaurant platform capability."
    },
    {
        "keywords": ["vaulthr", "hr management", "hr software", "employee onboarding", "leave management", "payroll platform", "hr suite"],
        "context": "Portfolio: VaultHR - HR Management Suite. Employee onboarding, leave management, and payroll workflows in a single cloud platform. Tech: React, Node.js, PostgreSQL, AWS. Category: SaaS. Demonstrates enterprise HR software expertise."
    },
    {
        "keywords": ["luxe interiors", "interior design", "design studio", "portfolio site", "project gallery"],
        "context": "Portfolio: Luxe Interiors - Design Studio Portfolio. Portfolio site with project galleries and client inquiry flow for an interior design studio. Tech: Next.js, Framer Motion, Vercel. Category: Corporate."
    },
    {
        "keywords": ["mediconnect", "clinic", "appointment scheduling", "patient records", "medical booking", "doctor appointment", "healthcare"],
        "context": "Portfolio: MediConnect - Clinic Booking System. Online appointment scheduling, patient records, and automated reminders for clinics. Tech: Next.js, Supabase, Twilio, Tailwind CSS. Category: Web App. Demonstrates healthcare/clinic management systems."
    },
    {
        "keywords": ["greenleaf", "organic", "subscription ecommerce", "organic store", "delivery tracking", "inventory ecommerce"],
        "context": "Portfolio: GreenLeaf - Organic E-Commerce Store. E-commerce storefront with subscriptions, inventory management, and delivery tracking. Tech: Next.js, Stripe, Sanity CMS, Vercel. Category: E-Commerce. Demonstrates subscription-based e-commerce."
    },
    {
        "keywords": ["urbanfit", "gym", "fitness", "gym management", "membership management", "class scheduling", "trainer", "gym app", "fitness platform"],
        "context": "Portfolio: UrbanFit - Gym Management Platform. Membership management, class scheduling, trainer profiles, and payment processing. Tech: React, FastAPI, PostgreSQL, Razorpay. Category: SaaS. Demonstrates gym/fitness management platform expertise with Razorpay integration."
    },
    # REFUND + POLICIES
    {
        "keywords": ["refund", "cancellation", "refund policy", "cancel project", "money back", "partial refund", "dispute"],
        "context": "Fact - Refund Policy: Projects are divided into milestones. Initial deposits are non-refundable once discovery or design has started. Approved milestone payments are non-refundable. If you cancel mid-development, you are only billed for work completed to that date. After final deployment and source code handover, no refunds are issued - a bug-fixing warranty period is provided post-launch. Monthly maintenance/retainer: cancel with 30 days written notice; billed for current month; no partial month refunds. Digital products are final sale. Exceptional disputes reviewed case-by-case. Contact: support@logicintelligencetechnologies.in."
    },
    {
        "keywords": ["support", "maintenance", "contact", "help", "whatsapp", "response time", "after launch", "bug fix"],
        "context": "Fact: Every inquiry is responded to within 24 hours. Primary contact: WhatsApp +91 75500 67712. Free support included: Digital Launch Pack = 1 month; Business Pro Pack = 3 months; Enterprise Pack = 6 months. After free support, paid maintenance plans available. Full source code transferred to client upon project completion."
    },
    {
        "keywords": ["guarantee", "promise", "demo", "prototype", "before i pay", "free demo", "no obligation"],
        "context": "Fact: Every engagement starts with a free demo prototype before the client commits to a contract or pays anything. If the client does not like the direction, they can walk away with no obligation."
    },
    {
        "keywords": ["how do you work", "engagement process", "workflow", "steps", "how does it work", "how to start", "get started"],
        "context": "Fact: The engagement follows 4 steps: 1) Discovery and Strategy (31-point Client Discovery Checklist), 2) UI/UX Design (shared with client for feedback), 3) Development (Next.js, React, Node.js), 4) Testing and Launch (QA, performance, deployment, admin training). Before starting, clients must provide: completed scope checklist, logo/brand guidelines, written copy, high-resolution media, legal pages, and access credentials."
    },
    {
        "keywords": ["payment terms", "invoice", "net 15", "net 30", "sow", "statement of work"],
        "context": "Fact: Payment terms follow the Statement of Work (SOW). Standard terms are Net 15 or Net 30 days. Digital Launch and Business Pro use 50/50 split; Enterprise uses milestone-based payments."
    },
    {
        "keywords": ["nda", "confidentiality", "non-disclosure"],
        "context": "Fact: A Mutual NDA protects confidential information (business plans, code, designs, pricing) for 2-3 years from signing. Shared information is only used to evaluate the business relationship."
    },
    {
        "keywords": ["founder", "ceo", "who started", "who owns", "vikash", "vikash saravanan"],
        "context": "Fact: Logic Intelligence Technologies was founded by Vikash Saravanan, who serves as Founder and CEO. He is a B.Tech student in AI and Data Science who founded the company to bring modern, AI-integrated web and software development to businesses in Coimbatore and beyond, with transparent pricing and a free demo before you pay."
    },
    {
        "keywords": ["cin", "registration", "legal entity", "company registration", "pvt ltd"],
        "context": "Fact: Logic Intelligence Technologies is a technology startup based in Coimbatore, Tamil Nadu, India. Company incorporation is pending, so no CIN has been issued yet."
    },
    {
        "keywords": ["tagline", "motto", "slogan", "about", "who are you", "what do you do", "offer", "capabilities", "services", "technologies", "tech stack"],
        "context": "Fact: Logic Intelligence Technologies tagline is 'Where Logic Meets Innovation'. They are a premium full-stack web, app, and software development studio based in Coimbatore, Tamil Nadu, India, founded by Vikash Saravanan. Services include: Full Stack Web Development, Hotel/Hospitality Websites, Travel Agency Websites, Custom Software/CRM/ERP, E-Commerce, Mobile App Development, Game Development, UI/UX Design, SEO Optimization, Hosting and Maintenance, Cloud Deployment and DevOps, Logo Design and Branding, Billing/Invoice Software, School Management Software, API Development and Integration. Primary tech stack: Next.js, React, TypeScript, TailwindCSS, Supabase (PostgreSQL/Auth/Storage), deployed on Vercel."
    },
]

def retrieve_rag_context(user_query: str) -> str:
    query_lower = user_query.lower()
    matched = [item["context"] for item in KNOWLEDGE_BASE if any(k in query_lower for k in item["keywords"])]
    return "\n".join(matched) if matched else ""

# --- 2. LOAD MODEL ---
BASE_MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"
ADAPTER_PATHS = [
    "./models/logic-intelligence-lora-v2-final",
    "./models/logic-intelligence-lora-final",
    "./logic-intelligence-lora-v2-final",
    "./logic-intelligence-lora-final",
]

device = "mps" if torch.backends.mps.is_available() else "cpu"
print(f"Using device acceleration: {device}")

print("Loading tokenizer and base model...")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_NAME)

base_model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL_NAME,
    torch_dtype=torch.float16 if device == "mps" else torch.float32,
    low_cpu_mem_usage=True
)

adapter_loaded = False
loaded_adapter_path = None
for path in ADAPTER_PATHS:
    if os.path.exists(path):
        print(f"Applying LoRA adapter from '{path}'...")
        peft_model = PeftModel.from_pretrained(base_model, path)
        print("Merging adapter into base model for high-speed inference...")
        model = peft_model.merge_and_unload()
        adapter_loaded = True
        loaded_adapter_path = path
        break

if not adapter_loaded:
    print("Warning: No adapter folder found. Running base instruction model.")
    model = base_model

model.to(device)
model.eval()

# --- 3. REQUEST MODELS ---
class PromptRequest(BaseModel):
    text: str
    max_tokens: int = 250

def build_messages(user_text: str):
    rag_context = retrieve_rag_context(user_text)
    system_content = (
        "You are the official AI assistant for Logic Intelligence Technologies — "
        "a premium web, app, and software development agency based in Coimbatore, India, founded by Vikash Saravanan.\n\n"
        "Your role: help prospective and existing clients understand our services, packages, pricing, portfolio, and processes.\n\n"
        "STRICT RULES:\n"
        "1. NEVER invent pricing, timelines, features, or terms not in the provided company facts. "
        "If information is not in the facts, say so clearly and direct the client to WhatsApp (+91 75500 67712) or the /contact page.\n"
        "2. Reply concisely and professionally. No filler phrases, no hype, no emojis unless responding to casual conversation.\n"
        "3. When unsure, say so and offer to connect the client with the team on WhatsApp (+91 75500 67712).\n"
        "4. Do not recommend competitor services or tools not in our offerings.\n"
        "5. Maintain a helpful, confident, professional tone — like a knowledgeable account manager."
    )
    if rag_context:
        system_content += f"\n\nVerified Company Facts (use these exactly; do not alter numbers or terms):\n{rag_context}"
    return [
        {"role": "system", "content": system_content},
        {"role": "user", "content": user_text}
    ]

# --- 4. ENDPOINTS ---
@app.get("/health")
async def health_check():
    return {"status": "ok", "adapter_loaded": adapter_loaded, "adapter_path": loaded_adapter_path, "device": device}

@app.post("/generate")
async def generate_text(request: PromptRequest):
    """Non-streaming endpoint (kept for compatibility)."""
    try:
        messages = build_messages(request.text)
        inputs = tokenizer.apply_chat_template(
            messages, return_tensors="pt", add_generation_prompt=True, return_dict=True
        ).to(device)

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=request.max_tokens,
                temperature=0.3,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )

        response = tokenizer.decode(outputs[0][inputs["input_ids"].shape[-1]:], skip_special_tokens=True)
        return {"status": "success", "generated_text": response.strip()}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/generate-stream")
async def generate_text_stream(request: PromptRequest):
    """Streaming endpoint — sends tokens as they're generated using Server-Sent Events."""
    messages = build_messages(request.text)
    inputs = tokenizer.apply_chat_template(
        messages, return_tensors="pt", add_generation_prompt=True, return_dict=True
    ).to(device)

    streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)

    generation_kwargs = dict(
        **inputs,
        streamer=streamer,
        max_new_tokens=request.max_tokens,
        temperature=0.3,
        top_p=0.9,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id,
    )

    thread = Thread(target=model.generate, kwargs=generation_kwargs)
    thread.start()

    async def event_generator():
        try:
            for token_text in streamer:
                if token_text:
                    payload = json.dumps({"token": token_text})
                    yield f"data: {payload}\n\n"
                    await asyncio.sleep(0)
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")