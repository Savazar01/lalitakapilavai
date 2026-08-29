import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { AnimatedSection } from "@/components/public/animated-section";
import { TiptapRenderer } from "@/components/public/tiptap-renderer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

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
        {page.sections.map((section) => {
          return (
            <AnimatedSection
              key={section.id}
              className={`w-full relative ${section.customCssClass || ""}`}
              style={{
                backgroundColor: section.backgroundColor || undefined,
                paddingTop: `${48}px`,
                paddingBottom: `${48}px`,
              }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 12-Column CSS Grid Container */}
                <div className="grid grid-cols-12 gap-6 items-start">
                  {section.subSections.map((col) => {
                    const colSpanClass =
                      col.gridSpan === 12
                        ? "col-span-12"
                        : col.gridSpan === 8
                        ? "col-span-12 md:col-span-8"
                        : col.gridSpan === 7
                        ? "col-span-12 md:col-span-7"
                        : col.gridSpan === 6
                        ? "col-span-12 md:col-span-6"
                        : col.gridSpan === 5
                        ? "col-span-12 md:col-span-5"
                        : col.gridSpan === 4
                        ? "col-span-12 md:col-span-4"
                        : col.gridSpan === 3
                        ? "col-span-12 md:col-span-3"
                        : "col-span-12";

                    return (
                      <div key={col.id} className={`${colSpanClass} w-full`}>
                        <TiptapRenderer
                          content={col.content as Record<string, unknown>}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </AnimatedSection>
          );
        })}
      </main>

      {/* Dynamic Footer */}
      <Footer />
    </div>
  );
}
