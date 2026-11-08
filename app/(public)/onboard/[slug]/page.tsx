import { notFound } from "next/navigation";
import OnboardingClient from "./OnboardingClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicOnboardingPage({ params }: Props) {
  const { slug } = await params;
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let form = null;
  try {
    const res = await fetch(`${base}/api/onboarding/${slug}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      form = data.form;
    }
  } catch {
    // If internal fetch fails during build/ssr, will fallback below
  }

  // If SSR internal fetch was not reachable, load directly from repository
  if (!form) {
    const { getOnboardingFormBySlug } = await import(
      "@/lib/repositories/onboarding"
    );
    const dbForm = await getOnboardingFormBySlug(slug);
    if (!dbForm || dbForm.status === "archived") {
      notFound();
    }
    form = {
      id: dbForm.id,
      slug: dbForm.slug,
      client_name: dbForm.client_name,
      client_email: dbForm.client_email,
      project_title: dbForm.project_title,
      title: dbForm.title,
      description: dbForm.description,
      fields: dbForm.fields,
      status: dbForm.status,
    };
  }

  return <OnboardingClient form={form} slug={slug} />;
}
