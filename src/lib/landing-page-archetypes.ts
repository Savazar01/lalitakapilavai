/**
 * Enterprise Landing Page Archetypes & Template Architecture
 * Decoupled multi-industry showcase presets for the SavazAI Page Builder Engine.
 * All presets dynamically inherit CSS variable tokens and WCAG AAA contrast rules.
 */

export type LandingPageArchetypeKey =
  | "BLANK"
  | "PROFESSIONAL"
  | "PORTFOLIO"
  | "RESTAURANT"
  | "HOSPITALITY"
  | "HEALTHCARE"
  | "CORPORATE";

export interface ArchetypeDefinition {
  key: LandingPageArchetypeKey;
  label: string;
  industry: string;
  tagline: string;
  description: string;
  features: string[];
  recommendedBadge: string;
}

export const LANDING_PAGE_ARCHETYPES: ArchetypeDefinition[] = [
  {
    key: "PROFESSIONAL",
    label: "Professional Advisory & Consulting",
    industry: "Financial, Legal & Advisory Services",
    tagline: "Strategic Advisory, Archival Governance & Wealth Management",
    description: "Clean executive hero with real-time metric counter tickers, split expertise grid, institutional client proof logos, and interactive consultation scheduling CTA.",
    features: ["Metric Ticker Counters", "Split Advisory Grid", "Client Proof Marquee", "Consultation Scheduler"],
    recommendedBadge: "Enterprise Advisory",
  },
  {
    key: "PORTFOLIO",
    label: "Creative Atelier & Masterwork Portfolio",
    industry: "Fine Art, Museums & Cultural Foundations",
    tagline: "High-Fidelity Living Digital Atelier & Masterwork Corridors",
    description: "Full-bleed immersive visual hero, horizontal drag-scroll exhibition strip, floating provenance cards with gold filigree tags, and curatorial inquiry trigger.",
    features: ["Immersive Artwork Hero", "Horizontal Exhibition Strip", "Provenance Earmarks", "Curatorial Inquiry"],
    recommendedBadge: "Fine Art & Atelier",
  },
  {
    key: "RESTAURANT",
    label: "Culinary & Fine Dining Experience",
    industry: "Gastronomy, Luxury Dining & Bistro",
    tagline: "Artisanal Flavors, Heritage Recipes & Private Dining",
    description: "Atmospheric full-bleed banner, interactive multi-category dining menu matrix with dietary pills (Gluten-Free, Vegan, Chef Signature), and table reservation CTA.",
    features: ["Atmospheric Food Showcase", "Categorized Menu Matrix", "Dietary Pill Badges", "Reservation Booking Block"],
    recommendedBadge: "Hospitality Dining",
  },
  {
    key: "HOSPITALITY",
    label: "Boutique Hotel & Luxury Retreat",
    industry: "Resorts, Heritage Stays & Boutique Lodges",
    tagline: "Architectural Serenity, Heritage Suites & Bespoke Concierge",
    description: "Signature suite showcase carousel, curated amenity icon strip (Concierge, Private Terrace, Valet), and geo-location card with direct check-in inquiry drawer.",
    features: ["Suite Showcase Carousel", "Curated Amenity Strip", "Architectural Highlights", "Direct Booking Inquiry"],
    recommendedBadge: "Luxury Hospitality",
  },
  {
    key: "HEALTHCARE",
    label: "Healthcare, Specialty Clinic & Wellness",
    industry: "Medical Practice, Holistic Wellness & Diagnostics",
    tagline: "Compassionate Care, World-Class Practitioners & Advanced Diagnostics",
    description: "NABH/ISO trust accreditation stamps, practitioner physician profiles, department specialty selector, and emergency/appointment inquiry workflow.",
    features: ["Accreditation Badges", "Practitioner Doctor Cards", "Specialty Department Grid", "Quick Appointment Flow"],
    recommendedBadge: "Healthcare & Care",
  },
  {
    key: "CORPORATE",
    label: "Enterprise SaaS & Tech Solutions",
    industry: "Software, Cloud Infrastructure & Modern Enterprise",
    tagline: "High-Performance Cloud Infrastructure for Sovereign Systems",
    description: "Modern gradient glow hero with dynamic badge pills, feature grid with hover elevation (translate-y lift), tabbed interactive product walkthrough, and FAQ accordion.",
    features: ["Gradient Glow Hero", "Elevated Feature Grid", "Tabbed Product Walkthrough", "Interactive FAQ Accordion"],
    recommendedBadge: "Modern SaaS",
  },
  {
    key: "BLANK",
    label: "Minimal Blank Canvas",
    industry: "Universal Custom Canvas",
    tagline: "Unconstrained Sandbox Layout",
    description: "Clean empty canvas ready for custom 12-column responsive layout assembly and bespoke block placement.",
    features: ["12-Column Flexible Grid", "Full Layout Freedom", "Zero Seed Constraints"],
    recommendedBadge: "Starter Canvas",
  },
];

export interface InitialSectionData {
  title: string;
  orderIndex: number;
  gridSpan: number;
  backgroundColor?: string;
  backgroundType?: string;
  customCssClass?: string;
  subSections: {
    title: string;
    orderIndex: number;
    gridSpan: number;
    content: Record<string, unknown>;
  }[];
}

/**
 * Constructs production-grade initial sections and subsections
 * for any of the 7 supported industry archetypes.
 */
export function createArchetypePageData(
  archetype: LandingPageArchetypeKey,
  pageTitle: string,
  _pageSlug: string
): InitialSectionData[] {
  switch (archetype) {
    case "PROFESSIONAL":
      return [
        {
          title: "Executive Hero & Metrics Ticker",
          orderIndex: 0,
          gridSpan: 12,
          customCssClass: "py-16 md:py-24 border-b border-border/60",
          subSections: [
            {
              title: "Advisory Hero Block",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_hero",
                archetype: "PROFESSIONAL",
                badge: "Institutional Advisory & Governance",
                headline: pageTitle || "Pioneering Strategic Advisory & Cultural Asset Stewardship",
                subheadline: "Empowering fine art foundations, private family offices, and cultural institutions with institutional-grade provenance validation, archival governance, and capital structuring.",
                primaryCtaText: "Schedule Advisory Consultation",
                primaryCtaUrl: `#consultation`,
                secondaryCtaText: "Explore Practice Areas",
                secondaryCtaUrl: `#practice-areas`,
                metrics: [
                  { label: "Archival Assets Advised", value: "₹450+ Cr", change: "+24% YoY" },
                  { label: "Sovereign Institutional Clients", value: "85+", change: "Pan-India" },
                  { label: "Provenance Fidelity Score", value: "99.9%", change: "Audit Verified" },
                  { label: "Years of Heritage Practice", value: "32+", change: "Established 1994" },
                ],
              },
            },
          ],
        },
        {
          title: "Practice Areas & Core Expertise",
          orderIndex: 1,
          gridSpan: 12,
          customCssClass: "py-16 bg-muted/20 border-b border-border/60",
          subSections: [
            {
              title: "Practice Services Grid",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_services",
                archetype: "PROFESSIONAL",
                sectionTitle: "Specialized Practice Areas",
                sectionSubtitle: "Rigorous methodologies delivered by veteran counsel and archival curators.",
                services: [
                  {
                    title: "Provenance & Title Verification",
                    description: "End-to-end cryptographic and physical provenance validation, historical title chain audits, and museum-grade condition diagnostics.",
                    badge: "Risk Mitigation",
                  },
                  {
                    title: "Cultural Trust & Estate Structuring",
                    description: "Tax-efficient estate preservation, cross-generational legacy trusts, and endowment governance for private collection foundations.",
                    badge: "Wealth Advisory",
                  },
                  {
                    title: "Museum Acquisition & Deaccession",
                    description: "Strategic curatorial negotiation, auction agency, private treaty sales, and bilateral institutional gift structuring.",
                    badge: "Market Counsel",
                  },
                ],
              },
            },
          ],
        },
        {
          title: "Institutional Consultation Request",
          orderIndex: 2,
          gridSpan: 12,
          customCssClass: "py-20 bg-background",
          subSections: [
            {
              title: "Consultation CTA",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_cta",
                archetype: "PROFESSIONAL",
                title: "Initiate a Confidential Strategic Consultation",
                subtitle: "Our senior partners respond to qualified institutional and family office inquiries within 24 business hours.",
                buttonText: "Request Briefing Appointment",
                actionUrl: "/contact",
                secondaryText: "Strict non-disclosure agreements executed prior to any artifact or balance sheet review.",
              },
            },
          ],
        },
      ];

    case "PORTFOLIO":
      return [
        {
          title: "Masterwork Atelier Hero",
          orderIndex: 0,
          gridSpan: 12,
          customCssClass: "py-20 md:py-28 relative overflow-hidden border-b border-border/60",
          subSections: [
            {
              title: "Atelier Hero Visual",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_hero",
                archetype: "PORTFOLIO",
                badge: "Heritage Masterwork Collection",
                headline: pageTitle || "Living Digital Atelier & Sacred Gold Leaf Archive",
                subheadline: "Immerse in classical Thanjavur and Mysore fine art compositions, rendered with 24k gold leaf filigree, natural mineral pigments, and consecrated iconographic precision.",
                primaryCtaText: "Enter Exhibition Corridor",
                primaryCtaUrl: "/gallery",
                secondaryCtaText: "Request Private Commission",
                secondaryCtaUrl: "/commission",
                featuredWorksCount: 39,
              },
            },
          ],
        },
        {
          title: "Curatorial Exhibition Corridor",
          orderIndex: 1,
          gridSpan: 12,
          customCssClass: "py-16 bg-muted/20 border-b border-border/60",
          subSections: [
            {
              title: "Exhibition Highlights",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_portfolio_strip",
                archetype: "PORTFOLIO",
                title: "Selected Masterworks & Provenance",
                subtitle: "Each composition is accompanied by an authenticated monograph, 24K gold assay certificate, and archival placard.",
              },
            },
          ],
        },
        {
          title: "Masterwork Monograph & Authenticity",
          orderIndex: 2,
          gridSpan: 12,
          customCssClass: "py-16 bg-card border-b border-border/60",
          subSections: [
            {
              title: "Authenticated Monograph Showcase",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_artist_monograph",
                archetype: "PORTFOLIO",
                title: "Authenticated Curatorial Monograph & Provenance",
                subtitle: "Every composition leaves our atelier accompanied by consecrated iconographic documentation, assay certificates, and physical museum placards.",
              },
            },
          ],
        },
        {
          title: "Curatorial Acquisition Inquiry",
          orderIndex: 3,
          gridSpan: 12,
          customCssClass: "py-20 bg-background",
          subSections: [
            {
              title: "Acquisition CTA",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_cta",
                archetype: "PORTFOLIO",
                title: "Commission or Acquire an Authentic Masterwork",
                subtitle: "Private curatorial viewings, custom dimensions, and traditional iconographic consultations arranged by private appointment.",
                buttonText: "Schedule Private Curatorial Inquiry",
                actionUrl: "/commission",
                secondaryText: "Worldwide secure insured white-glove art transit available.",
              },
            },
          ],
        },
      ];

    case "RESTAURANT":
      return [
        {
          title: "Culinary Ambiance Banner",
          orderIndex: 0,
          gridSpan: 12,
          customCssClass: "py-20 md:py-32 text-center border-b border-border/60",
          subSections: [
            {
              title: "Dining Hero",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_hero",
                archetype: "RESTAURANT",
                badge: "Artisanal Culinary Archive",
                headline: pageTitle || "Heritage Gastronomy & Seasonal Tasting Corridors",
                subheadline: "A multisensory celebration of ancient regional spices, slow fire cooking, and Michelin-inspired contemporary plating.",
                primaryCtaText: "Reserve a Table",
                primaryCtaUrl: "#reservations",
                secondaryCtaText: "View Seasonal Menu",
                secondaryCtaUrl: "#menu",
              },
            },
          ],
        },
        {
          title: "Interactive Table Reservations",
          orderIndex: 1,
          gridSpan: 12,
          customCssClass: "py-12 bg-muted/20 border-b border-border/60",
          subSections: [
            {
              title: "Reservation Booking Bar",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_reservation_bar",
                archetype: "RESTAURANT",
                title: "Reserve an Atelier Dining Experience",
                subtitle: "Private salon tables and chef's tasting degustations by reservation only.",
              },
            },
          ],
        },
        {
          title: "Categorized Dining Menu Matrix",
          orderIndex: 2,
          gridSpan: 12,
          customCssClass: "py-16 bg-card border-b border-border/60",
          subSections: [
            {
              title: "Menu Items Matrix",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_menu_matrix",
                archetype: "RESTAURANT",
                title: "Curated Seasonal Degustation",
                categories: [
                  {
                    name: "Appetizers & Starters",
                    items: [
                      { name: "Smoked Saffron Paneer Tikka", price: "₹650", dietary: ["Vegetarian", "Gluten-Free"], description: "Charcoal roasted cottage cheese infused with Kashmiri saffron and wild cardamom." },
                      { name: "Heritage Lentil Galette", price: "₹580", dietary: ["Vegan"], description: "Crisp spiced brown lentil patties served with wood-fired mint chutney." },
                    ],
                  },
                  {
                    name: "Curated Master Mains",
                    items: [
                      { name: "Claypot Slow-Cooked Dal Makhani", price: "₹720", dietary: ["Vegetarian", "Chef Signature"], description: "Simmered for 36 hours over wood ember coals, finished with cultured churned butter." },
                      { name: "Royal Awadhi Dum Biryani", price: "₹890", dietary: ["Chef Signature"], description: "Fragrant aged basmati rice cooked in a sealed earthen handi with royal potli spices." },
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          title: "Private Dining & Group Banquets",
          orderIndex: 3,
          gridSpan: 12,
          customCssClass: "py-20 bg-background",
          subSections: [
            {
              title: "Banquet CTA",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_cta",
                archetype: "RESTAURANT",
                title: "Host an Exclusive Atelier Salon Dinner",
                subtitle: "Private salon chambers accommodate up to 32 distinguished guests for custom paired tasting menus and bespoke sommelier curations.",
                buttonText: "Inquire Private Dining Chamber",
                actionUrl: "/contact",
                secondaryText: "Custom dietary bespoke tasting menus accommodated with 48 hours notice.",
              },
            },
          ],
        },
      ];

    case "HOSPITALITY":
      return [
        {
          title: "Retreat & Hospitality Hero",
          orderIndex: 0,
          gridSpan: 12,
          customCssClass: "py-24 border-b border-border/60",
          subSections: [
            {
              title: "Hospitality Hero",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_hero",
                archetype: "HOSPITALITY",
                badge: "Heritage Sanctuary & Retreat",
                headline: pageTitle || "Bespoke Tranquility, Architectural Heritage & Private Corridors",
                subheadline: "Nestled in pristine natural sanctuaries, each suite marries antique timber craft with contemporary five-star seclusion and intuitive private concierge service.",
                primaryCtaText: "Check Availability & Suites",
                primaryCtaUrl: "#suites",
                secondaryCtaText: "Explore Curated Experiences",
                secondaryCtaUrl: "#amenities",
              },
            },
          ],
        },
        {
          title: "Suite Availability Search Engine",
          orderIndex: 1,
          gridSpan: 12,
          customCssClass: "py-12 bg-muted/20 border-b border-border/60",
          subSections: [
            {
              title: "Availability Bar",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_availability_bar",
                archetype: "HOSPITALITY",
                title: "Check Sanctuary Suite Availability",
                subtitle: "Direct reservations receive complimentary private butler service & airport transfers.",
              },
            },
          ],
        },
        {
          title: "Suite Showcase & Amenities",
          orderIndex: 2,
          gridSpan: 12,
          customCssClass: "py-16 bg-card border-b border-border/60",
          subSections: [
            {
              title: "Suites & Amenities",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_hospitality",
                archetype: "HOSPITALITY",
                title: "Signature Suites & Villas",
                amenities: ["Private Heated Plunge Pool", "24/7 Dedicated Butler", "Organic Farm-to-Table Dining", "Helipad & Private Chauffeur"],
                suites: [
                  { name: "The Royal Heritage Villa", area: "2,400 sq.ft", occupancy: "2-4 Guests", view: "Valley & Mist Panorama" },
                  { name: "The Courtyard Verandah Suite", area: "1,200 sq.ft", occupancy: "2 Guests", view: "Private Zen Lotus Pond" },
                ],
              },
            },
          ],
        },
        {
          title: "Bespoke Concierge & Arrival",
          orderIndex: 3,
          gridSpan: 12,
          customCssClass: "py-20 bg-background",
          subSections: [
            {
              title: "Hospitality CTA",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_cta",
                archetype: "HOSPITALITY",
                title: "Reserve Your Private Sanctuary Escape",
                subtitle: "Experience transcendent silence, personalized wellness therapies, and Michelin-inspired regional menus.",
                buttonText: "Request Bespoke Concierge Booking",
                actionUrl: "/contact",
                secondaryText: "Tailored private helicopter transfers available from metropolitan airports.",
              },
            },
          ],
        },
      ];

    case "HEALTHCARE":
      return [
        {
          title: "Specialty Clinic Hero",
          orderIndex: 0,
          gridSpan: 12,
          customCssClass: "py-20 border-b border-border/60",
          subSections: [
            {
              title: "Healthcare Hero",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_hero",
                archetype: "HEALTHCARE",
                badge: "NABH Accredited Specialty Center",
                headline: pageTitle || "Excellence in Integrative Healthcare & Precision Wellness",
                subheadline: "Combining board-certified clinical specialists, state-of-the-art diagnostic imaging, and compassionate patient-first care pathways.",
                primaryCtaText: "Book Doctor Appointment",
                primaryCtaUrl: "#appointment",
                secondaryCtaText: "Explore Departments",
                secondaryCtaUrl: "#specialties",
              },
            },
          ],
        },
        {
          title: "Clinical Specialties & Consulting Faculty",
          orderIndex: 1,
          gridSpan: 12,
          customCssClass: "py-16 bg-muted/20 border-b border-border/60",
          subSections: [
            {
              title: "Specialty Filter & Doctor Grid",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_specialty_filter",
                archetype: "HEALTHCARE",
                title: "Clinical Specialties & Consulting Faculty",
                subtitle: "Filter by medical discipline to review lead consultants, diagnostic equipment, and consultation timings.",
              },
            },
          ],
        },
        {
          title: "Clinical Departments & Specialized Centers",
          orderIndex: 2,
          gridSpan: 12,
          customCssClass: "py-16 bg-card border-b border-border/60",
          subSections: [
            {
              title: "Specialties Grid",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_healthcare",
                archetype: "HEALTHCARE",
                title: "Clinical Departments & Specialized Centers",
                specialties: [
                  { name: "Preventive Cardiology", lead: "Dr. A. Sharma, MD (Card)", focus: "Non-invasive hemodynamics & risk stratification" },
                  { name: "Orthopedics & Joint Rejuvenation", lead: "Dr. S. Venkat, MS (Ortho)", focus: "Minimally invasive arthroscopy & sports rehabilitation" },
                  { name: "Integrative Metabolic Health", lead: "Dr. R. Nair, MD, Dip. Endo", focus: "Personalized reversal of metabolic syndromes" },
                ],
              },
            },
          ],
        },
        {
          title: "Patient Assurance & Clinical FAQ",
          orderIndex: 3,
          gridSpan: 12,
          customCssClass: "py-16 bg-background",
          subSections: [
            {
              title: "Healthcare FAQ",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_faq",
                archetype: "HEALTHCARE",
                title: "Frequently Asked Healthcare Questions",
                faqs: [
                  {
                    question: "Do you accept health insurance and cashless claims?",
                    answer: "Yes. We maintain direct cashless tie-ups with all major health insurance providers and third-party administrators (TPAs) for both inpatient and day-care procedures.",
                  },
                  {
                    question: "How quickly are radiological and lab results delivered?",
                    answer: "Digital imaging (MRI, CT, X-ray) and core biochemical panels are processed same-day and accessible securely through your patient health portal.",
                  },
                ],
              },
            },
          ],
        },
      ];

    case "CORPORATE":
      return [
        {
          title: "Modern SaaS Glow Hero",
          orderIndex: 0,
          gridSpan: 12,
          customCssClass: "py-24 md:py-32 relative overflow-hidden border-b border-border/60",
          subSections: [
            {
              title: "SaaS Hero",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_hero",
                archetype: "CORPORATE",
                badge: "Sovereign Multi-Tenant Cloud Architecture",
                headline: pageTitle || "Next-Generation Enterprise Digital Atelier & Publishing Infrastructure",
                subheadline: "Automate high-resolution cultural catalogs, WebDAV sovereign storage sync, and 3D WebGL spatial walkthroughs with sub-second performance.",
                primaryCtaText: "Start Enterprise Free Trial",
                primaryCtaUrl: "/admin",
                secondaryCtaText: "Request Architecture Deck",
                secondaryCtaUrl: "#features",
                metrics: [
                  { label: "Uptime SLA", value: "99.99%", change: "Zero Downtime" },
                  { label: "Global CDN Latency", value: "< 28ms", change: "Edge Cached" },
                  { label: "Active Tenants", value: "1,200+", change: "Growing Fast" },
                ],
              },
            },
          ],
        },
        {
          title: "Interactive Archive Performance & ROI Engine",
          orderIndex: 1,
          gridSpan: 12,
          customCssClass: "py-16 bg-muted/20 border-b border-border/60",
          subSections: [
            {
              title: "ROI Calculator",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_roi_calculator",
                archetype: "CORPORATE",
                title: "Interactive Archive Performance & ROI Engine",
                subtitle: "Calculate your latency acceleration, storage sovereign savings, and curatorial verification efficiency.",
              },
            },
          ],
        },
        {
          title: "Feature Matrix & Hover Elevation Grid",
          orderIndex: 2,
          gridSpan: 12,
          customCssClass: "py-20 bg-card border-b border-border/60",
          subSections: [
            {
              title: "SaaS Features",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_corporate_features",
                archetype: "CORPORATE",
                title: "Engineered for Extreme Reliability & Sovereignty",
                features: [
                  {
                    title: "Universal Multi-Tenant Drivers",
                    description: "Connect S3, Cloudflare R2, Google Workspace, or Nextcloud WebDAV seamlessly with single-switch failover.",
                  },
                  {
                    title: "Synchronous Print Engine",
                    description: "Headless isolated iframe rendering with eager asynchronous image decoding barriers eliminates missing assets permanently.",
                  },
                  {
                    title: "3D Spatial Salon Walls",
                    description: "WebGL Three.js spatial corridors calculate physical aspect ratios and gold fillets dynamically from natural image dimensions.",
                  },
                ],
              },
            },
          ],
        },
        {
          title: "Transparent Sovereign Tiers",
          orderIndex: 3,
          gridSpan: 12,
          customCssClass: "py-16 bg-muted/20 border-b border-border/60",
          subSections: [
            {
              title: "Pricing Matrix",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_pricing_table",
                archetype: "CORPORATE",
                title: "Transparent Sovereign Tiers",
                subtitle: "Deploy with zero licensing lock-in. Scale from an artisanal studio to a multi-national museum network.",
              },
            },
          ],
        },
        {
          title: "Enterprise FAQ Accordion",
          orderIndex: 4,
          gridSpan: 12,
          customCssClass: "py-16 bg-background",
          subSections: [
            {
              title: "FAQ Accordion",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "landing_faq",
                archetype: "CORPORATE",
                title: "Frequently Asked Questions",
                faqs: [
                  {
                    question: "Can I promote a landing page to replace the homepage without losing existing page blocks?",
                    answer: "Yes. Landing pages are created in a decoupled sandbox. Promoting a landing page toggles isHomepage atomically, and demoting it immediately restores your default homepage without losing any content.",
                  },
                  {
                    question: "Does the storage engine support hybrid multi-cloud failover?",
                    answer: "Yes. The platform provides native drivers for Local Disk, Cloudflare R2, Amazon S3, Google Drive, and Nextcloud WebDAV.",
                  },
                ],
              },
            },
          ],
        },
      ];

    case "BLANK":
    default:
      return [
        {
          title: "Custom Canvas Section",
          orderIndex: 0,
          gridSpan: 12,
          customCssClass: "py-20",
          subSections: [
            {
              title: "Starter Block",
              orderIndex: 0,
              gridSpan: 12,
              content: {
                type: "doc",
                content: [
                  {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: pageTitle || "Welcome to Your Custom Landing Page" }],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Add custom blocks, columns, or media showcase components using the Page Builder Studio.",
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ];
  }
}
