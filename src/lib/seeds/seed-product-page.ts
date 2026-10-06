import { PrismaClient, Prisma } from "@prisma/client";

// ============================================================================
// ProseMirror / Tiptap AST Generation Helpers (100% Native Inline WYSIWYG)
// ============================================================================
function tiptapText(text: string, marks?: { type: string; attrs?: Record<string, unknown> }[]) {
  return {
    type: "text",
    text,
    ...(marks && marks.length > 0 ? { marks } : {}),
  };
}

function tiptapEyebrow(text: string) {
  return {
    type: "paragraph",
    content: [
      tiptapText(text, [
        { type: "bold" },
        {
          type: "textStyle",
          attrs: { color: "#D4AF37", fontSize: "11px" },
        },
      ]),
    ],
  };
}

function tiptapHeading(text: string, level = 2) {
  return {
    type: "heading",
    attrs: { level },
    content: [tiptapText(text)],
  };
}

function tiptapParagraph(text: string, marks?: { type: string; attrs?: Record<string, unknown> }[]) {
  return {
    type: "paragraph",
    content: [tiptapText(text, marks)],
  };
}

function tiptapBulletList(items: string[]) {
  return {
    type: "bulletList",
    content: items.map((item) => {
      const colonIdx = item.indexOf(":");
      if (colonIdx > 0) {
        const title = item.slice(0, colonIdx + 1);
        const rest = item.slice(colonIdx + 1);
        return {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [
                tiptapText(title, [{ type: "bold" }]),
                tiptapText(rest),
              ],
            },
          ],
        };
      }
      return {
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: [tiptapText(item)],
          },
        ],
      };
    }),
  };
}

function tiptapDoc(...nodes: unknown[]) {
  return {
    type: "doc",
    content: nodes.flat(),
  };
}

export async function seedProductPage(prisma: PrismaClient, options: { forceUpdate?: boolean } = { forceUpdate: true }) {
  console.log("🚀 Initializing Redesigned Product Tour Page (/product) seeder...");

  // 1. Navigation Cleanup: Decouple /product from Main Navigation Menu
  await prisma.menuItem.deleteMany({
    where: {
      OR: [
        { path: "/product" },
        { path: "/product/" },
        { label: { equals: "Product", mode: "insensitive" } },
      ],
    },
  });
  console.log("🧹 Ensured /product is decoupled from public navigation menus.");

  // 2. Check for existing page with slug: "product"
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
          "The complete digital platform for independent artists, gallery curators, biennales, and art academies: 3D virtual exhibitions, high-res placards, and sovereign archives.",
      },
    });
    pageId = created.id;
    console.log("✅ Created /product page record in database.");
  } else {
    console.log(`ℹ️ Existing /product page detected (ID: ${existingPage.id}, Sections: ${existingPage.sections.length}).`);
  }

  const shouldSeedSections = !existingPage || existingPage.sections.length === 0 || options.forceUpdate;

  if (shouldSeedSections && pageId) {
    if (existingPage && existingPage.sections.length > 0) {
      console.log("🔄 Replacing existing /product sections with redesigned editorial layout...");
      await prisma.subSection.deleteMany({
        where: { section: { pageId } },
      });
      await prisma.pageSection.deleteMany({
        where: { pageId },
      });
    }

    console.log("📦 Seeding 7 editorial, 100% WYSIWYG-native sections for /product...");

    const sectionsData = [
      // ======================================================================
      // Act 1: The Atelier & Exhibition Operating System (Split Hero)
      // Zero double header: section title is null, heading is inside Left Column
      // ======================================================================
      {
        orderIndex: 1,
        slug: "hero",
        title: null,
        subtitle: null,
        description: null,
        titleAlignment: "left",
        gridSpan: 12,
        backgroundColor: "rgba(13, 14, 18, 0.4)",
        backgroundType: "COLOR",
        subSections: [
          // Left Column (7 cols): Native Tiptap Text + Dual Action Buttons
          {
            orderIndex: 1,
            gridSpan: 7,
            title: "Platform Hero & Mission",
            content: {
              blocks: [
                {
                  id: "hero-text-node",
                  type: "TEXT",
                  content: tiptapDoc(
                    tiptapEyebrow("FINE ART • EXHIBITION MANAGEMENT • DIGITAL CATALOGS"),
                    tiptapHeading("The All-In-One Platform to Showcase, Exhibit, and Sell Your Art", 1),
                    tiptapParagraph(
                      "Built specifically for independent artists, gallery curators, biennales, and art academies. Everything you need to manage your masterworks, host physical and 3D virtual exhibitions, print exhibition placards, and connect directly with collectors."
                    )
                  ),
                },
                {
                  id: "hero-btn-tour",
                  type: "BUTTON",
                  buttonText: "Start Platform Tour",
                  buttonUrl: "#features",
                  buttonVariant: "gold",
                },
                {
                  id: "hero-btn-inquiry",
                  type: "BUTTON",
                  buttonText: "Request Atelier Access",
                  buttonUrl: "#inquiry",
                  buttonVariant: "outline",
                },
              ],
            },
          },
          // Right Column (5 cols): Visual Teaser Card (Image + Placard + 3D CTA)
          {
            orderIndex: 2,
            gridSpan: 5,
            title: "Exhibition Card Preview",
            content: {
              _style: {
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderColor: "rgba(212, 175, 55, 0.3)",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: "rounded-2xl",
                boxShadow: "gold-glow",
                ornamentalFrame: true,
              },
              blocks: [
                {
                  id: "hero-preview-img",
                  type: "IMAGE",
                  mediaUrl:
                    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800",
                  mediaAlt: "Classical Masterwork Exhibition Plate",
                  mediaAspectRatio: "4:3",
                  mediaBorderRadius: "rounded-lg",
                  hasBorder: true,
                  borderWidth: 1,
                },
                {
                  id: "hero-preview-placard-text",
                  type: "TEXT",
                  content: tiptapDoc(
                    tiptapEyebrow("300 DPI MUSEUM PLACARD PREVIEW"),
                    tiptapHeading("Masterwork in Gold Leaf & Mineral Pigments", 3),
                    tiptapParagraph("48 × 36 in • 24K Gold Foil • Provenance Verified", [
                      { type: "textStyle", attrs: { color: "#94a3b8" } },
                    ]),
                    tiptapParagraph("● Virtual 3D Salon Walkthrough Live", [
                      { type: "bold" },
                      { type: "textStyle", attrs: { color: "#10b981" } },
                    ])
                  ),
                },
                {
                  id: "hero-preview-btn",
                  type: "BUTTON",
                  buttonText: "Preview 3D Exhibition Salon",
                  buttonUrl: "/exhibition-simulator",
                  buttonVariant: "outline",
                },
              ],
            },
          },
        ],
      },

      // ======================================================================
      // Act 2: Built for Every Creative Journey (4 Focused Persona Pillars)
      // Single Section Header + 4 distinct, inline-editable cards
      // ======================================================================
      {
        orderIndex: 2,
        slug: "personas",
        title: "Built for Every Creative Journey",
        subtitle: "TAILORED WORKFLOWS",
        description:
          "Whether you are an independent master artist, an international gallery, an art academy, or an advisory, the platform adapts to your curatorial lifecycle.",
        titleAlignment: "center",
        gridSpan: 12,
        backgroundColor: "rgba(10, 11, 15, 0.6)",
        backgroundType: "COLOR",
        subSections: [
          // Pillar 1: Independent Artists & Ateliers (3 cols)
          {
            orderIndex: 1,
            gridSpan: 3,
            title: "Independent Artists Pillar",
            content: {
              _style: {
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderColor: "rgba(212, 175, 55, 0.3)",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: "rounded-2xl",
                boxShadow: "soft",
              },
              ...tiptapDoc(
                tiptapEyebrow("🎨 INDEPENDENT ATELIERS"),
                tiptapHeading("Your Lifelong Masterwork Archive", 3),
                tiptapParagraph(
                  "High-resolution portfolio protection with automated watermarks, multi-currency price tags, and direct private collector inquiries without gallery commissions."
                )
              ),
            },
          },
          // Pillar 2: Galleries & Exhibition Organizers (3 cols)
          {
            orderIndex: 2,
            gridSpan: 3,
            title: "Galleries & Organizers Pillar",
            content: {
              _style: {
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderColor: "rgba(212, 175, 55, 0.3)",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: "rounded-2xl",
                boxShadow: "soft",
              },
              ...tiptapDoc(
                tiptapEyebrow("🏛️ GALLERIES & CURATORS"),
                tiptapHeading("Turnkey Exhibition Operations", 3),
                tiptapParagraph(
                  "Multi-day event scheduling with 30-minute guest arrival slots, live smartphone QR codes for every painting on the wall, and automated attendee tracking."
                )
              ),
            },
          },
          // Pillar 3: Art Academies & Students (3 cols)
          {
            orderIndex: 3,
            gridSpan: 3,
            title: "Art Academies Pillar",
            content: {
              _style: {
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderColor: "rgba(212, 175, 55, 0.3)",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: "rounded-2xl",
                boxShadow: "soft",
              },
              ...tiptapDoc(
                tiptapEyebrow("🎓 ACADEMIES & STUDENTS"),
                tiptapHeading("Launch Your Graduating Showcase", 3),
                tiptapParagraph(
                  "Rapid setup for thesis exhibitions, student retrospectives, and digital monographs ready for university review boards without writing code."
                )
              ),
            },
          },
          // Pillar 4: Curators & Art Advisories (3 cols)
          {
            orderIndex: 4,
            gridSpan: 3,
            title: "Curators & Advisories Pillar",
            content: {
              _style: {
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderColor: "rgba(212, 175, 55, 0.3)",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: "rounded-2xl",
                boxShadow: "soft",
              },
              ...tiptapDoc(
                tiptapEyebrow("📜 CURATORS & ADVISORIES"),
                tiptapHeading("Museum-Standard Digital Monograms", 3),
                tiptapParagraph(
                  "Archival e-catalogs ready for digital flipbooks and high-res printing, plus verified email security to protect private acquisitions."
                )
              ),
            },
          },
        ],
      },

      // ======================================================================
      // Act 3 - Feature A: Museum Placards & e-Catalogs (Split 6/6)
      // Zero double header
      // ======================================================================
      {
        orderIndex: 3,
        slug: "features",
        title: null,
        subtitle: null,
        description: null,
        titleAlignment: "left",
        gridSpan: 12,
        backgroundColor: "rgba(13, 14, 18, 0.4)",
        backgroundType: "COLOR",
        subSections: [
          // Left Column (6 cols): Text + CTA
          {
            orderIndex: 1,
            gridSpan: 6,
            title: "Placard Publishing Narrative",
            content: {
              blocks: [
                {
                  id: "feat-a-text",
                  type: "TEXT",
                  content: tiptapDoc(
                    tiptapEyebrow("PUBLISHING & PRINT"),
                    tiptapHeading("Museum-Ready Wall Placards & Print Catalogs in One Click", 2),
                    tiptapParagraph(
                      "Generate 300 DPI high-resolution printable cards with artwork dimensions, pricing, and provenance QR codes formatted specifically for physical gallery display stands."
                    ),
                    tiptapParagraph(
                      "Export publication-grade digital monographs with full-bleed layouts, high-res plates, and curatorial essays—zero desktop publishing software required."
                    )
                  ),
                },
                {
                  id: "feat-a-btn",
                  type: "BUTTON",
                  buttonText: "Explore Digital Catalogs",
                  buttonUrl: "/catalogs",
                  buttonVariant: "gold",
                },
              ],
            },
          },
          // Right Column (6 cols): Visual Mockup Card
          {
            orderIndex: 2,
            gridSpan: 6,
            title: "Placard Visual Card",
            content: {
              _style: {
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderColor: "rgba(212, 175, 55, 0.25)",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: "rounded-2xl",
                boxShadow: "soft",
              },
              blocks: [
                {
                  id: "feat-a-img",
                  type: "IMAGE",
                  mediaUrl:
                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
                  mediaAlt: "Exhibition Monograph Placard",
                  mediaAspectRatio: "16:9",
                  mediaBorderRadius: "rounded-lg",
                  hasBorder: true,
                  borderWidth: 1,
                },
                {
                  id: "feat-a-caption",
                  type: "TEXT",
                  content: tiptapDoc(
                    tiptapParagraph(
                      "Visiting-card (3.5 × 2 in) and museum-wall (4 × 2.5 in) formats with 18mm clamp safety margins and instant QR provenance verification.",
                      [{ type: "textStyle", attrs: { color: "#94a3b8", fontSize: "13px" } }]
                    )
                  ),
                },
              ],
            },
          },
        ],
      },

      // ======================================================================
      // Act 3 - Feature B: Virtual 3D Spatial Walkthroughs (Alternating Split 6/6)
      // Visual on Left, Text on Right
      // ======================================================================
      {
        orderIndex: 4,
        slug: "spatial-3d",
        title: null,
        subtitle: null,
        description: null,
        titleAlignment: "left",
        gridSpan: 12,
        backgroundColor: "rgba(10, 11, 15, 0.6)",
        backgroundType: "COLOR",
        subSections: [
          // Left Column (6 cols): Visual Salon Teaser Card
          {
            orderIndex: 1,
            gridSpan: 6,
            title: "3D Salon Visual Card",
            content: {
              _style: {
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderColor: "rgba(212, 175, 55, 0.25)",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: "rounded-2xl",
                boxShadow: "gold-glow",
              },
              blocks: [
                {
                  id: "feat-b-img",
                  type: "IMAGE",
                  mediaUrl:
                    "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=800",
                  mediaAlt: "3D Virtual Gallery Corridor",
                  mediaAspectRatio: "16:9",
                  mediaBorderRadius: "rounded-lg",
                  hasBorder: true,
                  borderWidth: 1,
                },
                {
                  id: "feat-b-caption",
                  type: "TEXT",
                  content: tiptapDoc(
                    tiptapParagraph(
                      "7 procedural gallery environments including imperial palaces, minimalist white cubes, and heritage villas.",
                      [{ type: "textStyle", attrs: { color: "#94a3b8", fontSize: "13px" } }]
                    )
                  ),
                },
              ],
            },
          },
          // Right Column (6 cols): Text + CTA
          {
            orderIndex: 2,
            gridSpan: 6,
            title: "3D Salon Narrative",
            content: {
              blocks: [
                {
                  id: "feat-b-text",
                  type: "TEXT",
                  content: tiptapDoc(
                    tiptapEyebrow("SPATIAL EXHIBITIONS"),
                    tiptapHeading("Virtual 3D Walkthroughs with True Architectural Lighting", 2),
                    tiptapParagraph(
                      "Transport global collectors into 7 architectural salon environments—from minimalist white-cube galleries to heritage palaces—with genuine museum eye-level hanging and cinematic camera tours."
                    ),
                    tiptapParagraph(
                      "Preserves the true aspect ratio of every canvas without squishing or cropping. Smooth interactive walkthroughs that work instantly on mobile and desktop without app downloads."
                    )
                  ),
                },
                {
                  id: "feat-b-btn",
                  type: "BUTTON",
                  buttonText: "Tour Virtual Salon",
                  buttonUrl: "/exhibition-simulator",
                  buttonVariant: "gold",
                },
              ],
            },
          },
        ],
      },

      // ======================================================================
      // Act 3 - Feature C: Event RSVPs & Visitor Tracking (Split 6/6)
      // Text on Left, Visual on Right
      // ======================================================================
      {
        orderIndex: 5,
        slug: "visitor-rsvps",
        title: null,
        subtitle: null,
        description: null,
        titleAlignment: "left",
        gridSpan: 12,
        backgroundColor: "rgba(13, 14, 18, 0.4)",
        backgroundType: "COLOR",
        subSections: [
          // Left Column (6 cols): Text + CTA
          {
            orderIndex: 1,
            gridSpan: 6,
            title: "RSVP & CRM Narrative",
            content: {
              blocks: [
                {
                  id: "feat-c-text",
                  type: "TEXT",
                  content: tiptapDoc(
                    tiptapEyebrow("VISITOR OPERATIONS & CRM"),
                    tiptapHeading("Effortless Event RSVPs & Live Visitor Tracking", 2),
                    tiptapParagraph(
                      "Manage guest capacities, eliminate paper sign-in sheets, and let visitors scan wall QR codes with their phone to explore artwork stories and register their interest."
                    ),
                    tiptapParagraph(
                      "Configurable 15, 30, and 60-minute arrival windows keep foot traffic organized. Inbound patron details sync directly into your private CRM with zero-leak email verification."
                    )
                  ),
                },
                {
                  id: "feat-c-btn",
                  type: "BUTTON",
                  buttonText: "View Scheduled Exhibitions",
                  buttonUrl: "/events",
                  buttonVariant: "gold",
                },
              ],
            },
          },
          // Right Column (6 cols): Visual Mockup Card
          {
            orderIndex: 2,
            gridSpan: 6,
            title: "RSVP Visual Card",
            content: {
              _style: {
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderColor: "rgba(212, 175, 55, 0.25)",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: "rounded-2xl",
                boxShadow: "soft",
              },
              blocks: [
                {
                  id: "feat-c-img",
                  type: "IMAGE",
                  mediaUrl:
                    "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&q=80&w=800",
                  mediaAlt: "Gallery Exhibition Reception",
                  mediaAspectRatio: "16:9",
                  mediaBorderRadius: "rounded-lg",
                  hasBorder: true,
                  borderWidth: 1,
                },
                {
                  id: "feat-c-caption",
                  type: "TEXT",
                  content: tiptapDoc(
                    tiptapParagraph(
                      "Automated RSVP receipts, attendance lists, and floor QR scan acquisition with phone & WhatsApp collection.",
                      [{ type: "textStyle", attrs: { color: "#94a3b8", fontSize: "13px" } }]
                    )
                  ),
                },
              ],
            },
          },
        ],
      },

      // ======================================================================
      // Act 4: Complete Platform Capabilities (Clean 2-Column Matrix)
      // Replaces 8 identical dark boxes with 2 unified editorial columns
      // ======================================================================
      {
        orderIndex: 6,
        slug: "capabilities",
        title: "Complete Platform Capabilities at Your Command",
        subtitle: "ENTERPRISE ARCHITECTURE",
        description:
          "Designed for total curatorial sovereignty, high performance, and effortless administration.",
        titleAlignment: "center",
        gridSpan: 12,
        backgroundColor: "rgba(10, 11, 15, 0.6)",
        backgroundType: "COLOR",
        subSections: [
          // Left Column (6 cols): Curatorial Freedom
          {
            orderIndex: 1,
            gridSpan: 6,
            title: "Curatorial Freedom Capabilities",
            content: {
              _style: {
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderColor: "rgba(212, 175, 55, 0.3)",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: "rounded-2xl",
                boxShadow: "soft",
              },
              ...tiptapDoc(
                tiptapEyebrow("CURATORIAL FREEDOM"),
                tiptapHeading("Total Freedom to Customize Every Detail", 3),
                tiptapBulletList([
                  "Visual Page Builder: Drag-and-drop layout studio with responsive 12-column grids and live Tiptap editing.",
                  "Multi-Tier Art Categories: Unbounded relational taxonomies across eras, mediums, schools, and cultural disciplines.",
                  "Flexible Navigation Architecture: Multi-zone headers, mobile slide-out drawers, and nested dropdown links.",
                  "Bulk Spreadsheet Operations: Fast onboarding and collection updates via Excel import and export.",
                ])
              ),
            },
          },
          // Right Column (6 cols): Enterprise Performance & Privacy
          {
            orderIndex: 2,
            gridSpan: 6,
            title: "Performance & Privacy Capabilities",
            content: {
              _style: {
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                borderColor: "rgba(212, 175, 55, 0.3)",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: "rounded-2xl",
                boxShadow: "soft",
              },
              ...tiptapDoc(
                tiptapEyebrow("ENTERPRISE INFRASTRUCTURE"),
                tiptapHeading("Enterprise Performance & Sovereign Privacy", 3),
                tiptapBulletList([
                  "Sovereign Storage: Keep originals on your private server, Google Drive, Nextcloud, AWS S3, or Cloudflare R2.",
                  "Search & AI Discoverability: Automatic Schema.org JSON-LD structured data for Answer Engine Optimization (AEO).",
                  "Bot Defense & Zero-Spam Inquiries: Stateless arithmetic CAPTCHA and verified email passcodes eliminate spam.",
                  "Binary Light & Dark Themes: Impeccable contrast with classical typography and accessible WCAG 2.2 AAA tokens.",
                ])
              ),
            },
          },
        ],
      },

      // ======================================================================
      // Act 5: Dedicated Platform Inquiry Form (Direct Intake to info@savazar.com)
      // ======================================================================
      {
        orderIndex: 7,
        slug: "inquiry",
        title: "Ready to Launch Your Platform?",
        subtitle: "DIRECT PLATFORM INQUIRY",
        description:
          "Connect with the SavazAI team for a personalized demo, custom onboarding, or academic institutional licensing.",
        titleAlignment: "center",
        gridSpan: 12,
        backgroundColor: "rgba(13, 14, 18, 0.5)",
        backgroundType: "COLOR",
        subSections: [
          {
            orderIndex: 1,
            gridSpan: 12,
            title: "Platform Inquiry Form Card",
            content: {
              _style: {
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderColor: "rgba(212, 175, 55, 0.4)",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: "rounded-2xl",
                boxShadow: "gold-glow",
                ornamentalFrame: true,
              },
              blocks: [
                {
                  id: "platform-inquiry-form-block",
                  type: "FORM_BLOCK",
                  formTitle: "Get Started with SavazAI Platform",
                  formSubtitle:
                    "Tell us about your atelier, gallery, or institution. Our platform engineering team will schedule your personalized demo.",
                  submitButtonText: "Connect with Our Team",
                  successMessage:
                    "Thank you for contacting SavazAI. Our platform team has received your inquiry and will reach out shortly.",
                  notifyEmail: true,
                  recipientEmails: "info@savazar.com",
                  emailSubjectTemplate: "SavazAI Platform Inquiry from {name}",
                  pageSlug: "product",
                  fields: [
                    {
                      id: "name",
                      label: "Full Name",
                      type: "text",
                      required: true,
                      placeholder: "e.g. Elena Rostova",
                    },
                    {
                      id: "email",
                      label: "Email Address",
                      type: "email",
                      required: true,
                      placeholder: "elena@atelier.org",
                    },
                    {
                      id: "role",
                      label: "Your Role / Creative Focus",
                      type: "select",
                      required: true,
                      options: [
                        "Independent Master Artist",
                        "Gallery Curator / Director",
                        "Biennale / Event Organizer",
                        "Fine Art Academic / Student",
                        "Collector / Advisory",
                        "Other Creative Discipline",
                      ],
                    },
                    {
                      id: "portfolio_url",
                      label: "Website / Portfolio URL",
                      type: "text",
                      required: false,
                      placeholder: "https://yourportfolio.com",
                    },
                    {
                      id: "message",
                      label: "Message / Requirements",
                      type: "textarea",
                      required: true,
                      placeholder:
                        "Tell us about your upcoming exhibitions, collection size, or custom platform needs...",
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    ];

    for (const sec of sectionsData) {
      const createdSec = await prisma.pageSection.create({
        data: {
          pageId,
          orderIndex: sec.orderIndex,
          slug: sec.slug,
          title: sec.title,
          subtitle: sec.subtitle,
          description: sec.description,
          titleAlignment: sec.titleAlignment,
          gridSpan: sec.gridSpan,
          backgroundColor: sec.backgroundColor,
          backgroundType: sec.backgroundType,
          customCssClass: "py-16",
        },
      });

      for (const sub of sec.subSections) {
        await prisma.subSection.create({
          data: {
            sectionId: createdSec.id,
            orderIndex: sub.orderIndex,
            gridSpan: sub.gridSpan,
            title: sub.title,
            content: sub.content as Prisma.InputJsonValue,
          },
        });
      }
    }

    console.log("✅ Successfully seeded all 7 redesigned editorial sections for /product.");
  }
}
