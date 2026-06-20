// app/work/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCaseStudy, getAllCaseStudies } from "@/lib/case-studies";
import CaseStudyClient from "./CaseStudyClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllCaseStudies().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return { title: "Case Study" };
  return {
    title: `${study.name} — Case Study`,
    description: study.description,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();
  return <CaseStudyClient study={study} />;
}
