import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Github, Linkedin, Mail } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/get-quote", label: "Get a Quote" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              Zaid Studio
              <span className="size-1.5 rounded-full bg-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              Building digital products for ambitious startups and businesses.
            </p>
          </div>

          {/* Nav */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Navigation
            </p>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Connect */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Connect
            </p>
            <a
              href="mailto:zaidbhati7007@gmail.com"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              <Mail className="size-3.5" />
              zaidbhati7007@gmail.com
            </a>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-md border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="size-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-md border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="size-3.5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 opacity-50" />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © 2026 Zaid Studio. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js + Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}