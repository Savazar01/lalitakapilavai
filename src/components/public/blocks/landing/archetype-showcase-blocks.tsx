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
  Calendar,
  Clock,
  Sliders,
  DollarSign,
  Shield,
  FileText,
  Award,
  Check,
  BedDouble,
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
    case "landing_artist_monograph":
      return <LandingArtistMonographBlock content={content} className={className} />;
    case "landing_menu_matrix":
      return <LandingMenuMatrixBlock content={content} className={className} />;
    case "landing_reservation_bar":
      return <LandingReservationBarBlock content={content} className={className} />;
    case "landing_hospitality":
      return <LandingHospitalityBlock content={content} className={className} />;
    case "landing_availability_bar":
      return <LandingAvailabilityBarBlock content={content} className={className} />;
    case "landing_healthcare":
      return <LandingHealthcareBlock content={content} className={className} />;
    case "landing_specialty_filter":
      return <LandingSpecialtyFilterBlock content={content} className={className} />;
    case "landing_corporate_features":
      return <LandingCorporateFeaturesBlock content={content} className={className} />;
    case "landing_roi_calculator":
      return <LandingRoiCalculatorBlock content={content} className={className} />;
    case "landing_pricing_table":
      return <LandingPricingTableBlock content={content} className={className} />;
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

// ----------------------------------------------------------------------
// 10. LANDING RESERVATION BAR BLOCK (RESTAURANT)
// ----------------------------------------------------------------------
function LandingReservationBarBlock({
  content,
  className,
}: {
  content: Record<string, unknown>;
  className?: string;
}) {
  const title = (content.title as string) || "Reserve an Atelier Dining Experience";
  const subtitle = (content.subtitle as string) || "Private salon tables and chef's tasting degustations by reservation only.";

  const [date, setDate] = React.useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [time, setTime] = React.useState("7:30 PM");
  const [guests, setGuests] = React.useState("2 Guests");
  const [dietary, setDietary] = React.useState("None");
  const [isBooked, setIsBooked] = React.useState(false);

  const timeSlots = ["12:30 PM", "1:30 PM", "7:00 PM", "7:30 PM", "8:30 PM", "9:00 PM"];
  const guestOptions = ["1 Guest", "2 Guests", "4 Guests", "6 Guests", "8+ Private Salon"];
  const dietaryOptions = ["None", "Vegetarian", "Vegan", "Gluten-Free", "Jain Friendly"];

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
    setTimeout(() => setIsBooked(false), 5000);
  };

  return (
    <div className={cn("w-full py-8", className)}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto rounded-3xl p-6 sm:p-10 bg-card border border-border shadow-lg space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Table Reservations</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {isBooked ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h4 className="font-serif font-bold text-lg text-foreground">
              Table Reservation Requested
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Your priority reservation for <strong>{guests}</strong> on <strong>{date}</strong> at <strong>{time}</strong> has been logged. Our maître d’ will confirm your seating within 2 hours.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleBook} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Reservation Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border focus:ring-1 focus:ring-primary text-foreground"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Seating Slot</span>
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border focus:ring-1 focus:ring-primary text-foreground"
              >
                {timeSlots.map((ts) => (
                  <option key={ts} value={ts}>{ts}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>Party Size</span>
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border focus:ring-1 focus:ring-primary text-foreground"
              >
                {guestOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Reserve Atelier Table</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between text-[11px] text-muted-foreground gap-2">
          <div className="flex items-center gap-2">
            <span>Special Diet / Preference:</span>
            <div className="flex flex-wrap gap-1">
              {dietaryOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setDietary(opt)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] transition-colors",
                    dietary === opt
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <span className="italic">Smart confirmation via SMS &amp; Email</span>
        </div>
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 11. LANDING AVAILABILITY BAR BLOCK (HOSPITALITY)
// ----------------------------------------------------------------------
function LandingAvailabilityBarBlock({
  content,
  className,
}: {
  content: Record<string, unknown>;
  className?: string;
}) {
  const title = (content.title as string) || "Check Sanctuary Suite Availability";
  const subtitle = (content.subtitle as string) || "Direct reservations receive complimentary private butler service & airport transfers.";

  const [checkIn, setCheckIn] = React.useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split("T")[0];
  });
  const [checkOut, setCheckOut] = React.useState<string>(() => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    return future.toISOString().split("T")[0];
  });
  const [suiteType, setSuiteType] = React.useState("The Royal Heritage Villa");
  const [guests, setGuests] = React.useState("2 Guests");
  const [isSearched, setIsSearched] = React.useState(false);

  const suiteOptions = [
    "The Royal Heritage Villa (2,400 sq.ft)",
    "The Courtyard Verandah Suite (1,200 sq.ft)",
    "The Mountain Mist Penthouse (3,100 sq.ft)",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearched(true);
    setTimeout(() => setIsSearched(false), 5000);
  };

  return (
    <div className={cn("w-full py-8", className)}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto rounded-3xl p-6 sm:p-10 bg-card border border-border shadow-lg space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <BedDouble className="w-3.5 h-3.5" />
            <span>Sanctuary Escapes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {isSearched ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl bg-primary/10 border border-primary/30 text-center space-y-3"
          >
            <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
            <h4 className="font-serif font-bold text-lg text-foreground">
              Suite Available for Selected Dates
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              <strong>{suiteType}</strong> has confirmed availability from <strong>{checkIn}</strong> to <strong>{checkOut}</strong> for {guests}.
            </p>
            <Link
              href="/contact?type=hospitality"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-md transition-all"
            >
              <span>Proceed to Bespoke Booking Confirmation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Check-In Date</span>
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border focus:ring-1 focus:ring-primary text-foreground"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Check-Out Date</span>
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border focus:ring-1 focus:ring-primary text-foreground"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-primary" />
                <span>Suite Sanctuary</span>
              </label>
              <select
                value={suiteType}
                onChange={(e) => setSuiteType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border focus:ring-1 focus:ring-primary text-foreground truncate"
              >
                {suiteOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>Guests</span>
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border focus:ring-1 focus:ring-primary text-foreground"
              >
                {["1 Guest", "2 Guests", "4 Guests", "6 Guests"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Verify Suite Rates</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between text-[11px] text-muted-foreground gap-2">
          <span>✓ Guaranteed Best Available Rate</span>
          <span>✓ Complimentary High-Tea &amp; Breakfast</span>
          <span>✓ Flexible 48-Hour Cancellation</span>
        </div>
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 12. LANDING ROI & PERFORMANCE CALCULATOR (CORPORATE / SAAS)
// ----------------------------------------------------------------------
function LandingRoiCalculatorBlock({
  content,
  className,
}: {
  content: Record<string, unknown>;
  className?: string;
}) {
  const title = (content.title as string) || "Interactive Archive Performance & ROI Engine";
  const subtitle = (content.subtitle as string) || "Calculate your latency acceleration, storage sovereign savings, and curatorial verification efficiency.";

  const [assetVolume, setAssetVolume] = React.useState<number>(850);

  // Dynamic Metrics derived from asset volume slider
  const edgeLatency = Math.max(16, Math.round(28 - assetVolume / 500));
  const storageSavingsPercent = 74;
  const annualSavingsINR = Math.round(assetVolume * 480);
  const curatorialHoursSaved = Math.round(assetVolume * 0.45);

  return (
    <div className={cn("w-full py-8", className)}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto rounded-3xl p-6 sm:p-10 bg-card border border-border shadow-lg space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <Sliders className="w-3.5 h-3.5" />
            <span>ROI &amp; Performance Calculator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Interactive Slider */}
        <div className="p-6 rounded-2xl bg-muted/20 border border-border/70 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-foreground">Active Catalog Masterworks &amp; Media Assets:</span>
              <p className="text-[11px] text-muted-foreground">Adjust the slider to simulate your institutional collection size</p>
            </div>
            <div className="px-4 py-1.5 rounded-xl bg-card border border-border font-mono font-bold text-base text-primary self-start sm:self-auto">
              {assetVolume.toLocaleString()} Masterworks
            </div>
          </div>

          <input
            type="range"
            min="50"
            max="5000"
            step="50"
            value={assetVolume}
            onChange={(e) => setAssetVolume(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />

          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>50 Assets (Studio)</span>
            <span>2,500 Assets (Foundation)</span>
            <span>5,000+ Assets (Museum Network)</span>
          </div>
        </div>

        {/* Calculated Results Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-card border border-border/80 text-left space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Edge Latency
            </span>
            <div className="text-2xl font-serif font-bold text-foreground">
              {edgeLatency}ms
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ↓ 82% vs standard CDN
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/80 text-left space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-sky-500" />
              Sovereign Savings
            </span>
            <div className="text-2xl font-serif font-bold text-foreground">
              {storageSavingsPercent}%
            </div>
            <span className="text-[10px] text-muted-foreground">
              WebDAV / R2 bypass
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/80 text-left space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              Curation Time
            </span>
            <div className="text-2xl font-serif font-bold text-foreground">
              {curatorialHoursSaved}h
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Annual hours reclaimed
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-primary/40 bg-primary/5 text-left space-y-1">
            <span className="text-xs text-primary font-semibold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              Estimated Net Value
            </span>
            <div className="text-2xl font-serif font-bold text-primary">
              ₹{annualSavingsINR.toLocaleString("en-IN")}
            </div>
            <span className="text-[10px] text-muted-foreground">
              Annual infrastructure gain
            </span>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-md transition-all"
          >
            <span>Deploy Sovereign Infrastructure Instance</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 13. LANDING PRICING TABLE BLOCK (CORPORATE / SAAS)
// ----------------------------------------------------------------------
function LandingPricingTableBlock({
  content,
  className,
}: {
  content: Record<string, unknown>;
  className?: string;
}) {
  const title = (content.title as string) || "Transparent Sovereign Tiers";
  const subtitle = (content.subtitle as string) || "Deploy with zero licensing lock-in. Scale from an artisanal studio to a multi-national museum network.";

  const [isAnnual, setIsAnnual] = React.useState(true);

  const plans = [
    {
      name: "Artisan Studio",
      badge: "Single Practitioner",
      priceMonthly: "₹2,990",
      priceAnnual: "₹2,390",
      description: "Ideal for individual heritage masters, solo sculptors, and private atelier workshops.",
      features: [
        "Up to 250 Masterwork Plates",
        "Local Disk & S3 Storage Drivers",
        "Headless Iframe Placard Print Driver",
        "Standard Exhibition Corridor (Single Wall)",
        "Automated SVG Signature Watermarking",
      ],
      ctaText: "Launch Studio Atelier",
      ctaUrl: "/contact?plan=studio",
      popular: false,
    },
    {
      name: "Curatorial Pro",
      badge: "Most Popular",
      priceMonthly: "₹8,490",
      priceAnnual: "₹6,790",
      description: "Designed for commercial art galleries, cultural foundation trusts, and high-frequency exhibitors.",
      features: [
        "Unlimited Masterwork Plates & Assets",
        "Full Multi-Cloud (R2, S3, Google, Nextcloud)",
        "3D WebGL Multi-Wall Spatial Corridors",
        "Digital e-Catalog Synchronous PDF Driver",
        "Dynamic Form Lead Routing & Google Sheets Sync",
        "Full Custom Domain & Archive Subtitle Control",
      ],
      ctaText: "Start 14-Day Free Trial",
      ctaUrl: "/contact?plan=pro",
      popular: true,
    },
    {
      name: "Sovereign Enterprise",
      badge: "Institutional Network",
      priceMonthly: "Custom",
      priceAnnual: "Custom",
      description: "Tailored for national museum archives, sovereign heritage trusts, and multi-tenant cultural ministries.",
      features: [
        "Dedicated PostgreSQL 17 + pgvector Instance",
        "Synesthetic AI Knowledge Graph Embeddings",
        "Custom Storage Driver Adapters (NAS/SAN)",
        "Dedicated Multi-Stage Docker Container VPS",
        "99.99% Uptime SLA & 24/7 Priority Support",
        "On-Premises Air-Gapped Deployment Support",
      ],
      ctaText: "Consult Institutional Architects",
      ctaUrl: "/contact?plan=enterprise",
      popular: false,
    },
  ];

  return (
    <div className={cn("w-full py-8", className)}>
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
          <Award className="w-3.5 h-3.5" />
          <span>Platform Pricing</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Annual / Monthly Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={cn("text-xs font-medium", !isAnnual ? "text-foreground font-bold" : "text-muted-foreground")}>
            Monthly Billing
          </span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-12 h-6 rounded-full bg-primary/20 p-1 cursor-pointer transition-colors"
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full bg-primary transition-transform duration-200",
                isAnnual ? "translate-x-6" : "translate-x-0"
              )}
            />
          </button>
          <span className={cn("text-xs font-medium flex items-center gap-1.5", isAnnual ? "text-foreground font-bold" : "text-muted-foreground")}>
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Save 20% + 2 Months Free
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((p, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4 }}
            className={cn(
              "rounded-3xl p-6 sm:p-8 bg-card border flex flex-col justify-between transition-all",
              p.popular
                ? "border-primary shadow-xl ring-2 ring-primary/20 relative"
                : "border-border shadow-xs hover:border-primary/40"
            )}
          >
            {p.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-sm">
                Most Popular Choice
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif font-bold text-xl text-foreground">
                  {p.name}
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {p.badge}
                </span>
              </div>

              <div className="my-4">
                <span className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
                  {isAnnual ? p.priceAnnual : p.priceMonthly}
                </span>
                {p.priceAnnual !== "Custom" && (
                  <span className="text-xs text-muted-foreground ml-1">/ month</span>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                {p.description}
              </p>

              <div className="space-y-2.5 pt-4 border-t border-border/50">
                <span className="text-xs font-semibold text-foreground">Included Capabilities:</span>
                {p.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Link
                href={p.ctaUrl}
                className={cn(
                  "w-full py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                  p.popular
                    ? "bg-primary text-primary-foreground hover:opacity-90 shadow-md"
                    : "bg-muted hover:bg-muted/80 text-foreground border border-border"
                )}
              >
                <span>{p.ctaText}</span>
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
// 14. LANDING SPECIALTY FILTER BLOCK (HEALTHCARE)
// ----------------------------------------------------------------------
function LandingSpecialtyFilterBlock({
  content,
  className,
}: {
  content: Record<string, unknown>;
  className?: string;
}) {
  const title = (content.title as string) || "Clinical Specialties & Consulting Faculty";
  const subtitle = (content.subtitle as string) || "Filter by medical discipline to review lead consultants, diagnostic equipment, and consultation timings.";

  const departments = [
    "All Specialties",
    "Preventive Cardiology",
    "Orthopedics & Joint Rejuvenation",
    "Integrative Metabolic Care",
    "Diagnostic Radiology",
  ];

  const doctors = [
    {
      name: "Dr. Arvind Sharma, MD (Card), FACC",
      dept: "Preventive Cardiology",
      experience: "24+ Years Clinical Practice",
      focus: "Comprehensive non-invasive hemodynamics, coronary calcium scoring, and lipidomics.",
      timings: "Mon - Thu: 9:00 AM - 1:00 PM",
      availability: "Immediate Slots Available",
    },
    {
      name: "Dr. Sneha Venkataraman, MS (Ortho), MCh",
      dept: "Orthopedics & Joint Rejuvenation",
      experience: "19+ Years Surgical Experience",
      focus: "Minimally invasive arthroscopic cartilage repair, biological joint salvage, and sports rehab.",
      timings: "Tue - Sat: 11:00 AM - 4:00 PM",
      availability: "Booking Open",
    },
    {
      name: "Dr. Rajesh Nair, MD, Dip. Diab (UK)",
      dept: "Integrative Metabolic Care",
      experience: "16+ Years Experience",
      focus: "Reversal protocols for Type 2 Diabetes, cardiometabolic risk, and endocrine balance.",
      timings: "Mon - Fri: 10:00 AM - 2:00 PM",
      availability: "Immediate Slots Available",
    },
    {
      name: "Dr. Meera Sundaram, MD (Radiology), FRCR",
      dept: "Diagnostic Radiology",
      experience: "14+ Years Clinical Experience",
      focus: "High-resolution musculoskeletal ultrasound, 3T cardiac MRI, and preventative full-body scans.",
      timings: "Daily: 8:00 AM - 6:00 PM",
      availability: "Same-Day Reports",
    },
  ];

  const [activeDept, setActiveDept] = React.useState("All Specialties");

  const filteredDoctors = activeDept === "All Specialties"
    ? doctors
    : doctors.filter((d) => d.dept === activeDept);

  return (
    <div className={cn("w-full py-8", className)}>
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Accredited Faculty</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Filterable Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setActiveDept(dept)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer",
              activeDept === dept
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Doctors Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
      >
        <AnimatePresence>
          {filteredDoctors.map((doc, idx) => (
            <motion.div
              layout
              key={idx}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10">
                      {doc.dept}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-foreground mt-1.5">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {doc.experience}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-muted/60 border border-border flex items-center justify-center text-primary shrink-0">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  {doc.focus}
                </p>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground py-2 border-t border-border/40">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" />
                    {doc.timings}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {doc.availability}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <Link
                  href="/contact?type=appointment"
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary border border-primary/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Book Appointment with {doc.name.split(",")[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 15. LANDING ARTIST MONOGRAPH & AUTHENTICITY BLOCK (PORTFOLIO)
// ----------------------------------------------------------------------
function LandingArtistMonographBlock({
  content,
  className,
}: {
  content: Record<string, unknown>;
  className?: string;
}) {
  const title = (content.title as string) || "Authenticated Curatorial Monograph & Provenance";
  const subtitle = (content.subtitle as string) || "Every composition leaves our atelier accompanied by consecrated iconographic documentation, assay certificates, and physical museum placards.";

  return (
    <div className={cn("w-full py-8", className)}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-12 bg-card border border-amber-500/30 shadow-lg relative overflow-hidden space-y-8"
      >
        {/* Subtle decorative gold radial sheen */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Museum-Grade Provenance Archive</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-background/60 border border-border space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-base text-foreground">
              24K Gold Assay Certification
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Conducted with spectroscopic purity verification for sacred gold foil leaves applied across gesso reliefs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-background/60 border border-border space-y-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-base text-foreground">
              Curatorial e-Catalog Plates
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              High-resolution, synchronously decoded PDF monographs suitable for permanent library acquisition and museum records.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-background/60 border border-border space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-base text-foreground">
              Cryptographic Title Chain
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Immutable provenance registration with physical museum wall placard dimensions (4 × 2.5 in) and safe-clamp margins.
            </p>
          </div>
        </div>

        {/* Decorative Artist Signature line */}
        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 font-serif font-bold text-base">
              SA
            </div>
            <div>
              <span className="font-serif font-bold text-sm text-foreground">
                Consecrated Atelier Signature
              </span>
              <p className="text-[11px] text-muted-foreground font-mono">
                Digitally authenticated monograph seal &bull; Universal Atelier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/catalogs"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors"
            >
              Browse Digital e-Catalogs
            </Link>
            <Link
              href="/commission"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Request Private Monograph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

