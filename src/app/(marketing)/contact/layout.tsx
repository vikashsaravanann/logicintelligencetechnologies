import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Start Your Project | Contact Logic Intelligence Technologies",
  description: "Contact Logic Intelligence Technologies to discuss your next web, app, or custom software project. Based in Coimbatore — serving clients across India.",
  openGraph: {
    title: "Start Your Project | Logic Intelligence Technologies",
    description: "Tell us about your web or software project. We reply within 24 hours with a clear plan and honest pricing.",
    images: [{ url: "/api/og?title=Start%20Your%20Project&category=Contact%20Us", width: 1200, height: 630, alt: "Contact Logic Intelligence Technologies" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Start Your Project | Logic Intelligence Technologies",
    description: "Tell us about your web or software project. We reply within 24 hours with a clear plan and honest pricing.",
    images: ["/api/og?title=Start%20Your%20Project&category=Contact%20Us"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
