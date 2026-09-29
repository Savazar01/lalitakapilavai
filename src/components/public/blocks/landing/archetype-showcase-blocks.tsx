"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  Building,
  Maximize2,
  Users,
  Eye,
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  Zap,
  Server,
  Layers,
  UtensilsCrossed,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ArchetypeShowcaseBlockProps {
  content: Record<string, unknown>;
  contrast?: string;
  className?: string;
}

export function ArchetypeShowcaseBlock({
  content,
  contrast: _contrast = "auto",
  className = "",
}: ArchetypeShowcaseBlockProps) {
  const type = String(content.type || "");

  switch (type) {
    case "landing_hero":
      return <LandingHeroBlock content={content} className={className} />;
    case "landing_services":
      return <LandingServicesBlock content={content} className={className} />;
    case "landing_portfolio_strip":
      return <LandingPortfolioStripBlock content={content} className={className} />;
    case "landing_menu_matrix":
      return <LandingMenuMatrixBlock content={content} className={className} />;
    case "landing_hospitality":
      return <LandingHospitalityBlock content={content} className={className} />;
    case "landing_healthcare":
      return <LandingHealthcareBlock content={content} className={className} />;
    case "landing_corporate_features":
      return <LandingCorporateFeaturesBlock content={content} className={className} />;
    case "landing_faq":
      return <LandingFaqBlock content={content} className={className} />;
    case "landing_cta":
      return <LandingCtaBlock content={content} className={className} />;
    default:
      return null;
  }
}

// ----------------------------------------------------------------------
// 1. LANDING HERO BLOCK
// ----------------------------------------------------------------------
function LandingHeroBlock({
  content,
  className,
}: {
  content: Record<string, unknown>;
  className?: string;
}) {
  const badge = (content.badge as string) || "";
  const headline = (content.headline as string) || "";
  const subheadline = (content.subheadline as string) || "";
  const primaryCtaText = (content.primaryCtaText as string) || "";
  const primaryCtaUrl = (content.primaryCtaUrl as string) || "#";
  const secondaryCtaText = (content.secondaryCtaText as string) || "";
  const secondaryCtaUrl = (content.secondaryCtaUrl as string) || "#";
  const metrics = (content.metrics as Array<{ label: string; value: string; change?: string }>) || [];
  const _archetype = (content.archetype as string) || "PROFESSIONAL";

  return (
    <div className={cn("w-full py-6 md:py-10", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl mx-auto text-center space-y-6"
      >
        {/* Badge Pill */}
        {badge && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary/10 text-primary border border-primary/25 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
        )}

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-foreground leading-[1.15]">
          {headline}
        </h1>

        {/* Subheadline */}
        {subheadline && (
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {subheadline}
          </p>
        )}

        {/* Action Buttons */}
        {(primaryCtaText || secondaryCtaText) && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            {primaryCtaText && (
              <Link
                href={primaryCtaUrl}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm sm:text-base bg-primary text-primary-foreground hover:opacity-95 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span>{primaryCtaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            {secondaryCtaText && (
              <Link
                href={secondaryCtaUrl}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm sm:text-base bg-card text-foreground border border-border hover:bg-muted/40 transition-colors shadow-xs"
              >
                <span>{secondaryCtaText}</span>
              </Link>
            )}
          </div>
        )}

        {/* Metrics Ticker Grid */}
        {metrics && metrics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left"
          >
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{m.label}</span>
                  {m.change && (
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                      {m.change}
                    </span>
                  )}
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                  {m.value}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. LANDING SERVICES BLOCK
// ----------------------------------------------------------------------
function LandingServicesBlock({
  content,
  className,
}: {
  content: Record<string, unknown>;
  className?: string;
}) {
  const sectionTitle = (content.sectionTitle as string) || "Specialized Practice Areas";
  const sectionSubtitle = (content.sectionSubtitle as string) || "";
  const services = (content.services as Array<{ title: string; description: string; badge?: string }>) || [];

  return (
    <div className={cn("w-full py-6", className)}>
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">
          {sectionTitle}
        </h2>
        {sectionSubtitle && (
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {sectionSubtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((srv, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div>
              {srv.badge && (
                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-primary/10 text-primary mb-3">
                  {srv.badge}
                </span>
              )}
              <h3 className="text-lg font-serif font-bold text-foreground mb-2">
                {srv.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {srv.description}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border/40 flex items-center text-xs font-semibold text-primary">
              <span>Learn Methodology</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. LANDING PORTFOLIO STRIP BLOCK
// ----------------------------------------------------------------------
function LandingPortfolioStripBlock({
  content,
  className,
}: {
  content: Record<string, unknown>;
  className?: string;
}) {
  const title = (content.title as string) || "Selected Masterworks & Provenance";
  const subtitle = (content.subtitle as string) || "";

  // Showcase samples representing fine art masterworks
  const sampleItems = [
    {
      title: "Gajendra Moksha (Sacred Salvation)",
      medium: "24K Gold Leaf & Mineral Pigment on Teakwood",
      dimensions: "48 × 36 in",
      year: "Classical Mysore School",
      tag: "Archival Monograph Included",
    },
    {
      title: "Sri Lakshmi Narayana Darshana",
      medium: "Gold Foil Filigree with Consecrated Ruby Embellishments",
      dimensions: "60 × 42 in",
      year: "Thanjavur Master Tradition",
      tag: "Certified 24K Assay",
    },
    {
      title: "Ananda Tandavam (Cosmic Rhythm)",
      medium: "Tempera, Gesso Relief & Pure Gold Gilding",
      dimensions: "36 × 36 in",
      year: "Iconographic Heritage",
      tag: "Physical Museum Placard",
    },
  ];

  return (
    <div className={cn("w-full py-6", className)}>
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sampleItems.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3 }}
            className="rounded-2xl overflow-hidden bg-card border border-border shadow-xs hover:shadow-lg transition-all"
          >
            <div className="h-44 sm:h-52 bg-muted/40 relative flex items-center justify-center p-6 border-b border-border/60">
              <div className="text-center space-y-2">
                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/15 text-primary border border-primary/30">
                  {item.tag}
                </span>
                <p className="font-serif italic text-xs text-muted-foreground">
                  Museum Placard & High-Res Plates
                </p>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-serif font-bold text-base sm:text-lg text-foreground">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.medium}
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-2 border-t border-border/40">
                <span>{item.dimensions}</span>
                <span className="text-primary font-semibold">{item.year}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <span>View Complete Collection & Exhibition Corridor</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. LANDING MENU MATRIX BLOCK
// ----------------------------------------------------------------------
function LandingMenuMatrixBlock({
  content,
  className,
}: {
  content: Record<string, unknown>;
  className?: string;
}) {
  const title = (content.title as string) || "Curated Seasonal Degustation";
  const categories = (content.categories as Array<{
    name: string;
    items: Array<{ name: string; price: string; dietary?: string[]; description: string }>;
  }>) || [];

  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <div className={cn("w-full py-6", className)}>
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Gastronomic Showcase</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">
          {title}
        </h2>
      </div>

      {/* Category Tabs */}
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200",
                activeTab === idx
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Active Category Items Grid */}
      {categories[activeTab] && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
        >
          {categories[activeTab].items.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-foreground">
                  {item.name}
                </h3>
                <span className="font-mono font-bold text-primary text-base whitespace-nowrap">
                  {item.price}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3">
                {item.description}
              </p>
              {item.dietary && item.dietary.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.dietary.map((d, dIdx) => {
                    const isChef = d.toLowerCase().includes("chef") || d.toLowerCase().includes("signature");
                    const isVegan = d.toLowerCase().includes("vegan");
                    const isGlutenFree = d.toLowerCase().includes("gluten");
                    return (
                      <span
                        key={dIdx}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
                          isChef
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                            : isVegan
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                            : isGlutenFree
                            ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30"
                            : "bg-muted text-muted-foreground border border-border"
                        )}
                      >
                        {d}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. LANDING HOSPITALITY BLOCK
// ----------------------------------------------------------------------
function LandingHospitalityBlock({
  content,
  className,
}: {
  content: Record<string, unknown>;
  className?: string;
}) {
  const title = (content.title as string) || "Signature Suites & Villas";
  const amenities = (content.amenities as string[]) || [];
  const suites = (content.suites as Array<{
    name: string;
    area: string;
    occupancy: string;
    view: string;
    price?: string;
  }>) || [];

  return (
    <div className={cn("w-full py-6", className)}>
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">
          {title}
        </h2>
        {amenities.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {amenities.map((am, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-card border border-border text-foreground shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>{am}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {suites.map((s, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3 }}
            className="rounded-2xl overflow-hidden bg-card border border-border shadow-xs hover:shadow-lg transition-all"
          >
            <div className="h-48 sm:h-56 bg-muted/40 relative flex items-center justify-center border-b border-border/60">
              <Building className="w-12 h-12 text-primary/40" />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-background/90 backdrop-blur-sm border border-border text-foreground">
                Heritage Sanctuary
              </div>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="font-serif font-bold text-xl text-foreground">
                {s.name}
              </h3>
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/50 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Maximize2 className="w-3.5 h-3.5 text-primary" />
                  <span>{s.area}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span>{s.occupancy}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate">{s.view}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  Complimentary Butler & Chauffeur
                </span>
                <Link
                  href="#book"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Reserve Suite
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 6. LANDING HEALTHCARE BLOCK
// ----------------------------------------------------------------------
function LandingHealthcareBlock({
  content,
  className,
}: {
  content: Record<string, unknown>;
  className?: string;
}) {
  const title = (content.title as string) || "Clinical Departments & Specialized Centers";
  const specialties = (content.specialties as Array<{
    name: string;
    lead: string;
    focus: string;
  }>) || [];

  return (
    <div className={cn("w-full py-6", className)}>
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <HeartPulse className="w-3.5 h-3.5" />
          <span>Accredited Clinical Excellence</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {specialties.map((spec, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3 }}
            className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-foreground">
                {spec.name}
              </h3>
              <p className="text-xs font-medium text-primary">
                {spec.lead}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {spec.focus}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border/50">
              <Link
                href="#appointment"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>Book Doctor Consultation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 7. LANDING CORPORATE FEATURES BLOCK
// ----------------------------------------------------------------------
function LandingCorporateFeaturesBlock({
  content,
  className,
}: {
  content: Record<string, unknown>;
  className?: string;
}) {
  const title = (content.title as string) || "Engineered for Extreme Reliability & Sovereignty";
  const features = (content.features as Array<{ title: string; description: string }>) || [];

  const icons = [Server, ShieldCheck, Zap, Layers];

  return (
    <div className={cn("w-full py-6", className)}>
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((feat, idx) => {
          const IconComponent = icons[idx % icons.length];
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:shadow-md hover:border-primary/40 transition-all space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <IconComponent className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-foreground">
                {feat.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feat.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 8. LANDING FAQ BLOCK
// ----------------------------------------------------------------------
function LandingFaqBlock({
  content,
  className,
}: {
  content: Record<string, unknown>;
  className?: string;
}) {
  const title = (content.title as string) || "Frequently Asked Questions";
  const faqs = (content.faqs as Array<{ question: string; answer: string }>) || [];

  const [openIdx, setOpenIdx] = React.useState<number | null>(0);

  return (
    <div className={cn("w-full py-6", className)}>
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge Base</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">
          {title}
        </h2>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-card border border-border overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif font-semibold text-base sm:text-lg text-foreground hover:bg-muted/30 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0",
                    isOpen ? "rotate-180 text-primary" : ""
                  )}
                />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 9. LANDING CTA BLOCK
// ----------------------------------------------------------------------
function LandingCtaBlock({
  content,
  className,
}: {
  content: Record<string, unknown>;
  className?: string;
}) {
  const title = (content.title as string) || "Initiate a Confidential Strategic Consultation";
  const subtitle = (content.subtitle as string) || "";
  const buttonText = (content.buttonText as string) || "Get Started";
  const actionUrl = (content.actionUrl as string) || "/contact";
  const secondaryText = (content.secondaryText as string) || "";

  return (
    <div className={cn("w-full py-6", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 text-center bg-card border border-primary/30 shadow-lg relative overflow-hidden"
      >
        {/* Subtle decorative radial glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={actionUrl}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-medium text-base bg-primary text-primary-foreground hover:opacity-95 shadow-md hover:shadow-xl transition-all"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {secondaryText && (
            <p className="pt-2 text-xs text-muted-foreground font-mono">
              {secondaryText}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
