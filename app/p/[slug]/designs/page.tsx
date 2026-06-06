// app/p/[slug]/designs/page.tsx
import { supabaseAdmin } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ShowroomClient from "./ShowroomClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data, error } = await supabaseAdmin
    .from("client_showrooms")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Design Showroom" };

  return {
    title: `Designs for ${data.business_name}`,
    description: `A personalised design showcase prepared for ${data.client_name}.`,
    robots: { index: false, follow: false }, // keep client showrooms private from search
  };
}

export default async function ShowroomPage({ params }: Props) {
  const { slug } = await params;

  const { data: showroom, error } = await supabaseAdmin
    .from("client_showrooms")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !showroom) notFound();

  return <ShowroomClient showroom={showroom} />;
}
