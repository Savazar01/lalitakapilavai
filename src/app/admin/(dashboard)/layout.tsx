"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Palette,
  FolderTree,
  Calendar,
  Users,
  Menu as MenuIcon,
  FileText,
  BookOpen,
  Settings,
  LogOut,
  Shield,
  ExternalLink,
  UserCog,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  superAdminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Page Layouts", href: "/admin/pages", icon: FileText },
  { label: "Navigation Menus", href: "/admin/navigation", icon: MenuIcon },
  { label: "Blogs & AEO Posts", href: "/admin/posts", icon: BookOpen },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Artwork Catalog", href: "/admin/artworks", icon: Palette },
  { label: "Exhibitions & Events", href: "/admin/events", icon: Calendar },
  { label: "Leads & QR Scans", href: "/admin/leads", icon: Users },
  { label: "System Settings", href: "/admin/settings", icon: Settings },
  { label: "User Administration", href: "/admin/users", icon: UserCog, superAdminOnly: true },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.logoUrl) setLogoUrl(data.logoUrl);
      })
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign-out error:", err);
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  const isSuperAdmin = (session?.user as { role?: string } | undefined)?.role === "SUPER_ADMIN";

  const navContent = (
    <nav className="flex flex-col gap-1.5 p-4 flex-1">
      <div className="px-3 py-2 text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
        Platform Management
      </div>
      {navItems
        .filter((item) => !item.superAdminOnly || isSuperAdmin)
        .map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/15 text-primary font-semibold border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card/60 shrink-0">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-border flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Lalita Kapilavai"
                className="h-8 w-auto max-w-[100px] object-contain rounded"
              />
            ) : (
              <div className="w-8 h-8 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm leading-tight text-foreground">
                Lalita Kapilavai
              </span>
              <span className="text-[10px] text-primary uppercase tracking-widest font-semibold">
                Control Center
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        {navContent}

        {/* User Card & Logout */}
        <div className="p-4 border-t border-border mt-auto flex flex-col gap-2 bg-card/80">
          <Link
            href="/admin/profile"
            className="flex items-center justify-between p-1.5 -m-1.5 rounded-md hover:bg-muted/50 transition-colors group"
            title="Manage Profile & Security"
          >
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {session?.user?.name || "Superadmin"}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {session?.user?.email || "admin@lalitakapilavai.com"}
              </span>
            </div>
            <Badge variant="gold" className="text-[10px] uppercase">
              {(session?.user as { role?: string } | undefined)?.role || "SUPER_ADMIN"}
            </Badge>
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live Site
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-6 border-b border-border bg-card/40 backdrop-blur-sm flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {/* Mobile Sheet Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden h-9 w-9"
                  aria-label="Open Navigation Menu"
                >
                  <MenuIcon className="h-4 w-4 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 flex flex-col">
                <SheetHeader className="p-4 border-b border-border">
                  <SheetTitle className="flex items-center gap-2">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Lalita Kapilavai"
                        className="h-6 w-auto max-w-[90px] object-contain rounded"
                      />
                    ) : (
                      <Shield className="w-4 h-4 text-primary" />
                    )}
                    <span>Lalita Kapilavai Admin</span>
                  </SheetTitle>
                </SheetHeader>
                {navContent}
              </SheetContent>
            </Sheet>

            <h1 className="text-base sm:text-lg font-serif font-bold text-foreground truncate">
              Archive & Platform Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
