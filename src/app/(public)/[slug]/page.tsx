import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { DynamicPageSections } from "@/components/public/dynamic-page-sections";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

// Cached database page query
const getPageBySlug = cache(async (slug: string) => {
  return await prisma.page.findUnique({
    where: { slug },
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
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: "Page Not Found — Lalita Kapilavai",
    };
  }

  return {
    title: `${page.title} — Lalita Kapilavai`,
    description:
      page.metaDescription ||
      "Sacred Tanjore gold leaf paintings, Mysore classical fine art, and Carnatic music archives.",
  };
}

export default async function DynamicPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  // If page does not exist or unpublished, trigger 404
  if (!page || !page.isPublished) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Dynamic Header */}
      <Navbar />

      {/* Main Dynamic 12-Column Layout Engine */}
      <main className="flex-1">
        <DynamicPageSections sections={page.sections} />
      </main>

      {/* Dynamic Footer */}
      <Footer />
    </div>
  );
}
