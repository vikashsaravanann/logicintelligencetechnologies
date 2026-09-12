import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import FloatingElements from "@/components/motion/floating-elements";
import { getProjectBySlug, portfolioProjects } from "@/data/portfolioData";
import { testimonials } from "@/data/testimonialsData";

import CaseStudyContent from "./case-study-content";

export function generateStaticParams() {
  return portfolioProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };

  const ogUrl = `/api/og?title=${encodeURIComponent(project.title)}&type=case-study&category=${encodeURIComponent(project.category)}`;

  return {
    title: `${project.title} | Case Study`,
    description: project.description,
    openGraph: {
      title: `${project.title} | Logic Intelligence Technologies`,
      description: project.description,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | Logic Intelligence Technologies`,
      description: project.description,
      images: [ogUrl],
    },
  };
}

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const linkedTestimonial = project.testimonialId
    ? testimonials.find((t) => t.id === project.testimonialId)
    : undefined;

  return <CaseStudyContent project={project} linkedTestimonial={linkedTestimonial} />;
}
