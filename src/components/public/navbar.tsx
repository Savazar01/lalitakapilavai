import Link from "next/link";
import prisma from "@/lib/prisma";
import { MenuPosition } from "@prisma/client";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronDown, Menu as MenuIcon, Sparkles } from "lucide-react";
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
              {settings?.siteName ? settings.siteName.split("—")[0].trim() : "Lalita Kapilavai"}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Sacred Art &amp; Carnatic Archive
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
                  {item.children.map((sub) => (
                    <DropdownMenuItem key={sub.id} asChild>
                      <Link
                        href={sub.path}
                        target={sub.openInNewTab ? "_blank" : undefined}
                        className="flex flex-col items-start px-3 py-2 rounded text-xs font-serif text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                      >
                        <span className="font-semibold">{sub.label}</span>
                        {sub.children && sub.children.length > 0 && (
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            {sub.children.map((c) => c.label).join(", ")}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
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
                  Lalita Kapilavai
                </SheetTitle>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Archive Navigation
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
                          <Link
                            key={child.id}
                            href={child.path}
                            className="block px-3 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40"
                          >
                            {child.label}
                          </Link>
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
