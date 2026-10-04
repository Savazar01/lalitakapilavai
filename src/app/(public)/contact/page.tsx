import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { DynamicPageSections } from "@/components/public/dynamic-page-sections";
import { DynamicFormBlock } from "@/components/public/blocks/dynamic-form-block";
import { Mail, Phone, MapPin, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.systemSetting.findFirst();
  const siteName = settings?.siteName || "SavazAI WebApps";

  return {
    title: `Contact & Inquiries — ${siteName}`,
    description:
      "Direct correspondence, artwork acquisitions, private exhibition viewings, and general inquiries.",
  };
}

export default async function ContactPage() {
  const [pageData, settings] = await Promise.all([
    prisma.page
      .findFirst({
        where: {
          slug: "contact",
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
  const contactEmail = (settings?.contactEmail || "").trim();
  const contactPhone = (settings?.contactPhone || "").trim();
  const formSecurity = (settings?.formSecurityConfig as Record<string, unknown> | null) || {};
  const contactSecurity = (formSecurity.contactForm as Record<string, unknown> | undefined) || {};
  const enableCaptcha = Boolean(contactSecurity.enableCaptcha);
  const enableEmailOtp = Boolean(contactSecurity.enableEmailOtp);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1 w-full py-8 sm:py-14">
        {hasSections ? (
          <DynamicPageSections
            sections={pageData.sections}
            enableCaptcha={enableCaptcha}
            enableEmailOtp={enableEmailOtp}
          />
        ) : (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-serif font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                Atelier Communications &amp; Archival Desk
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground tracking-tight">
                {pageData?.title || "Get in Touch"}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                {pageData?.metaDescription ||
                  "We welcome inquiries regarding curatorial acquisitions, exhibition viewings, masterwork provenance, and bespoke commissions."}
              </p>
            </div>

            {/* Content Grid: Contact Details + Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Direct Inquiries */}
              <div className="space-y-6 lg:col-span-1">
                <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-5">
                  <h3 className="font-serif font-bold text-base text-foreground tracking-tight">
                    Direct Atelier Contacts
                  </h3>

                  <div className="space-y-4 text-xs text-muted-foreground">
                    {contactEmail && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Email Correspondence</p>
                          <a
                            href={`mailto:${contactEmail}`}
                            className="hover:text-primary transition-colors break-all"
                          >
                            {contactEmail}
                          </a>
                        </div>
                      </div>
                    )}

                    {contactPhone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Studio Telephone</p>
                          <a
                            href={`tel:${contactPhone}`}
                            className="hover:text-primary transition-colors"
                          >
                            {contactPhone}
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Archive &amp; Studio</p>
                        <p className="leading-relaxed">
                          Visits scheduled exclusively via advance private appointment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-xs text-muted-foreground leading-relaxed">
                  <p className="font-serif font-bold text-amber-900 dark:text-amber-300 mb-1">
                    Museum &amp; Curatorial Inquiries
                  </p>
                  <p>
                    All messages submitted through this portal are directly reviewed by the curatorial team with full data privacy protection.
                  </p>
                </div>
              </div>

              {/* Right Column: Dynamic Form */}
              <div className="lg:col-span-2">
                <DynamicFormBlock
                  formTitle="Direct Inquiry Form"
                  formSubtitle="Please provide your contact details and message. We will respond promptly."
                  pageSlug="contact"
                  enableCaptcha={enableCaptcha}
                  enableEmailOtp={enableEmailOtp}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
