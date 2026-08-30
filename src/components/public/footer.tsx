import Link from "next/link";
import prisma from "@/lib/prisma";
import { Sparkles, Mail, Phone, ExternalLink } from "lucide-react";

interface SocialLinkItem {
  platform: string;
  url: string;
  isVisible: boolean;
}

interface LegalLinkItem {
  label: string;
  url: string;
  isVisible: boolean;
}

interface FooterConfig {
  aboutText?: string;
  contactEmail?: string;
  contactPhone?: string;
  copyrightText?: string;
  socialLinks?: SocialLinkItem[];
  legalLinks?: LegalLinkItem[];
}

export async function Footer() {
  const settings = await prisma.systemSetting.findFirst().catch(() => null);

  const footerConfig = (settings?.footerConfig as FooterConfig | null) || null;

  const siteName =
    settings?.siteName ||
    "Lalita Kapilavai — Sacred Art & Carnatic Music Archive";
  const watermarkText =
    settings?.watermarkText || "© Lalita Kapilavai - Sacred Art & Heritage";

  const contactEmail =
    footerConfig?.contactEmail || settings?.contactEmail || "contact@lalitakapilavai.com";
  const contactPhone =
    footerConfig?.contactPhone || settings?.contactPhone || "+91 98450 12345";
  const aboutText =
    footerConfig?.aboutText ||
    "Living digital archive documenting classical South Indian Thanjavur (Tanjore) 22k gold leaf relief sacred paintings, Mysore traditional artwork, and Carnatic classical vocal recitals.";
  const copyrightText =
    footerConfig?.copyrightText ||
    `© ${new Date().getFullYear()} ${siteName}. All sacred rights reserved.`;

  // Default fallback social links if not customized
  const defaultSocials: SocialLinkItem[] = [
    {
      platform: "Instagram",
      url: settings?.instagramUrl || "https://instagram.com/lalitakapilavai",
      isVisible: !!settings?.instagramUrl || true,
    },
    {
      platform: "YouTube",
      url: settings?.youtubeUrl || "https://youtube.com/@lalitakapilavai",
      isVisible: !!settings?.youtubeUrl || true,
    },
  ];

  const socialLinks: SocialLinkItem[] =
    footerConfig?.socialLinks && footerConfig.socialLinks.length > 0
      ? footerConfig.socialLinks.filter((s) => s.isVisible && s.url)
      : defaultSocials;

  // Default fallback legal links if not customized
  const defaultLegal: LegalLinkItem[] = [
    { label: "Privacy Policy", url: "/privacy", isVisible: true },
    { label: "Terms & Conditions", url: "/terms", isVisible: true },
    { label: "Art Licensing & Reproduction", url: "/licensing", isVisible: true },
    { label: "Admin Portal", url: "/admin", isVisible: true },
  ];

  const legalLinks: LegalLinkItem[] =
    footerConfig?.legalLinks && footerConfig.legalLinks.length > 0
      ? footerConfig.legalLinks.filter((l) => l.isVisible && l.url)
      : defaultLegal;

  return (
    <footer className="w-full border-t border-border/80 bg-card/60 transition-colors duration-300">
      {/* Top Gold Border */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={siteName}
                  className="h-9 w-auto max-w-[140px] object-contain"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              <span className="font-serif font-bold text-lg text-foreground">
                {settings?.siteName ? settings.siteName.split("—")[0].trim() : "Lalita Kapilavai"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
              {aboutText}
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
              <li>
                <Link href="/blogs" className="hover:text-primary transition-colors">
                  Sacred Art Chronicles
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
              {socialLinks.map((s) => (
                <li key={s.platform}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 text-primary" />
                    <span>{s.platform}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>{copyrightText}</p>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            {legalLinks.map((l) => (
              <Link key={l.label} href={l.url} className="hover:text-primary transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
