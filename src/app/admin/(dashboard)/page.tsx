import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  Calendar,
  Users,
  Database,
  ArrowUpRight,
  Sparkles,
  Music,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    artworkCount,
    categoryCount,
    eventCount,
    leadCount,
    ragaCount,
  ] = await Promise.all([
    prisma.artwork.count().catch(() => 0),
    prisma.artCategory.count().catch(() => 0),
    prisma.event.count().catch(() => 0),
    prisma.lead.count().catch(() => 0),
    prisma.raga.count().catch(() => 0),
  ]);

  const statCards = [
    {
      title: "Artworks Catalog",
      value: artworkCount,
      description: `${categoryCount} Traditional art categories`,
      icon: Palette,
      href: "/admin/artworks",
      badge: "Tanjore & Mysore",
    },
    {
      title: "Exhibitions & Events",
      value: eventCount,
      description: "Workshops & gallery recitals",
      icon: Calendar,
      href: "/admin/events",
      badge: "Active",
    },
    {
      title: "Inbound Leads & QR CRM",
      value: leadCount,
      description: "Gallery inquiries & collector requests",
      icon: Users,
      href: "/admin/leads",
      badge: "CRM",
    },
    {
      title: "Carnatic Ragas & Music",
      value: ragaCount,
      description: "Synesthetic cultural graph nodes",
      icon: Music,
      href: "/admin/music",
      badge: "pgvector",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Administrative Overview
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
              Welcome to Lalita Kapilavai Archive
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Manage your sacred artwork catalog with 22k gold specifications,
              dynamic watermarked assets, exhibitions, physical QR scan leads, and
              Carnatic music synesthetic models.
            </p>
          </div>
          <Badge variant="gold" className="shrink-0 text-xs px-3 py-1">
            PostgreSQL 17 :5633 • Web :3060
          </Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="hover:border-primary/60 transition-all hover:shadow-md h-full cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    {card.title}
                  </CardTitle>
                  <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif font-bold text-foreground">
                    {card.value}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                    <Badge variant="outline" className="text-[10px]">
                      {card.badge}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* System Status Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">System Health & Services</CardTitle>
              <Badge variant="gold" className="text-[10px]">Operational</Badge>
            </div>
            <CardDescription className="text-xs">
              Live configuration status of containerized services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-border/60">
                <span className="text-muted-foreground">Database Port:</span>
                <span className="font-mono font-semibold text-foreground">Host 5633 &rarr; Container 5432</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/60">
                <span className="text-muted-foreground">Vector Extension:</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">pgvector 0.8.2 Active</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/60">
                <span className="text-muted-foreground">Web Application Port:</span>
                <span className="font-mono font-semibold text-foreground">3060</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/60">
                <span className="text-muted-foreground">Authentication Engine:</span>
                <span className="font-mono font-semibold text-foreground">Better-Auth (Private RBAC)</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Public Self-Registration:</span>
                <span className="font-mono font-semibold text-destructive">Disabled (Security Enforced)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Quick Operations</CardTitle>
              <Database className="w-4 h-4 text-primary" />
            </div>
            <CardDescription className="text-xs">
              Direct access to common curation tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            <Link
              href="/admin/artworks"
              className="flex items-center justify-between p-3 rounded-md bg-secondary/50 hover:bg-secondary border border-border/60 text-foreground font-medium transition-colors"
            >
              <span>Add New Tanjore or Mysore Artwork</span>
              <ArrowUpRight className="w-4 h-4 text-primary" />
            </Link>
            <Link
              href="/admin/events"
              className="flex items-center justify-between p-3 rounded-md bg-secondary/50 hover:bg-secondary border border-border/60 text-foreground font-medium transition-colors"
            >
              <span>Schedule Classical Concert or Exhibition</span>
              <ArrowUpRight className="w-4 h-4 text-primary" />
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center justify-between p-3 rounded-md bg-secondary/50 hover:bg-secondary border border-border/60 text-foreground font-medium transition-colors"
            >
              <span>Configure Watermark Text & Cloudflare R2 Keys</span>
              <ArrowUpRight className="w-4 h-4 text-primary" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
