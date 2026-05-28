import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Projects and case studies by Zaid Studio — AI tools, SaaS products, e-commerce platforms, and full-stack web applications built by Mohammad Zaid Bhati.",
  openGraph: {
    title: "Work & Case Studies | Zaid Studio",
    description:
      "Projects and case studies — AI tools, SaaS products, and full-stack web applications.",
    url: "https://zaid-studio.vercel.app/work",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Work & Case Studies | Zaid Studio",
    images: ["/opengraph-image"],
  },
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
