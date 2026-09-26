import { PrismaClient, Role, MenuPosition } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting SavazAI WebApps Platform database seed...");

  // 1. Provision Superadmin User
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@savazar.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "AdminPassword2026!";
  const adminName = process.env.ADMIN_NAME || "SavazAI Platform Admin";

  let superadmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!superadmin) {
    const hashedPassword = await hashPassword(adminPassword);
    superadmin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        role: Role.SUPER_ADMIN,
        emailVerified: true,
      },
    });

    await prisma.account.create({
      data: {
        userId: superadmin.id,
        accountId: superadmin.id,
        providerId: "credential",
        issuer: "local:credential",
        password: hashedPassword,
      },
    });
    console.log(`✅ Provisioned new Superadmin account: ${adminEmail}`);
  } else {
    // If account record is missing or password was supplied via env, synchronize it
    const existingAccount = await prisma.account.findFirst({
      where: { userId: superadmin.id, providerId: "credential" },
    });
    const hashedPassword = await hashPassword(adminPassword);
    if (!existingAccount) {
      await prisma.account.create({
        data: {
          userId: superadmin.id,
          accountId: superadmin.id,
          providerId: "credential",
          issuer: "local:credential",
          password: hashedPassword,
        },
      });
      console.log(`✅ Linked credential account for existing Superadmin: ${adminEmail}`);
    } else {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { password: hashedPassword },
      });
      console.log(`🔑 Synchronized Superadmin credentials for: ${adminEmail}`);
    }
  }
  console.log(`🔑 Superadmin Status -> Email: ${adminEmail}`);

  // 2. Provision Default SystemSetting
  const existingSettings = await prisma.systemSetting.findFirst();
  if (!existingSettings) {
    await prisma.systemSetting.create({
      data: {
        siteName: "SavazAI WebApps — Digital Atelier & Cultural Archive",
        archiveSubtitle: "Digital Exhibition & Cultural Suite",
        siteDescription:
          "Enterprise multi-tenant digital atelier, spatial exhibition corridor, and museum publishing system.",
        adminAlertEmail: adminEmail,
        contactEmail: "contact@savazar.com",
        contactPhone: null,
        watermarkText: process.env.WATERMARK_TEXT || "© SavazAI WebApps | All Rights Reserved",
        watermarkOpacity: parseFloat(process.env.WATERMARK_OPACITY || "0.35"),
        watermarkFontSize: 28,
        storageProvider: "LOCAL",
        r2AccountId: process.env.R2_ACCOUNT_ID || null,
        r2BucketName: process.env.R2_BUCKET_NAME || null,
        r2PublicUrl: process.env.R2_PUBLIC_URL || null,
        s3Region: process.env.S3_REGION || "ap-south-1",
        s3BucketName: process.env.S3_BUCKET_NAME || null,
        s3AccessKey: process.env.S3_ACCESS_KEY || null,
        s3SecretKey: process.env.S3_SECRET_KEY || null,
        instagramUrl: "https://instagram.com/savazai",
        youtubeUrl: "https://youtube.com/@savazai",
        footerConfig: {
          aboutText:
            "Enterprise digital publishing, cultural archiving, and spatial 3D exhibition suite for fine art masters, traditional heritage artists, and museum collections.",
          contactEmail: "contact@savazar.com",
          contactPhone: "",
          copyrightText: "© 2026 SavazAI WebApps Platform. All rights reserved.",
          socialLinks: [
            { platform: "Instagram", url: "https://instagram.com/savazai", isVisible: true },
            { platform: "YouTube", url: "https://youtube.com/@savazai", isVisible: true },
          ],
          legalLinks: [
            { label: "Privacy Policy", url: "/privacy", isVisible: true },
            { label: "Terms & Conditions", url: "/terms", isVisible: true },
            { label: "Art Licensing & Reproduction", url: "/licensing", isVisible: true },
            { label: "Admin Portal", url: "/admin", isVisible: true },
          ],
        },
        emailConfig: {
          provider: "gmail",
          smtpHost: "smtp.gmail.com",
          smtpPort: 587,
          smtpUser: "",
          smtpPassword: "",
          fromEmail: "contact@savazar.com",
          fromName: "SavazAI WebApps Platform",
          isEnabled: false,
        },
        aiConfig: {
          activeProvider: "gemini",
          apiKey: "",
          baseUrl: "",
          defaultModel: "gemini-1.5-pro",
          temperature: 0.7,
        },
      },
    });
    console.log("✅ Provisioned SystemSettings with watermark, storage, footer, and AI configs");
  } else {
    console.log("🛡️ Existing SystemSetting detected. Skipping configuration overwrite to protect client data.");
  }

  // 3. Provision Default Art Categories
  const categories = [
    {
      name: "Tanjore Paintings",
      slug: "tanjore-paintings",
      description:
        "Classical South Indian Thanjavur sacred art featuring 22-carat gold foil embossing, Jaipur gemstones, and rich teakwood framing.",
      displayOrder: 1,
    },
    {
      name: "Mysore Traditional",
      slug: "mysore-traditional",
      description:
        "Elegantly rendered Mysore school paintings utilizing muted vegetable dyes, subtle gesso work, and fine brush linework.",
      displayOrder: 2,
    },
    {
      name: "Pahari Miniatures",
      slug: "pahari-miniatures",
      description:
        "Lyrical devotional miniature reproductions inspired by the Kangra and Basohli hills traditions.",
      displayOrder: 3,
    },
    {
      name: "Pichwai Sacred Art",
      slug: "pichwai-sacred-art",
      description:
        "Devotional cloth paintings originating from Nathdwara, Rajasthan, illustrating Shrinathji and pastoral motifs.",
      displayOrder: 4,
    },
    {
      name: "Kalamkari Murals",
      slug: "kalamkari-murals",
      description:
        "Hand-painted natural dye depictions from Sri Kalahasti depicting epic narratives from the Ramayana and Mahabharata.",
      displayOrder: 5,
    },
    {
      name: "Cheriyal Scrolls",
      slug: "cheriyal-scrolls",
      description:
        "Telangana traditional narrative scroll painting on khadi treated with tamarind seed paste and natural mineral pigments.",
      displayOrder: 6,
    },
    {
      name: "Miscellaneous & Sketches",
      slug: "miscellaneous-sketches",
      description:
        "Preparatory charcoal sketches, iconometric studies (Talamana), and experimental devotional iconography.",
      displayOrder: 7,
    },
  ];

  for (const cat of categories) {
    const existing = await prisma.artCategory.findUnique({
      where: { slug: cat.slug },
    });

    if (existing) {
      if (existing.isDeleted) {
        console.log(`🛡️ Preserved soft-deleted state for category: ${cat.slug} (never resurrecting)`);
      } else {
        console.log(`🛡️ Preserved user modifications for category: ${cat.slug}`);
      }
      continue;
    }

    await prisma.artCategory.create({
      data: {
        ...cat,
        sortOrder: cat.displayOrder,
        isActive: true,
        isDeleted: false,
        showOnHomepage: false,
      },
    });
    console.log(`✅ Provisioned default category: ${cat.slug}`);
  }

  // 4. Provision Default Navigation Menu Items (Hierarchical)
  const menuCount = await prisma.menuItem.count();
  if (menuCount === 0) {
    await prisma.menuItem.create({
      data: {
        label: "Home",
        path: "/",
        position: MenuPosition.TOP_CENTER,
        orderIndex: 1,
      },
    });

    const gallery = await prisma.menuItem.create({
      data: {
        label: "Gallery",
        path: "/gallery",
        position: MenuPosition.TOP_CENTER,
        orderIndex: 2,
      },
    });

    // Sub-menu tier 1 under Gallery
    await prisma.menuItem.create({
      data: {
        label: "Tanjore Gold Leaf",
        path: "/gallery/tanjore-paintings",
        position: MenuPosition.TOP_CENTER,
        orderIndex: 1,
        parentId: gallery.id,
      },
    });

    await prisma.menuItem.create({
      data: {
        label: "Mysore Classical",
        path: "/gallery/mysore-traditional",
        position: MenuPosition.TOP_CENTER,
        orderIndex: 2,
        parentId: gallery.id,
      },
    });

    await prisma.menuItem.create({
      data: {
        label: "Temple Murals",
        path: "/gallery/kalamkari-murals",
        position: MenuPosition.TOP_CENTER,
        orderIndex: 3,
        parentId: gallery.id,
      },
    });

    await prisma.menuItem.create({
      data: {
        label: "Carnatic Recitals",
        path: "/music",
        position: MenuPosition.TOP_CENTER,
        orderIndex: 3,
      },
    });

    await prisma.menuItem.create({
      data: {
        label: "Exhibitions & Concerts",
        path: "/events",
        position: MenuPosition.TOP_CENTER,
        orderIndex: 4,
      },
    });

    await prisma.menuItem.create({
      data: {
        label: "Sacred Chronicle",
        path: "/blogs",
        position: MenuPosition.TOP_CENTER,
        orderIndex: 5,
      },
    });

    await prisma.menuItem.create({
      data: {
        label: "Commissions & Contact",
        path: "/commission",
        position: MenuPosition.TOP_RIGHT,
        orderIndex: 6,
      },
    });

    console.log("✅ Provisioned Hierarchical Navigation Menu Tree");
  }

  // 5. Provision Default Published "Home" Page
  const homePage = await prisma.page.findUnique({
    where: { slug: "home" },
    include: { sections: true },
  });

  if (!homePage) {
    const createdPage = await prisma.page.create({
      data: {
        title: "Sacred Art & Classical Carnatic Music",
        slug: "home",
        metaDescription:
          "Enterprise digital archive and exhibition corridor presenting traditional fine art with 22k gold leaf, classical heritage paintings, and curated cultural recitals.",
        isPublished: true,
        publishedAt: new Date(),
        sections: {
          create: [
            {
              title: "Hero Section",
              orderIndex: 1,
              gridSpan: 12,
              subSections: {
                create: [
                  {
                    title: "Sanctum Welcome",
                    orderIndex: 1,
                    gridSpan: 12,
                    content: {
                      type: "doc",
                      content: [
                        {
                          type: "heading",
                          attrs: { level: 1, textAlign: "center" },
                          content: [
                            {
                              type: "text",
                              text: "Preserving Sacred Heritage Through Gold Leaf & Ragas",
                              marks: [{ type: "bold" }],
                            },
                          ],
                        },
                        {
                          type: "paragraph",
                          attrs: { textAlign: "center" },
                          content: [
                            {
                              type: "text",
                              text: "A digital sanctum honoring traditional Indian Tanjore paintings with 22k gold foil, Mysore classical styles, and sacred Carnatic vocal archives—linked via multi-modal vector embeddings and relational knowledge graphs.",
                            },
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              title: "Highlights Section",
              orderIndex: 2,
              gridSpan: 12,
              subSections: {
                create: [
                  {
                    title: "Tanjore & Mysore Art",
                    orderIndex: 1,
                    gridSpan: 4,
                    content: {
                      type: "doc",
                      content: [
                        {
                          type: "heading",
                          attrs: { level: 3 },
                          content: [{ type: "text", text: "Tanjore & Mysore Art", marks: [{ type: "bold" }] }],
                        },
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "High-resolution protected catalog of traditional 22k gold foil embossments, Jaipur gemstones, and teakwood framing.",
                            },
                          ],
                        },
                      ],
                    },
                  },
                  {
                    title: "Carnatic Recitals",
                    orderIndex: 2,
                    gridSpan: 4,
                    content: {
                      type: "doc",
                      content: [
                        {
                          type: "heading",
                          attrs: { level: 3 },
                          content: [{ type: "text", text: "Carnatic Recitals", marks: [{ type: "bold" }] }],
                        },
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "Synesthetic audio player pairing traditional visual motifs with devotional melodic ragas across classical talas.",
                            },
                          ],
                        },
                      ],
                    },
                  },
                  {
                    title: "Sacred Chronicle",
                    orderIndex: 3,
                    gridSpan: 4,
                    content: {
                      type: "doc",
                      content: [
                        {
                          type: "heading",
                          attrs: { level: 3 },
                          content: [{ type: "text", text: "Sacred Chronicle", marks: [{ type: "bold" }] }],
                        },
                        {
                          type: "paragraph",
                          content: [
                            {
                              type: "text",
                              text: "Curated research articles on Tanjore gesso preparation, iconometric talamana, and Carnatic musical philosophy.",
                            },
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });
    console.log(`✅ Provisioned default published Home Page (${createdPage.slug})`);
  } else if (homePage.sections.length === 0) {
    console.log("📦 Backfilled default sections for: /home");
  } else {
    console.log(`🛡️ Preserved existing admin modifications for: /home (${homePage.sections.length} sections)`);
  }

  // 12. Provision Default Dashboard Widgets
  const defaultWidgets = [
    {
      title: "Artworks Catalog",
      description: "Traditional art categories and gold foil relief masterworks",
      widgetType: "STAT_CARD",
      targetUrl: "/admin/artworks",
      iconName: "Palette",
      order: 1,
    },
    {
      title: "Exhibitions & Events",
      description: "Workshops, gallery showcases & recital schedules",
      widgetType: "STAT_CARD",
      targetUrl: "/admin/events",
      iconName: "Calendar",
      order: 2,
    },
    {
      title: "Inbound Leads & QR CRM",
      description: "Gallery visitor inquiries & collector requests",
      widgetType: "STAT_CARD",
      targetUrl: "/admin/leads",
      iconName: "Users",
      order: 3,
    },
    {
      title: "Carnatic Ragas & Music",
      description: "Synesthetic cultural audio graph nodes & compositions",
      widgetType: "STAT_CARD",
      targetUrl: "/admin/music",
      iconName: "Music",
      order: 4,
    },
    {
      title: "Sacred Chronicles & Essays",
      description: "Curated research articles on Tanjore iconography & raga bhava",
      widgetType: "STAT_CARD",
      targetUrl: "/admin/posts",
      iconName: "BookOpen",
      order: 5,
    },
    {
      title: "System Health & Services",
      description: "Live configuration status of containerized services.",
      widgetType: "SYSTEM_STATUS",
      order: 6,
    },
    {
      title: "Quick Operations",
      description: "Direct administrative access to catalog management.",
      widgetType: "QUICK_LINK",
      targetUrl: "/admin/artworks",
      metricSub: "Add New Tanjore or Mysore Masterwork",
      iconName: "Sparkles",
      order: 7,
    },
  ];

  for (const w of defaultWidgets) {
    const existingWidget = await prisma.dashboardWidget.findFirst({
      where: { title: w.title },
    });
    if (!existingWidget) {
      await prisma.dashboardWidget.create({ data: w });
    }
  }
  console.log("✅ Provisioned default administrative dashboard widgets");

  // 13. Provision Core System Pages (Editable Headers & Meta & Page Sections)
  const systemPages = [
    {
      title: "Sacred Art & Cultural Chronicle",
      slug: "blogs",
      metaTitle: "Sacred Art & Cultural Chronicle — SavazAI WebApps",
      metaDescription:
        "Explore authoritative writings on fine art painting techniques, classical iconography, and multi-modal artistic traditions.",
      isPublished: true,
      sectionTitle: "Curatorial Insights Hero",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "✨ CURATORIAL CHRONICLE & INSIGHTS",
                marks: [
                  { type: "bold" },
                  { type: "textStyle", attrs: { color: "#D4AF37" } },
                ],
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 1, textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Sacred Art & Cultural Chronicle",
                marks: [{ type: "bold" }],
              },
            ],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Scholarly perspectives on classical South Indian visual arts, sacred iconography, 22-carat gold relief traditions, and Carnatic musical synesthesia.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Traditional Art Gallery",
      slug: "gallery",
      metaTitle: "Fine Art Gallery & Cultural Archive — SavazAI WebApps",
      metaDescription:
        "Five centuries of classical sacred painting traditions preserved through authentic 22-carat gold foil relief work, purified gesso, and semi-precious Jaipur gemstones.",
      isPublished: true,
      sectionTitle: "Gallery Vault Hero",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "✨ SACRED MASTERWORK VAULT",
                marks: [
                  { type: "bold" },
                  { type: "textStyle", attrs: { color: "#D4AF37" } },
                ],
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 1, textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Traditional Art Gallery",
                marks: [{ type: "bold" }],
              },
            ],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Five centuries of classical sacred painting traditions preserved through authentic 22-carat gold foil relief work, purified gesso, and semi-precious Jaipur gemstones.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Exhibitions & Events",
      slug: "events",
      metaTitle: "Exhibitions, Concerts & Workshops — SavazAI WebApps",
      metaDescription:
        "Experience the divine resonance of Carnatic ragas and witness museum-grade Thanjavur gold leaf masterworks in person.",
      eyebrowTag: "Cultural Calendar & Recitals",
      heroTitle: "Exhibitions & Events",
      heroSubtitle:
        "Experience the divine resonance of Carnatic ragas and witness museum-grade Thanjavur gold leaf masterworks in person.",
      config: {
        upcomingBadge: "Live Schedules",
        upcomingTitle: "Upcoming Exhibitions & Events",
        upcomingSubtitle:
          "Forthcoming gallery exhibitions, classical vocal concerts, and traditional iconography masterclasses.",
        upcomingEmptyTitle: "No Upcoming Public Events",
        upcomingEmptySubtitle:
          "New exhibition dates, gallery recitals, and masterclasses are published periodically. Please explore our past retrospectives below.",
        pastBadge: "Archive & Retrospectives",
        pastTitle: "Past Exhibitions & Retrospectives",
        pastSubtitle:
          "Archived exhibitions, previous concert recitals, and documented artistic milestones.",
        pastEmptyTitle: "No Past Retrospectives Recorded",
        pastEmptySubtitle:
          "Historical exhibitions and previous concert recitals will appear here once archived.",
      },
      isPublished: true,
      sectionTitle: "Cultural Calendar Hero",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "✨ CULTURAL CALENDAR & RECITALS",
                marks: [
                  { type: "bold" },
                  { type: "textStyle", attrs: { color: "#D4AF37" } },
                ],
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 1, textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Exhibitions & Events",
                marks: [{ type: "bold" }],
              },
            ],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Experience the divine resonance of Carnatic ragas and witness museum-grade Thanjavur gold leaf masterworks in person.",
              },
            ],
          },
        ],
      },
    },
    {
      title: "Traditional Art Disciplines",
      slug: "categories",
      metaTitle: "Sacred Art Disciplines — SavazAI WebApps",
      metaDescription:
        "Explore classical South Indian artistic disciplines spanning Thanjavur 22k gold foil embossments, Mysore traditional paintings, temple murals, and Carnatic music traditions.",
      isPublished: true,
      sectionTitle: "Disciplines Lineage Hero",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "✨ HERITAGE LINEAGE & SCHOOLS",
                marks: [
                  { type: "bold" },
                  { type: "textStyle", attrs: { color: "#D4AF37" } },
                ],
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 1, textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Traditional Art Disciplines",
                marks: [{ type: "bold" }],
              },
            ],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Explore classical South Indian artistic disciplines spanning Thanjavur 22k gold foil embossments, Mysore traditional paintings, temple murals, and Carnatic music traditions.",
              },
            ],
          },
        ],
      },
    },
  ];

  for (const sp of systemPages as Array<{
    title: string;
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
    eyebrowTag?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    config?: Record<string, unknown>;
    isPublished: boolean;
    sectionTitle?: string;
    content: Record<string, unknown>;
  }>) {
    const existingPage = await prisma.page.findUnique({
      where: { slug: sp.slug },
      include: { sections: true },
    });

    if (!existingPage) {
      await prisma.page.create({
        data: {
          title: sp.title,
          slug: sp.slug,
          metaDescription: sp.metaDescription,
          isPublished: sp.isPublished,
          isActive: true,
          isDeleted: false,
          showOnHomepage: false,
          sortOrder: 0,
          eyebrowTag: sp.eyebrowTag || null,
          heroTitle: sp.heroTitle || null,
          heroSubtitle: sp.heroSubtitle || null,
          config: sp.config ? (sp.config as unknown as object) : undefined,
          sections: {
            create: [
              {
                title: sp.sectionTitle || "Hero Banner",
                orderIndex: 1,
                gridSpan: 12,
                subSections: {
                  create: [
                    {
                      title: "Header Content",
                      orderIndex: 1,
                      gridSpan: 12,
                      content: sp.content as unknown as object,
                    },
                  ],
                },
              },
            ],
          },
        },
      });
      console.log(`✅ Provisioned editable system page with full sections: /${sp.slug}`);
    } else if (existingPage.isDeleted) {
      console.log(`🛡️ Preserved soft-deleted state for: /${sp.slug} (never resurrecting)`);
      continue;
    } else {
      // PRESERVE: Admin has customized this page; do not modify existing content!
      // Only backfill missing fields if null
      const pageUpdates: Record<string, unknown> = {};
      if (!existingPage.eyebrowTag && sp.eyebrowTag) pageUpdates.eyebrowTag = sp.eyebrowTag;
      if (!existingPage.heroTitle && sp.heroTitle) pageUpdates.heroTitle = sp.heroTitle;
      if (!existingPage.heroSubtitle && sp.heroSubtitle) pageUpdates.heroSubtitle = sp.heroSubtitle;
      if (!existingPage.config && sp.config) pageUpdates.config = sp.config as unknown as object;

      if (Object.keys(pageUpdates).length > 0) {
        await prisma.page.update({
          where: { id: existingPage.id },
          data: pageUpdates,
        });
        console.log(`🔧 Backfilled missing metadata config for: /${sp.slug}`);
      }

      if (existingPage.sections.length === 0) {
        await prisma.pageSection.create({
          data: {
            pageId: existingPage.id,
            title: sp.sectionTitle || "Hero Banner",
            orderIndex: 1,
            gridSpan: 12,
            subSections: {
              create: [
                {
                  title: "Header Content",
                  orderIndex: 1,
                  gridSpan: 12,
                  content: sp.content as unknown as object,
                },
              ],
            },
          },
        });
        console.log(`✅ Backfilled default hero section for: /${sp.slug}`);
      }
    }
  }

  // 14. Provision Default Multi-Tenant Email Templates
  const defaultEmailTemplates = [
    {
      triggerType: "contact",
      name: "Contact Form",
      adminSubject: "New Inbound Inquiry: {subject} [{name}]",
      adminBodyTemplate: `<p>A new visitor inquiry has been submitted through the website.</p>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
  <tr><td style="padding: 6px 0; color: #6b7280; width: 120px;"><strong>Name:</strong></td><td style="padding: 6px 0; color: #111827;">{name}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Email:</strong></td><td style="padding: 6px 0; color: #111827;"><a href="mailto:{email}" style="color: #b45309;">{email}</a></td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Phone:</strong></td><td style="padding: 6px 0; color: #111827;">{phone}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Subject:</strong></td><td style="padding: 6px 0; color: #111827;">{subject}</td></tr>
</table>
<div style="background: #f9fafb; border-left: 3px solid #d4af37; padding: 14px; border-radius: 4px; margin: 16px 0; color: #1f2937;">
  <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #854d0e; font-weight: bold;">Message</p>
  <p style="margin: 0; white-space: pre-wrap;">{message}</p>
</div>
{form_data}`,
      sendUserReceipt: true,
      userSubject: "Thank you for contacting {organization_name}",
      userBodyTemplate: `<p>Dear {name},</p>
<p>Thank you for reaching out to us. We have received your inquiry regarding <strong>{subject}</strong>.</p>
<p>Our team will review your message and respond as soon as possible.</p>
<p style="margin-top: 24px;">Best regards,<br/><strong>{organization_name}</strong></p>`,
    },
    {
      triggerType: "event_rsvp",
      name: "Event & Recital RSVPs",
      adminSubject: "🎟️ New RSVP: {event_title} [{name}]",
      adminBodyTemplate: `<p>A guest has confirmed attendance for an upcoming event.</p>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
  <tr><td style="padding: 6px 0; color: #6b7280; width: 140px;"><strong>Attendee:</strong></td><td style="padding: 6px 0; color: #111827;">{name}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Email:</strong></td><td style="padding: 6px 0; color: #111827;"><a href="mailto:{email}" style="color: #b45309;">{email}</a></td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Phone:</strong></td><td style="padding: 6px 0; color: #111827;">{phone}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Event:</strong></td><td style="padding: 6px 0; color: #111827; font-weight: bold;">{event_title}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Date &amp; Venue:</strong></td><td style="padding: 6px 0; color: #111827;">{event_date}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Guests:</strong></td><td style="padding: 6px 0; color: #111827;">{guest_count}</td></tr>
</table>
{form_data}`,
      sendUserReceipt: true,
      userSubject: "Attendance Confirmed: {event_title}",
      userBodyTemplate: `<p>Dear {name},</p>
<p>Your attendance reservation for <strong>{event_title}</strong> on {event_date} has been confirmed.</p>
<p>We look forward to welcoming you.</p>
<p>Please present this confirmation email upon arrival.</p>
<p style="margin-top: 24px;">Best regards,<br/><strong>{organization_name}</strong></p>`,
    },
    {
      triggerType: "custom_form",
      name: "Custom Form Submissions",
      adminSubject: "📋 Form Submission: {form_name} [{name}]",
      adminBodyTemplate: `<p>A new submission has been received from form: <strong>{form_name}</strong>.</p>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
  <tr><td style="padding: 6px 0; color: #6b7280; width: 140px;"><strong>Respondent:</strong></td><td style="padding: 6px 0; color: #111827;">{name}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Email:</strong></td><td style="padding: 6px 0; color: #111827;"><a href="mailto:{email}" style="color: #b45309;">{email}</a></td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Phone:</strong></td><td style="padding: 6px 0; color: #111827;">{phone}</td></tr>
  <tr><td style="padding: 6px 0; color: #6b7280;"><strong>Form Title:</strong></td><td style="padding: 6px 0; color: #111827;">{form_name}</td></tr>
</table>
<div style="background: #f9fafb; border-left: 3px solid #d4af37; padding: 14px; border-radius: 4px; margin: 16px 0; color: #1f2937;">
  <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #854d0e; font-weight: bold;">Submitted Message</p>
  <p style="margin: 0; white-space: pre-wrap;">{message}</p>
</div>
{form_data}`,
      sendUserReceipt: true,
      userSubject: "Confirmation: Your submission to {form_name}",
      userBodyTemplate: `<p>Dear {name},</p>
<p>Thank you for submitting your details via <strong>{form_name}</strong>. Your correspondence has been received.</p>
<p style="margin-top: 24px;">Best regards,<br/><strong>{organization_name}</strong></p>`,
    },
  ];

  for (const t of defaultEmailTemplates) {
    const existing = await prisma.emailTemplateConfig.findUnique({
      where: { triggerType: t.triggerType },
    });
    if (!existing) {
      await prisma.emailTemplateConfig.create({ data: t });
      console.log(`✅ Provisioned default email template: ${t.triggerType}`);
    }
  }

  console.log("🌿 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
