import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";

import "./globals.css";
import PortfolioShell from "./components/PorfolioShell";

export const metadata: Metadata = {
  title: "Zaid Studio | Full Stack Development",
  description:
    "Zaid Studio builds fast, scalable web products for startups and businesses. Custom web apps, SaaS products, and AI-powered tools.",
  openGraph: {
    title: "Zaid Studio | Full Stack Development",
    description:
      "We build fast, scalable web products for startups and businesses.",
    type: "website",
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
