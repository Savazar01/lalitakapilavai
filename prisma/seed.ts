import { PrismaClient, Role, MenuPosition } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Lalita Kapilavai database seed...");

  // 1. Provision Superadmin User
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@lalitakapilavai.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "AdminPassword2026!";
  const adminName = process.env.ADMIN_NAME || "Lalita Kapilavai Admin";

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
        siteName: "Lalita Kapilavai — Sacred Art & Carnatic Music Archive",
        siteDescription:
          "Living digital archive of traditional Indian Tanjore paintings with 22k gold leaf, Mysore classical fine art, and Carnatic classical vocal recitals.",
        adminAlertEmail: adminEmail,
        contactEmail: "contact@lalitakapilavai.com",
        contactPhone: "+91 98450 12345",
        watermarkText: process.env.WATERMARK_TEXT || "© Lalita Kapilavai - Sacred Art & Heritage",
        watermarkOpacity: parseFloat(process.env.WATERMARK_OPACITY || "0.35"),
        watermarkFontSize: 28,
        r2AccountId: process.env.S3_ENDPOINT || process.env.R2_ACCOUNT_ID || "cloudflare-r2-account-id",
        r2BucketName: process.env.S3_BUCKET_NAME || "lalitakapilavai-media",
        r2PublicUrl: process.env.S3_PUBLIC_DOMAIN || "https://media.lalitakapilavai.com",
        s3Region: process.env.S3_REGION || "ap-south-1",
        s3BucketName: process.env.S3_BUCKET_NAME || "lalitakapilavai-masters-backup",
        instagramUrl: "https://instagram.com/lalitakapilavai",
        youtubeUrl: "https://youtube.com/@lalitakapilavai",
        footerConfig: {
          aboutText:
            "Living digital archive documenting classical South Indian Thanjavur (Tanjore) 22k gold leaf relief sacred paintings, Mysore traditional artwork, and Carnatic classical vocal recitals.",
          contactEmail: "contact@lalitakapilavai.com",
          contactPhone: "+91 98450 12345",
          copyrightText: "© 2026 Lalita Kapilavai. All sacred rights reserved.",
          socialLinks: [
            { platform: "Instagram", url: "https://instagram.com/lalitakapilavai", isVisible: true },
            { platform: "YouTube", url: "https://youtube.com/@lalitakapilavai", isVisible: true },
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
          fromEmail: "contact@lalitakapilavai.com",
          fromName: "Lalita Kapilavai Archive",
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
    // Ensure configs exist if null
    const updates: Record<string, unknown> = {};
    if (!existingSettings.footerConfig) {
      updates.footerConfig = {
        aboutText:
          "Living digital archive documenting classical South Indian Thanjavur (Tanjore) 22k gold leaf relief sacred paintings, Mysore traditional artwork, and Carnatic classical vocal recitals.",
        contactEmail: existingSettings.contactEmail || "contact@lalitakapilavai.com",
        contactPhone: existingSettings.contactPhone || "+91 98450 12345",
        copyrightText: "© 2026 Lalita Kapilavai. All sacred rights reserved.",
        socialLinks: [
          { platform: "Instagram", url: existingSettings.instagramUrl || "https://instagram.com/lalitakapilavai", isVisible: true },
          { platform: "YouTube", url: existingSettings.youtubeUrl || "https://youtube.com/@lalitakapilavai", isVisible: true },
        ],
        legalLinks: [
          { label: "Privacy Policy", url: "/privacy", isVisible: true },
          { label: "Terms & Conditions", url: "/terms", isVisible: true },
          { label: "Art Licensing & Reproduction", url: "/licensing", isVisible: true },
          { label: "Admin Portal", url: "/admin", isVisible: true },
        ],
      };
    }
    if (Object.keys(updates).length > 0) {
      await prisma.systemSetting.update({
        where: { id: existingSettings.id },
        data: updates,
      });
      console.log("✅ Synchronized missing footer/email configurations in SystemSettings");
    }
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
    await prisma.artCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ Provisioned ${categories.length} Art Categories`);

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
  });

  if (!homePage) {
    const createdPage = await prisma.page.create({
      data: {
        title: "Sacred Art & Classical Carnatic Music",
        slug: "home",
        metaDescription:
          "Living digital archive of traditional Indian Tanjore paintings with 22k gold leaf, Mysore classical fine art, and Carnatic classical vocal recitals by Lalita Kapilavai.",
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
  } else {
    console.log("ℹ️ Default Home Page already exists");
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

  // 13. Provision Core System Pages (Editable Headers & Meta)
  const systemPages = [
    {
      title: "Sacred Art & Cultural Chronicle",
      slug: "blogs",
      metaTitle: "Sacred Art & Cultural Chronicle — Lalita Kapilavai",
      metaDescription:
        "Explore authoritative writings on 22k gold Tanjore painting techniques, Mysore traditional iconography, and Carnatic musical synesthesia by Lalita Kapilavai.",
      isPublished: true,
      displayInNav: true,
      navOrder: 3,
    },
    {
      title: "Traditional Art Gallery",
      slug: "gallery",
      metaTitle: "Fine Art Gallery & Tanjore Archive — Lalita Kapilavai",
      metaDescription:
        "Five centuries of classical sacred painting traditions preserved through authentic 22-carat gold foil relief work, purified gesso, and semi-precious Jaipur gemstones.",
      isPublished: true,
      displayInNav: true,
      navOrder: 1,
    },
    {
      title: "Exhibitions & Events",
      slug: "events",
      metaTitle: "Exhibitions, Concerts & Workshops — Lalita Kapilavai",
      metaDescription:
        "Experience the divine resonance of Carnatic ragas and witness museum-grade Thanjavur gold leaf masterworks in person.",
      isPublished: true,
      displayInNav: true,
      navOrder: 4,
    },
    {
      title: "Traditional Art Disciplines",
      slug: "categories",
      metaTitle: "Sacred Art Disciplines — Lalita Kapilavai",
      metaDescription:
        "Explore classical South Indian artistic disciplines spanning Thanjavur 22k gold foil embossments and Mysore traditional styles.",
      isPublished: true,
      displayInNav: false,
      navOrder: 5,
    },
  ];

  for (const sp of systemPages) {
    const existingPage = await prisma.page.findUnique({
      where: { slug: sp.slug },
    });
    if (!existingPage) {
      await prisma.page.create({
        data: {
          title: sp.title,
          slug: sp.slug,
          metaDescription: sp.metaDescription,
          isPublished: sp.isPublished,
        },
      });
      console.log(`✅ Provisioned editable system page: /${sp.slug}`);
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
