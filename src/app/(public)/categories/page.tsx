import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Palette } from "lucide-react";
import { DynamicPageSections } from "@/components/public/dynamic-page-sections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sacred Art Disciplines & Schools — Lalita Kapilavai",
  description:
    "Explore classical South Indian artistic disciplines spanning Thanjavur 22k gold foil embossments, Mysore traditional paintings, temple murals, and Carnatic music traditions.",
};

export default async function CategoriesPage() {
  const [categories, pageData] = await Promise.all([
    prisma.artCategory.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        _count: {
          select: { artworks: true },
        },
      },
    }),
    prisma.page
      .findUnique({
        where: { slug: "categories" },
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
      })
      .catch(() => null),
  ]);

  const headerTitle = pageData?.title || "Traditional Art Disciplines";
  const headerSubtitle =
    pageData?.metaDescription ||
    "Explore classical South Indian artistic disciplines spanning Thanjavur 22k gold foil embossments, Mysore traditional paintings, temple murals, and Carnatic music traditions.";

  const hasCustomSections = pageData?.sections && pageData.sections.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      {/* Dynamic Page Builder Sections or Fallback Header */}
      {hasCustomSections ? (
        <DynamicPageSections sections={pageData.sections} />
      ) : (
        <div className="text-center max-w-2xl mx-auto pt-12 sm:pt-16 pb-6 px-4 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Heritage Lineage &amp; Schools
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground">
            {headerTitle}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {headerSubtitle}
          </p>
        </div>
      )}

      {/* Categories Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/gallery/${cat.slug}`} className="group block">
              <Card className="hover:border-primary/60 transition-all flex flex-col justify-between h-full shadow-sm hover:shadow-xl relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Palette className="w-4 h-4" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {cat._count.artworks} {cat._count.artworks === 1 ? "Artwork" : "Artworks"}
                    </Badge>
                  </div>

                  <CardTitle className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors mt-3">
                    {cat.name}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-3 leading-relaxed mt-1 text-muted-foreground">
                    {cat.description || "Classical South Indian artistic discipline and sacred lineage."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
