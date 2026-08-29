import { PrismaClient, Role, MenuPosition } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Lalita Kapilavai database seed...");

  // 1. Provision Superadmin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@lalitakapilavai.com";
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "AdminPassword2026!";
  const hashedPassword = await hashPassword(adminPassword);

  let superadmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!superadmin) {
    superadmin = await prisma.user.create({
      data: {
        name: "Lalita Kapilavai Superadmin",
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
    console.log(`✅ Provisioned Superadmin: ${adminEmail}`);
  } else {
    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: superadmin.id,
        },
      },
      update: {
        password: hashedPassword,
        issuer: "local:credential",
      },
      create: {
        userId: superadmin.id,
        accountId: superadmin.id,
        providerId: "credential",
        issuer: "local:credential",
        password: hashedPassword,
      },
    });
    console.log(`✅ Refreshed Superadmin credentials: ${adminEmail}`);
  }
  console.log(`🔑 Seeded Superadmin Credentials -> Email: ${adminEmail} | Password: ${adminPassword}`);

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
        watermarkText: "© Lalita Kapilavai - Sacred Art & Heritage",
        watermarkOpacity: 0.35,
        watermarkFontSize: 28,
        r2AccountId: process.env.R2_ACCOUNT_ID || "cloudflare-r2-account-id",
        r2BucketName: "lalitakapilavai-media",
        r2PublicUrl: "https://media.lalitakapilavai.com",
        s3Region: "ap-south-1",
        s3BucketName: "lalitakapilavai-masters-backup",
        instagramUrl: "https://instagram.com/lalitakapilavai",
        youtubeUrl: "https://youtube.com/@lalitakapilavai",
      },
    });
    console.log("✅ Provisioned SystemSettings with watermark and storage settings");
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
        label: "Commissions & Contact",
        path: "/commission",
        position: MenuPosition.TOP_RIGHT,
        orderIndex: 5,
      },
    });

    console.log("✅ Provisioned Hierarchical Navigation Menu Tree");
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
