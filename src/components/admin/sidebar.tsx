"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Palette,
  FolderTree,
  Calendar,
  Users,
  Menu as MenuIcon,
  FileText,
  BookOpen,
  Library,
  Settings,
  LogOut,
  Shield,
  ExternalLink,
  UserCog,
} from "lucide-react";
import { AdminPortalConfig, DEFAULT_ADMIN_CONFIG } from "@/lib/admin-config";

export interface NavItemDef {
  id: string;
  defaultLabel: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  superAdminOnly?: boolean;
}

export const ADMIN_NAV_ITEMS: NavItemDef[] = [
  { id: "overview", defaultLabel: "Overview", href: "/admin", icon: LayoutDashboard },
  { id: "pages", defaultLabel: "Page Layouts", href: "/admin/pages", icon: FileText },
  { id: "navigation", defaultLabel: "Navigation Menus", href: "/admin/navigation", icon: MenuIcon },
  { id: "posts", defaultLabel: "Blogs & AEO Posts", href: "/admin/posts", icon: BookOpen },
  { id: "categories", defaultLabel: "Categories", href: "/admin/categories", icon: FolderTree },
  { id: "artworks", defaultLabel: "Artwork Catalog", href: "/admin/artworks", icon: Palette },
  { id: "catalogs", defaultLabel: "e-Catalogs", href: "/admin/catalogs", icon: Library },
  { id: "events", defaultLabel: "Exhibitions & Events", href: "/admin/events", icon: Calendar },
  { id: "leads", defaultLabel: "Leads & QR Scans", href: "/admin/leads", icon: Users },
  { id: "settings", defaultLabel: "System Settings", href: "/admin/settings", icon: Settings },
  { id: "users", defaultLabel: "User Administration", href: "/admin/users", icon: UserCog, superAdminOnly: true },
];

interface SidebarProps {
  logoUrl?: string | null;
  config?: AdminPortalConfig;
  onItemClick?: () => void;
  className?: string;
}

export function Sidebar({
  logoUrl,
  config = DEFAULT_ADMIN_CONFIG,
  onItemClick,
  className = "",
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

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

  const brandTitle = config.sidebarBrandTitle || DEFAULT_ADMIN_CONFIG.sidebarBrandTitle;
  const brandSubtitle = config.sidebarBrandSubtitle || DEFAULT_ADMIN_CONFIG.sidebarBrandSubtitle;

  return (
    <aside className={`flex flex-col border-r border-border bg-card/60 shrink-0 ${className}`}>
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-border flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brandTitle}
              className="h-8 w-auto max-w-[100px] object-contain rounded"
            />
          ) : (
            <div className="w-8 h-8 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-serif font-bold text-sm leading-tight text-foreground">
              {brandTitle}
            </span>
            <span className="text-[10px] text-primary uppercase tracking-widest font-semibold">
              {brandSubtitle}
            </span>
          </div>
        </Link>
      </div>

      {/* Dynamic Navigation list */}
      <nav className="flex flex-col gap-1.5 p-4 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
          Platform Management
        </div>
        {ADMIN_NAV_ITEMS.filter((item) => !item.superAdminOnly || isSuperAdmin).map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          const label = config.sidebarLabels?.[item.id] || item.defaultLabel;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
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
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

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
  );
}
