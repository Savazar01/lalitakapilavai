import type { Metadata } from "next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { Sparkles, Palette } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fine Art Gallery & Tanjore Archive — Lalita Kapilavai",
  description:
    "Explore authentic 22k gold foil Tanjore paintings, classical Mysore traditional art, and sacred Indian iconography by Lalita Kapilavai.",
};

export default async function GalleryPage() {
  const firstCategory = await prisma.artCategory.findFirst({
    orderBy: { displayOrder: "asc" },
  });

  if (firstCategory) {
    redirect(`/gallery/${firstCategory.slug}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full text-center space-y-4">
        <Palette className="w-12 h-12 text-primary/60 mx-auto" />
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Atelier Archive Initializing
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          No art categories are currently configured in the archive database. Please add a category via the Admin Studio.
        </p>
      </main>
      <Footer />
    </div>
  );
}
