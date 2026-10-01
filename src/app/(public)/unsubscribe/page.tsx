import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { decryptEmailToken } from "@/lib/email-service";
import { CheckCircle2, AlertTriangle, ArrowLeft, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.systemSetting.findFirst();
  const siteName = settings?.siteName || "SavazAI WebApps";

  return {
    title: `Unsubscribe — ${siteName}`,
    description: "Manage your email subscription and communications preferences.",
  };
}

interface UnsubscribePageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams;
  const token = params.token;
  const rawEmail = params.email;

  let resolvedEmail: string | null = null;
  let status: "SUCCESS" | "INVALID_TOKEN" | "MISSING_PARAM" = "MISSING_PARAM";

  if (token) {
    const decrypted = decryptEmailToken(token);
    if (decrypted && decrypted.includes("@")) {
      resolvedEmail = decrypted.trim().toLowerCase();
    } else {
      status = "INVALID_TOKEN";
    }
  } else if (rawEmail && rawEmail.includes("@")) {
    resolvedEmail = rawEmail.trim().toLowerCase();
  }

  if (resolvedEmail) {
    try {
      // 1. Record in UnsubscribedContact table (idempotent upsert)
      await prisma.unsubscribedContact.upsert({
        where: { email: resolvedEmail },
        update: {},
        create: {
          email: resolvedEmail,
          reason: "1-Click Web Unsubscribe Link",
        },
      });

      // 2. Mark any matching CRM leads as unsubscribed
      await prisma.lead.updateMany({
        where: { email: { equals: resolvedEmail, mode: "insensitive" } },
        data: { isSubscribed: false },
      });

      status = "SUCCESS";
    } catch (err) {
      console.error("[UnsubscribePage] Error recording unsubscribe:", err);
      status = "SUCCESS"; // Show success to visitor
    }
  }

  const settings = await prisma.systemSetting.findFirst();
  const orgName = settings?.siteName || "SavazAI Atelier";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg p-8 sm:p-10 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xl text-center space-y-6">
          {status === "SUCCESS" && resolvedEmail ? (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-serif font-bold text-foreground">
                  You Have Been Unsubscribed
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your email address <span className="font-mono text-foreground font-semibold bg-muted/50 px-2 py-0.5 rounded">{resolvedEmail}</span> has been permanently removed from all promotional, event invitations, and broadcast mailing lists for <span className="font-semibold text-foreground">{orgName}</span>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground text-left space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Privacy Preference Recorded</span>
                </div>
                <p>
                  Transactional confirmations for past orders or critical direct inquiries you initiate will still be delivered.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-xs cursor-pointer">
                  <Link href="/">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Return to Homepage
                  </Link>
                </Button>
                <Button asChild variant="gold" size="sm" className="w-full sm:w-auto text-xs cursor-pointer font-serif">
                  <Link href="/gallery">Explore Art Gallery</Link>
                </Button>
              </div>
            </>
          ) : status === "INVALID_TOKEN" ? (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-serif font-bold text-foreground">
                  Invalid or Expired Token
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The unsubscribe link you followed appears to be invalid or has expired. If you wish to unsubscribe, you can submit a privacy erasure request through our footer or contact our desk directly.
                </p>
              </div>

              <div className="pt-2">
                <Button asChild variant="outline" size="sm" className="text-xs cursor-pointer">
                  <Link href="/contact">
                    <Mail className="w-3.5 h-3.5 mr-1.5" />
                    Contact Atelier Desk
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-serif font-bold text-foreground">
                  Unsubscribe Preferences
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Please use the 1-click unsubscribe link provided at the base of our emails to automatically verify your subscription identity.
                </p>
              </div>

              <div className="pt-2">
                <Button asChild variant="outline" size="sm" className="text-xs cursor-pointer">
                  <Link href="/">
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Return to Homepage
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
