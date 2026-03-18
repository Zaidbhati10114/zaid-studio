"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  if (!pathname || pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const navContent = (
    <>
      <div className="mb-6 flex items-center gap-2 px-2 pt-2 text-sm font-semibold">
        Zaid Studio
        <span className="size-1.5 rounded-full bg-blue-500" />
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Management
        </p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === item.href
                ? "bg-blue-500/10 text-blue-500"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/8"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div
      className="min-h-screen bg-background"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <div className="lg:hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold">
            Zaid Studio
            <span className="size-1.5 rounded-full bg-blue-500" />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <button className="inline-flex size-10 items-center justify-center rounded-xl border border-border/60 bg-card/50 text-foreground transition-colors hover:bg-secondary/50">
                <Menu className="size-4" />
                <span className="sr-only">Open navigation menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-xs border-r border-border/50 bg-background p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Admin navigation</SheetTitle>
                <SheetDescription>Open dashboard links and account actions.</SheetDescription>
              </SheetHeader>
              <div className="flex h-full flex-col p-4">{navContent}</div>
            </SheetContent>
          </Sheet>
        </header>
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-52 shrink-0 border-r border-border/50 bg-card/20 p-4 lg:flex lg:flex-col">
          {navContent}
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
