import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Zaid Studio is run by Mohammad Zaid Bhati — a full stack developer with 3+ years of experience building products that serve real users at scale.",
  openGraph: {
    title: "About Zaid Studio",
    description:
      "Zaid Studio is run by Mohammad Zaid Bhati — a full stack developer with 3+ years of experience building enterprise-grade products.",
    url: "https://zaid-studio.vercel.app/about",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Zaid Studio",
    images: ["/opengraph-image"],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
