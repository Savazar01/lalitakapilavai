import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { DynamicPageSections } from "@/components/public/dynamic-page-sections";
import { Button } from "@/components/ui/button";
import { Sparkles, Palette, Music, BookOpen, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await prisma.page.findFirst({
      where: {
        OR: [{ slug: "home" }, { slug: "index" }],
        isPublished: true,
      },
    });

    if (page) {
      return {
        title: page.title.includes("Lalita Kapilavai")
          ? page.title
          : `${page.title} — Lalita Kapilavai`,
        description:
          page.metaDescription ||
          "Sacred Tanjore 22k gold leaf paintings, Mysore classical fine art, and Carnatic music archives.",
      };
    }
  } catch (error) {
    console.warn("Could not query metadata for home page:", error);
  }

  return {
    title: "Lalita Kapilavai — Sacred Art & Classical Carnatic Music",
    description:
      "Living digital archive of traditional Indian Tanjore paintings with 22k gold foil, Mysore classical fine art, and Carnatic classical vocal recitals.",
  };
}

export default async function HomePage() {
  let homePage = null;

  try {
    homePage = await prisma.page.findFirst({
      where: {
        OR: [{ slug: "home" }, { slug: "index" }],
        isPublished: true,
      },
      include: {
        sections: {
          orderBy: { orderIndex: "asc" },
          include: {
            subSections: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });
  } catch (error) {
    console.warn("Database query for home page failed or tables initializing:", error);
  }

  // 1. If an admin-published dynamic page exists, render via visual builder engine
  if (homePage && homePage.sections.length > 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <Navbar />

        <main className="flex-1">
          <DynamicPageSections sections={homePage.sections} />
        </main>

        <Footer />
      </div>
    );
  }

  // 2. Curated Luxury Default Home Page Fallback
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-stone-950">
      <Navbar />

      <main className="flex-1">
        {/* Luxury Hero Banner */}
        <section className="relative overflow-hidden py-24 sm:py-32 border-b border-border/60 bg-gradient-to-b from-card/80 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Sacred Heritage & Living Fine Art Archive
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
              Preserving Sacred Heritage Through{" "}
              <span className="text-primary underline decoration-primary/40 underline-offset-8">
                22k Gold Foil & Ragas
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              Explore authentic Thanjavur gold embossed paintings, Mysore traditional devotional art, 
              and classical Carnatic music recitals by Lalita Kapilavai.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="font-serif">
                <Link href="/gallery" className="flex items-center gap-2">
                  Explore Art Catalog
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-serif border-border hover:border-primary">
                <Link href="/blogs">Read Sacred Chronicle</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Highlights Showcase */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-card border border-border/80 shadow-sm hover:border-primary/50 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5">
                  <Palette className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-serif font-semibold text-foreground">
                  Tanjore & Mysore Fine Art
                </h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Authentic 22-carat gold foil relief work, semi-precious Jaipur gemstones, and hand-crafted teakwood frames.
                </p>
              </div>
              <Link href="/gallery" className="mt-6 text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
                View Gallery <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-8 rounded-xl bg-card border border-border/80 shadow-sm hover:border-primary/50 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5">
                  <Music className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-serif font-semibold text-foreground">
                  Carnatic Vocal Recitals
                </h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Devotional synesthesia linking traditional iconography to ragas composed by Tyagaraja, Dikshitar, and Syama Sastri.
                </p>
              </div>
              <Link href="/events" className="mt-6 text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
                Upcoming Recitals <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-8 rounded-xl bg-card border border-border/80 shadow-sm hover:border-primary/50 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-serif font-semibold text-foreground">
                  Sacred Chronicle
                </h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Authoritative essays exploring traditional gesso preparation, iconometric talamana, and spiritual symbolism.
                </p>
              </div>
              <Link href="/blogs" className="mt-6 text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
                Read Articles <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
