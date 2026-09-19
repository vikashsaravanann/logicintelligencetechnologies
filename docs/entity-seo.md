# Entity SEO & Knowledge Graph Mapping

## Entity Map Definition

The following JSON-LD structure represents the strict semantic relationships of the Logic Intelligence Technologies entity graph. This ensures search engines and AI models accurately understand the corporate structure.

```json
{
  "@context": "https://schema.org",
  "@type": "Corporation",
  "name": "Logic Intelligence Technologies Pvt. Ltd.",
  "alternateName": "Logic Intelligence Technologies",
  "founder": {
    "@type": "Person",
    "name": "Vikash Saravanan"
  },
  "location": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Coimbatore",
      "addressRegion": "Tamil Nadu",
      "addressCountry": "India"
    }
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91 9342877474",
    "email": [
      "hello@logicintelligencetechnologies.in",
      "contact@logicintelligencetechnologies.in",
      "support@logicintelligencetechnologies.in",
      "admin@logicintelligencetechnologies.in"
    ]
  },
  "owns": [
    {
      "@type": "Product",
      "name": "AI Website Agents"
    },
    {
      "@type": "Product",
      "name": "AI Voice Agents"
    },
    {
      "@type": "Product",
      "name": "VoiceShield",
      "description": "An AI security product by Logic Intelligence Technologies. It is not a separate company."
    }
  ]
}
```

*(Note: This structured data explicitly defines the relationship between the organization, founder, and products, continuously reinforcing that VoiceShield is a product.)*
