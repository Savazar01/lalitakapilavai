import Link from "next/link";
import prisma from "@/lib/prisma";
import { MenuPosition } from "@prisma/client";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronDown, ChevronRight, Menu as MenuIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  // Fetch settings and active menu items for Top Center and Top Right
  const [settings, centerItems, rightItems, drawerItems] = await Promise.all([
    prisma.systemSetting.findFirst().catch(() => null),
    prisma.menuItem.findMany({
      where: { position: MenuPosition.TOP_CENTER, parentId: null, isActive: true },
      orderBy: { orderIndex: "asc" },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { orderIndex: "asc" },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    }),
    prisma.menuItem.findMany({
      where: { position: MenuPosition.TOP_RIGHT, parentId: null, isActive: true },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.menuItem.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { orderIndex: "asc" },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { orderIndex: "asc" },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    }),
  ]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-colors duration-300">
      {/* Top Gold Accent Border */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.siteName || "Lalita Kapilavai"}
              className="h-11 w-auto max-w-[160px] object-contain group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
              {settings?.siteName
                ? settings.siteName.includes("—")
                  ? settings.siteName.split("—")[0].trim()
                  : settings.siteName
                : "Lalita Kapilavai"}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              {settings?.siteName?.includes("—")
                ? settings.siteName.split("—").slice(1).join("—").trim()
                : "Sacred Art & Carnatic Archive"}
            </span>
          </div>
        </Link>

        {/* Desktop Top Center Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {centerItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;

            if (!hasChildren) {
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  target={item.openInNewTab ? "_blank" : undefined}
                  className="px-3.5 py-2 text-sm font-serif font-medium text-foreground/80 hover:text-primary transition-colors rounded-md hover:bg-accent/40"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <DropdownMenu key={item.id}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 px-3.5 py-2 text-sm font-serif font-medium text-foreground/80 hover:text-primary transition-colors rounded-md hover:bg-accent/40 outline-none cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 transition-transform group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 p-1.5 bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-lg"
                >
                  {item.children.map((sub) => {
                    const hasTier3 = sub.children && sub.children.length > 0;

                    if (!hasTier3) {
                      return (
                        <DropdownMenuItem key={sub.id} asChild>
                          <Link
                            href={sub.path}
                            target={sub.openInNewTab ? "_blank" : undefined}
                            className="flex items-center justify-between px-3 py-2 rounded text-xs font-serif text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer w-full"
                          >
                            <span className="font-semibold">{sub.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    }

                    return (
                      <DropdownMenuSub key={sub.id}>
                        <DropdownMenuSubTrigger className="flex items-center justify-between px-3 py-2 rounded text-xs font-serif text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer data-[state=open]:bg-primary/10 data-[state=open]:text-primary">
                          <Link
                            href={sub.path}
                            target={sub.openInNewTab ? "_blank" : undefined}
                            className="font-semibold flex-1 text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {sub.label}
                          </Link>
                          <ChevronRight className="w-3.5 h-3.5 text-primary/70 ml-2 shrink-0" />
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="min-w-[200px] p-1.5 bg-card/95 backdrop-blur-md border border-primary/30 shadow-2xl rounded-lg">
                          <DropdownMenuItem asChild>
                            <Link
                              href={sub.path}
                              className="px-3 py-1.5 text-[11px] font-mono font-bold uppercase text-primary tracking-wider hover:bg-primary/10 rounded cursor-pointer block border-b border-border/40 mb-1"
                            >
                              All {sub.label}
                            </Link>
                          </DropdownMenuItem>
                          {sub.children.map((tier3) => (
                            <DropdownMenuItem key={tier3.id} asChild>
                              <Link
                                href={tier3.path}
                                target={tier3.openInNewTab ? "_blank" : undefined}
                                className="px-3 py-2 rounded text-xs font-serif text-foreground/90 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer block"
                              >
                                {tier3.label}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </nav>

        {/* Right Section: CTA & Theme Toggle & Mobile Menu */}
        <div className="flex items-center gap-3">
          {rightItems.map((item) => (
            <Link key={item.id} href={item.path} className="hidden sm:inline-block">
              <Button variant="gold" size="sm" className="text-xs font-bold shadow-sm">
                {item.label}
              </Button>
            </Link>
          ))}

          <ThemeToggle />

          {/* Mobile Navigation Drawer Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden h-9 w-9"
                aria-label="Toggle Mobile Navigation"
              >
                <MenuIcon className="h-4 w-4 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 flex flex-col">
              <SheetHeader className="p-6 border-b border-border text-left">
                <SheetTitle className="font-serif font-bold text-lg">
                  {settings?.siteName
                    ? settings.siteName.includes("—")
                      ? settings.siteName.split("—")[0].trim()
                      : settings.siteName
                    : "Lalita Kapilavai"}
                </SheetTitle>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {settings?.siteName?.includes("—")
                    ? settings.siteName.split("—").slice(1).join("—").trim()
                    : "Archive Navigation"}
                </span>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {drawerItems.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <Link
                      href={item.path}
                      className="block px-3 py-2 rounded-md font-serif font-semibold text-sm text-foreground hover:bg-accent hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>

                    {item.children && item.children.length > 0 && (
                      <div className="pl-4 space-y-1 border-l-2 border-primary/30 ml-3">
                        {item.children.map((child) => (
                          <div key={child.id} className="space-y-1">
                            <Link
                              href={child.path}
                              className="block px-3 py-1.5 rounded text-xs font-semibold text-foreground/90 hover:text-primary hover:bg-accent/40"
                            >
                              {child.label}
                            </Link>

                            {/* Tier 3 nested children in drawer */}
                            {child.children && child.children.length > 0 && (
                              <div className="pl-3 space-y-1 border-l border-border/80 ml-2">
                                {child.children.map((tier3) => (
                                  <Link
                                    key={tier3.id}
                                    href={tier3.path}
                                    className="block px-2.5 py-1 rounded text-[11px] text-muted-foreground hover:text-primary hover:bg-accent/30"
                                  >
                                    {tier3.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border bg-card/60">
                <Link href="/admin" className="block text-center text-xs text-muted-foreground hover:text-primary">
                  Admin Portal
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
