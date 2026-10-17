"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu as MenuIcon, Shield } from "lucide-react";
import { Sidebar } from "@/components/admin/sidebar";
import { AdminPortalConfig, DEFAULT_ADMIN_CONFIG } from "@/lib/admin-config";
import { adminFetch, AdminSessionExpiredError } from "@/lib/admin-fetch";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [adminConfig, setAdminConfig] = React.useState<AdminPortalConfig>(DEFAULT_ADMIN_CONFIG);

  React.useEffect(() => {
    let ignore = false;

    const fetchPortalSettings = async () => {
      try {
        const [settingsData, copyData] = await Promise.all([
          adminFetch<{ logoUrl?: string | null }>("/api/admin/settings"),
          adminFetch<AdminPortalConfig>("/api/admin/settings/copy"),
        ]);
        if (!ignore) {
          if (settingsData?.logoUrl) setLogoUrl(settingsData.logoUrl);
          if (copyData) setAdminConfig(copyData);
        }
      } catch (err) {
        if (err instanceof AdminSessionExpiredError) return;
        // Non-blocking
      }
    };

    fetchPortalSettings();

    const handleConfigUpdate = () => {
      fetchPortalSettings();
    };

    window.addEventListener("adminConfigUpdated", handleConfigUpdate);
    return () => {
      ignore = true;
      window.removeEventListener("adminConfigUpdated", handleConfigUpdate);
    };
  }, []);

  const brandTitle = adminConfig.sidebarBrandTitle || DEFAULT_ADMIN_CONFIG.sidebarBrandTitle;

  return (
    <div className="admin-scope min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <Sidebar
        logoUrl={logoUrl}
        config={adminConfig}
        className="hidden lg:flex w-64"
      />

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
                        alt={brandTitle}
                        className="h-6 w-auto max-w-[90px] object-contain rounded"
                      />
                    ) : (
                      <Shield className="w-4 h-4 text-primary" />
                    )}
                    <span>{brandTitle} Admin</span>
                  </SheetTitle>
                </SheetHeader>
                <Sidebar
                  logoUrl={logoUrl}
                  config={adminConfig}
                  onItemClick={() => setMobileOpen(false)}
                  className="flex-1 border-r-0"
                />
              </SheetContent>
            </Sheet>

            <h1 className="text-base sm:text-lg font-serif font-bold text-foreground truncate">
              {adminConfig.dashboardTitle || DEFAULT_ADMIN_CONFIG.dashboardTitle}
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
