import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deployment & Infrastructure Status — Lalita Kapilavai",
  description: "Live system architecture, runtime environments, and database diagnostic matrix.",
};

export default function DeployDiagnosticsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-stone-950">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row items-center gap-12 my-auto">
        <div className="flex-1 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium w-fit border border-border">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Infrastructure Initialized & Online
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight tracking-tight">
            System & Deployment{" "}
            <span className="text-primary underline decoration-primary/40 underline-offset-8">
              Diagnostics
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Live container runtime, PostgreSQL vector embedding engine, and standalone Next.js 16 cluster status.
          </p>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Return to Home
            </Link>
            <Link
              href="/admin/login"
              className="px-4 py-2 rounded-md border border-border bg-card text-foreground font-medium text-sm hover:border-primary transition-colors"
            >
              Admin Control Center
            </Link>
          </div>
        </div>

        {/* Traditional Visual Framing Card */}
        <div className="w-full max-w-md lg:max-w-sm rounded-xl p-6 bg-card border-2 border-primary/40 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <span className="text-[11px] uppercase tracking-widest text-primary font-semibold">
            Digital Archive Status
          </span>
          <h4 className="text-lg font-serif font-bold text-foreground mt-1">
            System & Database Matrix
          </h4>
          <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
            <li className="flex justify-between py-1 border-b border-border/50">
              <span>Framework:</span>
              <span className="font-mono text-foreground">Next.js 16.3 (App Router)</span>
            </li>
            <li className="flex justify-between py-1 border-b border-border/50">
              <span>UI Runtime:</span>
              <span className="font-mono text-foreground">React 19.2</span>
            </li>
            <li className="flex justify-between py-1 border-b border-border/50">
              <span>Styling:</span>
              <span className="font-mono text-foreground">Tailwind CSS v4</span>
            </li>
            <li className="flex justify-between py-1 border-b border-border/50">
              <span>Database:</span>
              <span className="font-mono text-foreground">PostgreSQL 17 + pgvector</span>
            </li>
            <li className="flex justify-between py-1 border-b border-border/50">
              <span>Containerization:</span>
              <span className="font-mono text-foreground">Multi-stage Debian Bookworm</span>
            </li>
            <li className="flex justify-between py-1">
              <span>Deployment:</span>
              <span className="font-mono text-foreground">Coolify Automated VPS</span>
            </li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
