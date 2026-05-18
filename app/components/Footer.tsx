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
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              Zaid Studio
              <span className="size-1.5 rounded-full bg-blue-500" />
            </div>

            <p className="max-w-[240px] text-sm leading-relaxed text-muted-foreground">
              Building digital products for ambitious startups and businesses.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-2 md:gap-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Navigation
            </p>

            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Connect */}
          <div className="flex flex-col gap-2 md:gap-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Connect
            </p>

            <a
              href="mailto:zaidbhati7007@gmail.com"
              className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="size-3.5" />
              <span>zaidbhati7007@gmail.com</span>
            </a>

            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-md border border-border/50 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="size-3.5" />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-md border border-border/50 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Linkedin className="size-3.5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 opacity-50" />

        {/* Bottom */}
        <div className="flex flex-col gap-4 border-t border-border/40 pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs text-muted-foreground">
            © 2026 Zaid Studio. All rights reserved.
          </p>

          <div className="flex items-center justify-center gap-4 sm:justify-start">
            <Link
              href="/terms"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms & Conditions
            </Link>

            <Link
              href="/privacy"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
