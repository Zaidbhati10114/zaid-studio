import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Personalized Project Proposal",
  description:
    "Get a personalized project proposal powered by AI and real-world development expertise — including timeline, deliverables, and realistic cost estimates in under 30 seconds.",
  openGraph: {
    title: "Get a Free Project Quote | Zaid Studio",
    description:
      "Get a personalized project proposal powered by AI and real development experience — including timelines, deliverables, and realistic cost estimates.",
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
