export interface PageHeadingConfig {
  badge?: string;
  title: string;
  subtitle: string;
}

export interface AdminPortalConfig {
  dashboardTitle: string;
  sidebarBrandTitle: string;
  sidebarBrandSubtitle: string;
  sidebarLabels: Record<string, string>;
  pageHeadings: Record<string, PageHeadingConfig>;
}

export const DEFAULT_ADMIN_CONFIG: AdminPortalConfig = {
  dashboardTitle: "Archive & Platform Dashboard",
  sidebarBrandTitle: "Lalita Kapilavai",
  sidebarBrandSubtitle: "Control Center",
  sidebarLabels: {
    overview: "Overview",
    pages: "Page Layouts",
    navigation: "Navigation Menus",
    posts: "Blogs & AEO Posts",
    categories: "Categories",
    artworks: "Artwork Catalog",
    catalogs: "e-Catalogs",
    events: "Exhibitions & Events",
    leads: "Leads & QR Scans",
    settings: "System Settings",
    users: "User Administration",
  },
  pageHeadings: {
    overview: {
      badge: "Administrative Overview",
      title: "Welcome to Lalita Kapilavai Archive",
      subtitle: "Manage your sacred artwork catalog with 22k gold specifications, dynamic watermarked assets, exhibitions, physical QR scan leads, and Carnatic music synesthetic models.",
    },
    pages: {
      badge: "Visual Page Builder",
      title: "Custom Page Layouts",
      subtitle: "Build dynamic 12-column pages with inline Tiptap editing and responsive preview emulators.",
    },
    navigation: {
      badge: "Navigation Architecture",
      title: "Navigation Menus",
      subtitle: "Configure header, footer, and mobile drawer navigation hierarchies.",
    },
    posts: {
      badge: "Content Engine",
      title: "Blogs & AEO Posts",
      subtitle: "Craft search-engine and AI-optimized essays, art retrospectives, and cultural documentation.",
    },
    categories: {
      badge: "Artistic Lineages",
      title: "Traditional Art Disciplines",
      subtitle: "Manage Tanjore, Mysore, and classical school categories and descriptions.",
    },
    artworks: {
      badge: "Vault & Catalog Management",
      title: "Artwork Catalog",
      subtitle: "Curate Tanjore gold relief masterpieces, Mysore classical schools, dimensions, and exhibition QR scans.",
    },
    catalogs: {
      badge: "Digital Publications",
      title: "Curatorial e-Catalogs",
      subtitle: "Design publication-ready digital exhibition catalogs, retrospective monographs, and collector portfolios.",
    },
    events: {
      badge: "Cultural Calendar & Recitals",
      title: "Exhibitions, Recitals & Workshops",
      subtitle: "Curate international schedules, venue coordinates, timezones, and masterwork exhibition linkages.",
    },
    leads: {
      badge: "Inbound Inquiries & QR Scans",
      title: "Inbound Leads & QR CRM",
      subtitle: "Track collector inquiries, exhibition floor scans, and custom commissioning requests.",
    },
    settings: {
      badge: "Platform Infrastructure",
      title: "System Configuration",
      subtitle: "Platform storage, watermarking, email providers, and white-label branding.",
    },
    users: {
      badge: "Access Control",
      title: "User Administration",
      subtitle: "Manage team permissions, administrative roles, and system access.",
    },
  },
};

export function mergeAdminConfig(storedConfig?: unknown): AdminPortalConfig {
  if (!storedConfig || typeof storedConfig !== "object") {
    return DEFAULT_ADMIN_CONFIG;
  }
  const s = storedConfig as Partial<AdminPortalConfig>;
  return {
    dashboardTitle: typeof s.dashboardTitle === "string" && s.dashboardTitle.trim() ? s.dashboardTitle : DEFAULT_ADMIN_CONFIG.dashboardTitle,
    sidebarBrandTitle: typeof s.sidebarBrandTitle === "string" && s.sidebarBrandTitle.trim() ? s.sidebarBrandTitle : DEFAULT_ADMIN_CONFIG.sidebarBrandTitle,
    sidebarBrandSubtitle: typeof s.sidebarBrandSubtitle === "string" && s.sidebarBrandSubtitle.trim() ? s.sidebarBrandSubtitle : DEFAULT_ADMIN_CONFIG.sidebarBrandSubtitle,
    sidebarLabels: {
      ...DEFAULT_ADMIN_CONFIG.sidebarLabels,
      ...(s.sidebarLabels && typeof s.sidebarLabels === "object" ? s.sidebarLabels : {}),
    },
    pageHeadings: {
      ...DEFAULT_ADMIN_CONFIG.pageHeadings,
      ...(s.pageHeadings && typeof s.pageHeadings === "object" ? s.pageHeadings : {}),
    },
  };
}
