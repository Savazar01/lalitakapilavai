import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import prisma from "@/lib/prisma";
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
  const settings = await prisma.systemSetting.findFirst().catch(() => null);
  const title = settings?.siteName || "Lalita Kapilavai — Sacred Art & Carnatic Music Archive";
  const description =
    settings?.siteDescription ||
    "Living digital archive of traditional Indian Tanjore paintings with 22k gold leaf, Mysore classical fine art, and Carnatic classical vocal recitals.";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3060";

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
