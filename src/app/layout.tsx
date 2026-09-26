import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { DynamicThemeProvider } from "@/components/dynamic-theme-provider";
import { Toaster } from "@/components/ui/sonner";
import prisma from "@/lib/prisma";
import { getServerBaseUrl } from "@/lib/get-base-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const isBuilding =
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.BUILDING === "1";

  const settings = isBuilding
    ? null
    : await prisma.systemSetting.findFirst().catch(() => null);
  const title = settings?.siteName || "SavazAI WebApps — Digital Atelier & Cultural Archive";
  const description =
    settings?.siteDescription ||
    "Enterprise multi-tenant digital atelier, spatial exhibition corridor, and museum publishing system.";

  const baseUrl = await getServerBaseUrl();
  const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://savazar.com";

  return {
    metadataBase: new URL(appUrl),
    title,
    description,
    icons: settings?.faviconUrl ? [{ rel: "icon", url: settings.faviconUrl }] : undefined,
    openGraph: {
      title,
      description,
      siteName: title,
      images: settings?.logoUrl ? [{ url: settings.logoUrl }] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <DynamicThemeProvider />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300"
      >
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
