import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";

import "./globals.css";
import PortfolioShell from "./components/PorfolioShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://zaid-studio.vercel.app"),
  title: {
    default: "Zaid Studio | Full Stack Development",
    template: "%s | Zaid Studio",
  },
  description:
    "Zaid Studio builds fast, scalable web apps, SaaS products, and AI-powered tools for startups and businesses. Get an AI-powered project proposal in 30 seconds.",
  keywords: [
    "full stack developer india",
    "web app development india",
    "saas development",
    "next.js developer",
    "react developer india",
    "freelance developer india",
    "hire developer india",
    "web development studio",
    "ai powered tools",
    "zaid studio",
  ],
  authors: [
    { name: "Mohammad Zaid Bhati", url: "https://zaid-studio.vercel.app" },
  ],
  creator: "Mohammad Zaid Bhati",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://zaid-studio.vercel.app",
    siteName: "Zaid Studio",
    title: "Zaid Studio | Full Stack Development",
    description:
      "We build fast, scalable web apps, SaaS products, and AI-powered tools for startups and businesses.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Zaid Studio — Full Stack Development",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zaid Studio | Full Stack Development",
    description:
      "We build fast, scalable web apps, SaaS products, and AI-powered tools for startups and businesses.",
    images: ["/opengraph-image"],
    creator: "@zaidbhati07",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "IFsjJPFYC6Ogb_Mm3a-VtlAYtw48KaUFfr31DG1pODM",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body
        className="min-h-screen antialiased"
        style={{
          backgroundColor: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PortfolioShell>{children}</PortfolioShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
