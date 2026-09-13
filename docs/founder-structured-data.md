# Founder Structured Data Documentation

This document records the exact JSON-LD graph used to represent the founder (Vikash Saravanan) and the organization (Logic Intelligence Technologies) across the company website.

## Location
The structured data is dynamically injected into the head of `src/app/(marketing)/about/founder/page.tsx` via the utilities in `src/lib/seo/schema.ts`.

## Schema Implementation
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.logicintelligencetechnologies.in/#organization",
      "name": "Logic Intelligence Technologies",
      "url": "https://www.logicintelligencetechnologies.in/",
      "founder": {
        "@id": "https://www.logicintelligencetechnologies.in/#founder"
      }
    },
    {
      "@type": "Person",
      "@id": "https://www.logicintelligencetechnologies.in/#founder",
      "name": "Vikash Saravanan",
      "alternateName": [
        "Vikash S"
      ],
      "url": "https://vikashsaravanann.github.io/startupwithvikash/",
      "jobTitle": "Founder & Lead Systems Engineer",
      "description": "Vikash Saravanan is an AI and Data Science engineer and the Founder of Logic Intelligence Technologies, an independent technology startup focused on autonomous systems and full-stack architecture...",
      "image": {
        "@type": "ImageObject",
        "url": "https://www.logicintelligencetechnologies.in/images/founder/vikash-saravanan-profile.webp"
      },
      "worksFor": {
        "@id": "https://www.logicintelligencetechnologies.in/#organization"
      },
      "alumniOf": {
        "@type": "CollegeOrUniversity",
        "name": "Rathinam Technical Campus",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Coimbatore",
          "addressRegion": "Tamil Nadu",
          "addressCountry": "IN"
        }
      },
      "knowsAbout": [
        "Python",
        "JavaScript",
        "TypeScript",
        "SQL",
        "HTML5",
        "CSS3",
        "FastAPI",
        "Node.js",
        "REST API design",
        "Structured backend architecture",
        "React.js",
        "Next.js",
        "Tailwind CSS",
        "Supabase",
        "PostgreSQL",
        "Vercel",
        "Git",
        "GitHub",
        "Playwright",
        "Headless browser orchestration",
        "Robotic Process Automation",
        "LLM API integration"
      ],
      "sameAs": [
        "https://vikashsaravanann.github.io/startupwithvikash/",
        "https://www.linkedin.com/in/vikash-saravanan-j7528/",
        "https://github.com/vikashsaravanann",
        "https://www.instagram.com/vikash.saravanann",
        "https://www.logicintelligencetechnologies.in/"
      ]
    }
  ]
}
```

## Maintenance
To update the `knowsAbout` fields, edit the `expertise` array in `src/config/founder.ts`. The schema will dynamically compile and map these attributes into the generated JSON-LD.
