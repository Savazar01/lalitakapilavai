import Link from "next/link";
import prisma from "@/lib/prisma";
import { Sparkles, Mail, Phone, ExternalLink } from "lucide-react";

export async function Footer() {
  const settings = await prisma.systemSetting.findFirst().catch(() => null);

  const siteName =
    settings?.siteName ||
    "Lalita Kapilavai — Sacred Art & Carnatic Music Archive";
  const watermarkText =
    settings?.watermarkText || "© Lalita Kapilavai - Sacred Art & Heritage";
  const contactEmail = settings?.contactEmail || "contact@lalitakapilavai.com";
  const contactPhone = settings?.contactPhone || "+91 98450 12345";

  return (
    <footer className="w-full border-t border-border/80 bg-card/60 transition-colors duration-300">
      {/* Top Gold Border */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="font-serif font-bold text-lg text-foreground">
                Lalita Kapilavai
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
              Living digital archive documenting classical South Indian Thanjavur (Tanjore) 22k gold leaf relief sacred paintings, Mysore traditional artwork, and Carnatic classical vocal recitals.
            </p>
            <p className="text-xs font-mono text-primary font-semibold">
              {watermarkText}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-foreground uppercase tracking-wider">
              Galleries &amp; Heritage
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/gallery/tanjore-paintings" className="hover:text-primary transition-colors">
                  Tanjore Gold Leaf Collection
                </Link>
              </li>
              <li>
                <Link href="/gallery/mysore-traditional" className="hover:text-primary transition-colors">
                  Mysore Classical School
                </Link>
              </li>
              <li>
                <Link href="/music" className="hover:text-primary transition-colors">
                  Carnatic Vocal Recordings
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-primary transition-colors">
                  Exhibitions &amp; Concerts
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-foreground uppercase tracking-wider">
              Studio &amp; Inquiries
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <a href={`mailto:${contactEmail}`} className="hover:text-primary transition-colors truncate">
                  {contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{contactPhone}</span>
              </li>
              {settings?.instagramUrl && (
                <li>
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Instagram Portfolio
                  </a>
                </li>
              )}
              {settings?.youtubeUrl && (
                <li>
                  <a
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    YouTube Concert Channel
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteName}. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Notice
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Copyright &amp; Licensing
            </Link>
            <Link href="/admin" className="hover:text-primary transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
