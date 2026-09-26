import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { DynamicPageSections } from "@/components/public/dynamic-page-sections";
import { DynamicFormBlock } from "@/components/public/blocks/dynamic-form-block";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.systemSetting.findFirst();
  const siteName = settings?.siteName || "SavazAI WebApps";

  return {
    title: `Commissions & Contact — ${siteName}`,
    description:
      "Direct correspondence and bespoke artwork commissioning with the atelier desk.",
  };
}

export default async function CommissionPage() {
  const [pageData, settings] = await Promise.all([
    prisma.page
      .findFirst({
        where: {
          slug: { in: ["commission", "contact"] },
          isActive: true,
          isDeleted: false,
        },
        orderBy: { updatedAt: "desc" },
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
    prisma.systemSetting.findFirst(),
  ]);

  const hasSections = pageData && pageData.sections && pageData.sections.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-12">
        {hasSections ? (
          <DynamicPageSections sections={pageData.sections} />
        ) : (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <DynamicFormBlock
              formTitle={pageData?.title || "Contact Us"}
              formSubtitle={
                pageData?.metaDescription ||
                `Direct correspondence with the atelier desk of ${settings?.siteName || "SavazAI WebApps"}.`
              }
              submitButtonText="Submit Inquiry"
              pageSlug="commission"
              fields={[
                {
                  id: "name",
                  label: "Full Name",
                  type: "text",
                  required: true,
                  placeholder: "e.g. Smt. Gayatri Iyer",
                },
                {
                  id: "email",
                  label: "Email Address",
                  type: "email",
                  required: true,
                  placeholder: "curator@example.com",
                },
                {
                  id: "phone",
                  label: "Phone / WhatsApp",
                  type: "tel",
                  required: false,
                  placeholder: "+91 98450 12345",
                },
                {
                  id: "inquiry_type",
                  label: "Inquiry Type",
                  type: "select",
                  required: false,
                  placeholder: "Select an option",
                  options: [
                    "Artwork Acquisition",
                    "Commission Work",
                    "Private Viewing / RSVP",
                    "Carnatic Music Recital",
                    "General Curatorial Question",
                  ],
                },
                {
                  id: "message",
                  label: "Message / Commentary",
                  type: "textarea",
                  required: true,
                  placeholder: "Specify masterwork inquiries, dimensions, or bespoke requirements...",
                },
              ]}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
