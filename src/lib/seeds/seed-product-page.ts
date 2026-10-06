import { PrismaClient, MenuPosition } from "@prisma/client";

export async function seedProductPage(prisma: PrismaClient, options: { forceUpdate?: boolean } = {}) {
  console.log("🚀 Initializing Product Tour Page (/product) seeder...");

  // 1. Check for existing page with slug: "product"
  const existingPage = await prisma.page.findUnique({
    where: { slug: "product" },
    include: {
      sections: {
        include: {
          subSections: true,
        },
      },
    },
  });

  const shouldSeedSections = !existingPage || existingPage.sections.length === 0 || options.forceUpdate;

  let pageId = existingPage?.id;

  if (!existingPage) {
    const created = await prisma.page.create({
      data: {
        title: "Platform Capabilities & Solutions",
        slug: "product",
        pageType: "STANDARD",
        isPublished: true,
        publishedAt: new Date(),
        isActive: true,
        isHomepage: false,
        metaDescription:
          "Explore the complete digital platform for artists, galleries, and exhibition directors: 3D WebGL salon walkthroughs, sovereign multi-cloud storage, museum placards, and e-catalog publishing.",
      },
    });
    pageId = created.id;
    console.log("✅ Created /product page record in database.");
  } else {
    console.log(`ℹ️ Existing /product page detected (ID: ${existingPage.id}, Sections: ${existingPage.sections.length}).`);
  }

  if (shouldSeedSections && pageId) {
    if (existingPage && existingPage.sections.length > 0 && options.forceUpdate) {
      console.log("🔄 Force update requested: replacing existing /product sections...");
      await prisma.subSection.deleteMany({
        where: { section: { pageId } },
      });
      await prisma.pageSection.deleteMany({
        where: { pageId },
      });
    }

    console.log("📦 Seeding 12 dynamic sections for /product...");

    const sectionsData = [
      // Section 1: Hero & Strategic Value Proposition
      {
        orderIndex: 1,
        title: "The Complete Digital Platform for Artists, Galleries, and Exhibition Directors",
        subtitle: "ENTERPRISE CULTURAL PLATFORM • GLOBAL EDITION",
        description:
          "Curate physical masterworks, architect 3D WebGL salon walkthroughs, manage multi-day exhibition RSVPs, publish editorial print-ready e-catalogs, and safeguard sovereign art archives with enterprise privacy.",
        titleAlignment: "center",
        gridSpan: 12,
        slug: "hero",
        customCssClass: "py-12 sm:py-16 border-b border-border/60",
        subSections: [
          {
            title: "Hero Showcase & Metrics",
            orderIndex: 1,
            gridSpan: 12,
            content: {
              blocks: [
                {
                  id: "prod-hero-blk",
                  type: "HERO_BLOCK",
                  data: {
                    badge: "ENTERPRISE CULTURAL PLATFORM • GLOBAL EDITION",
                    headline: "The Complete Digital Platform for Artists, Galleries, and Exhibition Directors",
                    subtext:
                      "Curate physical masterworks, architect 3D WebGL salon walkthroughs, manage multi-day exhibition RSVPs, publish editorial print-ready e-catalogs, and safeguard sovereign art archives with enterprise privacy.",
                    primaryCtaText: "Explore Interactive Modules",
                    primaryCtaUrl: "#modules",
                    secondaryCtaText: "Schedule Platform Walkthrough",
                    secondaryCtaUrl: "/contact",
                  },
                },
                {
                  id: "prod-metrics-blk",
                  type: "METRIC_GRID",
                  data: {
                    metrics: [
                      { value: "100%", label: "Sovereign Storage" },
                      { value: "3D WebGL", label: "Zero-Latency Virtual Salon" },
                      { value: "300 DPI", label: "Print-Ready Placards & Catalogs" },
                      { value: "Sub-Second", label: "Ingestion & Provenance Sync" },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },

      // Section 2: Persona-Driven Solutions Hub
      {
        orderIndex: 2,
        title: "Built for the Global Fine Arts Ecosystem",
        subtitle: "TAILORED WORKFLOWS",
        description:
          "Whether you are a solo master artist, an international biennale curator, or an emerging academy student, the platform adapts to your curatorial lifecycle.",
        titleAlignment: "center",
        gridSpan: 12,
        slug: "solutions",
        customCssClass: "py-16 sm:py-20 bg-muted/20 border-b border-border/60",
        subSections: [
          {
            title: "Persona Solutions Matrix",
            orderIndex: 1,
            gridSpan: 12,
            content: {
              type: "TABBED_FEATURE_BLOCK",
              data: {
                tabs: [
                  {
                    id: "tab-artists",
                    label: "Master Artists & Independent Ateliers",
                    title: "Authentic Archival & High-Fidelity Provenance",
                    copy: "High-resolution media vaults, dynamic client-side watermarking, multi-currency valuation pricing, and private acquisition inquiries.",
                  },
                  {
                    id: "tab-directors",
                    label: "Exhibition Directors & Biennale Organizers",
                    title: "Turnkey Exhibition & Visitor Operations",
                    copy: "International timezone-protected scheduling, multi-day calendar engines with 15/30/60-min RSVP intervals, live floor QR codes, and automated visitor check-ins.",
                  },
                  {
                    id: "tab-students",
                    label: "Fine Art Students & Graduating Academies",
                    title: "Rapid Onboarding & Retrospective Showcases",
                    copy: "Publish thesis collections, generate digital monograph e-catalogs, and launch professional portfolio exhibitions without code.",
                  },
                  {
                    id: "tab-galleries",
                    label: "Commercial Galleries & Art Foundations",
                    title: "Client Acquisition & Sovereign Privacy",
                    copy: "Inbound CRM lead capture, verified email OTP gates, one-click GDPR/DPDP data erasure, and multi-cloud storage synchronization.",
                  },
                ],
              },
            },
          },
        ],
      },

      // Section 3: Visual Page Builder & Layout Engine (Target of #modules CTA)
      {
        orderIndex: 3,
        title: "Dynamic 12-Column Visual Page Studio",
        subtitle: "CONTENT ARCHITECTURE",
        description: "Create bespoke public experiences with responsive column splitting and visual editing.",
        titleAlignment: "center",
        gridSpan: 12,
        slug: "modules",
        customCssClass: "py-16 sm:py-20 border-b border-border/60",
        subSections: [
          {
            title: "Page Studio Engine",
            orderIndex: 1,
            gridSpan: 12,
            content: {
              type: "FEATURE_GRID",
              data: {
                columns: 4,
                features: [
                  {
                    title: "Drag-and-Drop Layout Grid",
                    description: "Flexible multi-column containers (1/1, 1/2, 1/3, 1/4) with dynamic margins.",
                  },
                  {
                    title: "Inline Tiptap WYSIWYG",
                    description: "Real-time editorial formatting, quotes, token chips, and styled callouts.",
                  },
                  {
                    title: "Modular Block Ecosystem",
                    description: "Timelines, accordions, dynamic forms, metric counters, and media players.",
                  },
                  {
                    title: "Decoupled Sandbox & Homepage Promotion",
                    description: "Build and test landing pages in a sandbox, then atomically promote to homepage in one click.",
                  },
                ],
              },
            },
          },
        ],
      },

      // Section 4: Flexible Menu Navigation Architecture
      {
        orderIndex: 4,
        title: "Multi-Zone Navigation Hierarchy",
        subtitle: "INFORMATION DESIGN",
        description: "Deliver fluid visitor journeys across desktop, tablet, and mobile displays.",
        titleAlignment: "center",
        gridSpan: 12,
        slug: "navigation",
        customCssClass: "py-16 sm:py-20 bg-muted/20 border-b border-border/60",
        subSections: [
          {
            title: "Navigation Architecture",
            orderIndex: 1,
            gridSpan: 12,
            content: {
              type: "FEATURE_GRID",
              data: {
                columns: 3,
                features: [
                  {
                    title: "3-Tier Hierarchical Menus",
                    description: "Root links, dropdown menus, and nested collections.",
                  },
                  {
                    title: "Multi-Zone Layout Engine",
                    description: "Independent headers for Top-Center, Top-Left, Top-Right CTA, and Sidebar Left.",
                  },
                  {
                    title: "Mobile Slide-Out Drawer",
                    description: "Safe-area compliant responsive touch navigation.",
                  },
                ],
              },
            },
          },
        ],
      },

      // Section 5: Administrative Command Center & Telemetry
      {
        orderIndex: 5,
        title: "Executive Platform Dashboard",
        subtitle: "OPERATIONAL CONTROL",
        description: "Unified visibility into assets, inquiries, events, and infrastructure health.",
        titleAlignment: "center",
        gridSpan: 12,
        slug: "dashboard",
        customCssClass: "py-16 sm:py-20 border-b border-border/60",
        subSections: [
          {
            title: "Dashboard & Control",
            orderIndex: 1,
            gridSpan: 12,
            content: {
              type: "FEATURE_GRID",
              data: {
                columns: 3,
                features: [
                  {
                    title: "Live KPI Metrics",
                    description: "Real-time tallies of artworks, active categories, published catalogs, and visitor leads.",
                  },
                  {
                    title: "Infrastructure Monitoring",
                    description: "Direct indicators for PostgreSQL connection status, Coolify container uptime, and storage health.",
                  },
                  {
                    title: "Quick Actions",
                    description: "Fast-access shortcuts to curate events, print placards, and review inquiries.",
                  },
                ],
              },
            },
          },
        ],
      },

      // Section 6: SEO & AI-Optimized Publishing Engine
      {
        orderIndex: 6,
        title: "Schema.org AEO & Editorial Journal",
        subtitle: "DISCOVERABILITY",
        description: "Maximize reach across traditional search engines and conversational AI models.",
        titleAlignment: "center",
        gridSpan: 12,
        slug: "seo-publishing",
        customCssClass: "py-16 sm:py-20 bg-muted/20 border-b border-border/60",
        subSections: [
          {
            title: "Discoverability Features",
            orderIndex: 1,
            gridSpan: 12,
            content: {
              type: "FEATURE_GRID",
              data: {
                columns: 3,
                features: [
                  {
                    title: "Answer Engine Optimization (AEO)",
                    description: "Automatic JSON-LD structured data embedding for AI knowledge extraction.",
                  },
                  {
                    title: "Rich Editorial Tools",
                    description: "Summary abstracts, tag taxonomy, author profiles, and media embeds.",
                  },
                  {
                    title: "Search Engine Optimization",
                    description: "Granular control over meta titles, canonical links, and Open Graph previews.",
                  },
                ],
              },
            },
          },
        ],
      },

      // Section 7: Multi-Tier Art Categories & Taxonomy
      {
        orderIndex: 7,
        title: "Hierarchical Collection Taxonomy",
        subtitle: "CURATORIAL CLASSIFICATION",
        description: "Organize masterworks across schools, mediums, eras, and custom disciplines.",
        titleAlignment: "center",
        gridSpan: 12,
        slug: "taxonomy",
        customCssClass: "py-16 sm:py-20 border-b border-border/60",
        subSections: [
          {
            title: "Taxonomy Engine",
            orderIndex: 1,
            gridSpan: 12,
            content: {
              type: "FEATURE_GRID",
              data: {
                columns: 3,
                features: [
                  {
                    title: "Parent & Sub-Category Tree",
                    description: "Unbounded relational hierarchy with inheritances.",
                  },
                  {
                    title: "Dynamic Permalinks",
                    description: "Clean, SEO-optimized URL slugs for specialized collections.",
                  },
                  {
                    title: "Curatorial Introductions",
                    description: "Rich descriptions, hero imagery, and custom category badges.",
                  },
                ],
              },
            },
          },
        ],
      },

      // Section 8: Artwork Master Catalog & Vault Management
      {
        orderIndex: 8,
        title: "Comprehensive Masterwork Archive",
        subtitle: "COLLECTION REPOSITORY",
        description: "Detailed cataloging with high-resolution imagery and intellectual property protection.",
        titleAlignment: "center",
        gridSpan: 12,
        slug: "master-catalog",
        customCssClass: "py-16 sm:py-20 bg-muted/20 border-b border-border/60",
        subSections: [
          {
            title: "Vault Management",
            orderIndex: 1,
            gridSpan: 12,
            content: {
              type: "FEATURE_GRID",
              data: {
                columns: 3,
                features: [
                  {
                    title: "Granular Artwork Ledger",
                    description:
                      "Title, artist, medium, dimensions, year of creation, provenance, and multi-currency pricing (USD, EUR, GBP, INR, AED, SGD).",
                  },
                  {
                    title: "Bulk Spreadsheet Operations",
                    description: "Fast onboarding and collection updates via Excel import/export.",
                  },
                  {
                    title: "Dynamic Watermark Guard",
                    description: "Automatic overlay protection on public previews while preserving raw originals in the private vault.",
                  },
                ],
              },
            },
          },
        ],
      },

      // Section 9: Curatorial e-Catalogs & Museum Placard Engine
      {
        orderIndex: 9,
        title: "Digital Monographs & Exhibition Placards",
        subtitle: "PUBLISHING & PRINT",
        description: "Generate publication-grade catalogs and gallery wall labels instantly.",
        titleAlignment: "center",
        gridSpan: 12,
        slug: "publishing-placards",
        customCssClass: "py-16 sm:py-20 border-b border-border/60",
        subSections: [
          {
            title: "Publishing Suite",
            orderIndex: 1,
            gridSpan: 12,
            content: {
              type: "FEATURE_GRID",
              data: {
                columns: 3,
                features: [
                  {
                    title: "Digital e-Catalog Monographs",
                    description: "Curatorial essays, magazine layouts, colophon leaves, and ornamental gold borders.",
                  },
                  {
                    title: "Headless Print Isolation Driver",
                    description: "Flawless PDF downloads with zero missing images via synchronous preloader barriers.",
                  },
                  {
                    title: "Museum Wall Placards",
                    description: "300 DPI exhibition display cards with QR codes, dimensions, price overrides, and 18mm clamp margins.",
                  },
                ],
              },
            },
          },
        ],
      },

      // Section 10: Exhibitions, Multi-Day RSVPs & 3D WebGL Salon
      {
        orderIndex: 10,
        title: "Event Management & 3D Virtual Gallery",
        subtitle: "EXPERIENCE ARCHITECTURE",
        description: "Engage global audiences through interactive physical events and virtual salon spaces.",
        titleAlignment: "center",
        gridSpan: 12,
        slug: "exhibitions-3d",
        customCssClass: "py-16 sm:py-20 bg-muted/20 border-b border-border/60",
        subSections: [
          {
            title: "Spatial Experience Suite",
            orderIndex: 1,
            gridSpan: 12,
            content: {
              type: "FEATURE_GRID",
              data: {
                columns: 3,
                features: [
                  {
                    title: "Timezone-Protected Scheduling",
                    description: "Multi-day schedules with independent daily hours and 15/30/45/60-minute RSVP booking intervals.",
                  },
                  {
                    title: "3D WebGL Exhibition Salon Studio",
                    description:
                      "Interactive Three.js/R3F virtual gallery with 7 architectural environments, museum eye-level hanging (1.55m), and cinematic camera tours.",
                  },
                  {
                    title: "Physical QR Integration",
                    description: "Floor scan codes providing instant artwork provenance to mobile visitors.",
                  },
                ],
              },
            },
          },
        ],
      },

      // Section 11: Inbound CRM Leads & Visitor Intelligence
      {
        orderIndex: 11,
        title: "Unified CRM & Lead Management",
        subtitle: "AUDIENCE INTELLIGENCE",
        description: "Track visitor interactions, acquisition inquiries, and exhibition registrations.",
        titleAlignment: "center",
        gridSpan: 12,
        slug: "crm-leads",
        customCssClass: "py-16 sm:py-20 border-b border-border/60",
        subSections: [
          {
            title: "Audience Pipeline",
            orderIndex: 1,
            gridSpan: 12,
            content: {
              type: "FEATURE_GRID",
              data: {
                columns: 3,
                features: [
                  {
                    title: "Multi-Source Capture",
                    description: "Unified tracking from contact forms, event RSVPs, custom forms, and in-gallery QR scans.",
                  },
                  {
                    title: "Persistent Device Identity",
                    description: "Frictionless multi-scan experience for mobile patrons without repetitive forms.",
                  },
                  {
                    title: "Lead Pipeline & Export",
                    description: "Lead status tracking, detailed inquiry notes, and one-click CSV export.",
                  },
                ],
              },
            },
          },
        ],
      },

      // Section 12: Enterprise System Configuration Hub
      {
        orderIndex: 12,
        title: "Comprehensive System Settings",
        subtitle: "PLATFORM ADMINISTRATION",
        description: "Full control over branding, storage, security, communications, and intelligence.",
        titleAlignment: "center",
        gridSpan: 12,
        slug: "system-config",
        customCssClass: "py-16 sm:py-20 bg-muted/20",
        subSections: [
          {
            title: "Administration Engine",
            orderIndex: 1,
            gridSpan: 12,
            content: {
              type: "ACCORDION_BLOCK",
              data: {
                items: [
                  {
                    title: "White-Label & General Branding",
                    description: "Custom logos, favicons, site titles, and strict multi-tenant brand neutrality.",
                  },
                  {
                    title: "Sovereign & Multi-Cloud Storage",
                    description:
                      "Local private media vault by default, with native Cloudflare R2, AWS S3, Google Drive v3, and Nextcloud WebDAV REST drivers.",
                  },
                  {
                    title: "Email & SMTP Communications",
                    description:
                      "SMTP server setup, transactional auto-responders, 1-click unsubscribe links, and dynamic token interpolation.",
                  },
                  {
                    title: "Form Bot Defense & Security",
                    description:
                      "Per-form configurable Math CAPTCHA challenges and 6-digit Email OTP verification with verified returning-user bypass.",
                  },
                  {
                    title: "Multi-Model AI Engine Integration",
                    description:
                      "Native support for OpenAI, Google Gemini, Anthropic Claude, and local private LLMs (Ollama / LM Studio) powering writing assistants.",
                  },
                  {
                    title: "Real-Time Theme Studio",
                    description: "Fine-grained palette controls for instant Dark and Light mode switching.",
                  },
                  {
                    title: "GDPR & Privacy Compliance",
                    description: "One-click personal data erasure workflows and universal privacy policy consent checkboxes.",
                  },
                ],
              },
            },
          },
        ],
      },
    ];

    for (const sec of sectionsData) {
      await prisma.pageSection.create({
        data: {
          pageId,
          orderIndex: sec.orderIndex,
          title: sec.title,
          subtitle: sec.subtitle,
          description: sec.description,
          titleAlignment: sec.titleAlignment,
          gridSpan: sec.gridSpan,
          slug: sec.slug,
          customCssClass: sec.customCssClass,
          subSections: {
            create: sec.subSections.map((sub) => ({
              orderIndex: sub.orderIndex,
              title: sub.title,
              gridSpan: sub.gridSpan,
              content: sub.content,
            })),
          },
        },
      });
    }

    console.log("✅ Successfully seeded all 12 dynamic sections for /product.");
  } else {
    console.log("🛡️ Preserved existing user modifications for /product sections.");
  }

  // 2. Navigation Seeding: Add /product to main menu if not present
  const existingProductMenu = await prisma.menuItem.findFirst({
    where: {
      OR: [{ path: "/product" }, { label: { equals: "Product", mode: "insensitive" } }],
    },
  });

  if (!existingProductMenu) {
    // Check if another item occupies orderIndex 2 at TOP_CENTER
    const conflictItem = await prisma.menuItem.findFirst({
      where: { position: MenuPosition.TOP_CENTER, orderIndex: 2, parentId: null },
    });

    if (conflictItem) {
      // Shift existing items >= 2 up by 1 to make room cleanly
      await prisma.menuItem.updateMany({
        where: {
          position: MenuPosition.TOP_CENTER,
          parentId: null,
          orderIndex: { gte: 2 },
        },
        data: {
          orderIndex: { increment: 1 },
        },
      });
    }

    await prisma.menuItem.create({
      data: {
        label: "Product",
        path: "/product",
        position: MenuPosition.TOP_CENTER,
        orderIndex: 2,
        isActive: true,
      },
    });
    console.log("✅ Added 'Product' (/product) to TOP_CENTER navigation menu at order 2.");
  } else {
    console.log(`ℹ️ Navigation item for /product already exists (ID: ${existingProductMenu.id}).`);
  }
}
