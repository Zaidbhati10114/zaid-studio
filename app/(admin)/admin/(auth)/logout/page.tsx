"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 flex h-screen w-52 flex-col border-r border-border/50 bg-card/20 p-4">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-2 px-2 pt-2 text-sm font-semibold">
          Zaid Studio
          <span className="size-1.5 rounded-full bg-blue-500" />
        </div>

        {/* Nav */}
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

        {/* Bottom */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/8 transition-colors"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-52 flex-1 p-8">{children}</main>
    </div>
  );
}
