import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Free Quote",
  description:
    "Get a personalized AI-generated project proposal in under 30 seconds. Detailed quote with timeline, deliverables, tech stack, and cost estimate.",
  openGraph: {
    title: "Get a Free Project Quote | Zaid Studio",
    description:
      "Get a personalized AI-generated project proposal in under 30 seconds — timeline, deliverables, tech stack, and cost included.",
    url: "https://zaid-studio.vercel.app/get-quote",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get a Free Project Quote | Zaid Studio",
    images: ["/opengraph-image"],
  },
};

export default function GetQuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
