import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export interface MediaVaultItem {
  id: string;
  url: string;
  fileName: string;
  title?: string;
  source: "artwork" | "event" | "catalog" | "storage" | "document";
  category?: string;
  createdAt?: string;
  mediaType?: "image" | "pdf";
  slug?: string;
  medium?: string;
  dimensions?: string;
  year?: string | number;
  traditionalSchool?: string;
  description?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access to media vault" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const sourceFilter = (searchParams.get("source") || "all").toLowerCase();
    const typeFilter = (searchParams.get("type") || "all").toLowerCase(); // "image" | "pdf" | "all"
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "40", 10), 10), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const items: MediaVaultItem[] = [];
    const seenUrls = new Set<string>();

    // 1. Fetch from Artwork model (images only)
    if ((typeFilter === "all" || typeFilter === "image") && (sourceFilter === "all" || sourceFilter === "artwork")) {
      const artworks = await prisma.artwork.findMany({
        where: {
          isDeleted: false,
          ...(search
            ? {
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { primaryImageUrl: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          title: true,
          slug: true,
          primaryImageUrl: true,
          watermarkedWebpUrl: true,
          medium: true,
          dimensions: true,
          yearCreated: true,
          description: true,
          createdAt: true,
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 60,
      });

      for (const art of artworks) {
        const url = art.watermarkedWebpUrl || art.primaryImageUrl;
        if (url && !seenUrls.has(url)) {
          seenUrls.add(url);
          items.push({
            id: art.id,
            url,
            fileName: url.split("/").pop() || "artwork.jpg",
            title: art.title,
            slug: art.slug,
            source: "artwork",
            category: art.category?.name || "Artwork",
            traditionalSchool: art.category?.name || "Thanjavur (Tanjore) Classical",
            medium: art.medium || "22k Gold Foil, Gesso, Teak Wood",
            dimensions: art.dimensions || "",
            year: art.yearCreated || undefined,
            description: art.description || undefined,
            createdAt: art.createdAt?.toISOString(),
          });
        }
      }
    }

    // 2. Fetch from Event model
    if (sourceFilter === "all" || sourceFilter === "event" || sourceFilter === "document") {
      const events = await prisma.event.findMany({
        where: {
          isDeleted: false,
          OR: [
            { posterUrl: { not: null } },
            { bannerImage: { not: null } },
            { brochurePdfUrl: { not: null } },
          ],
          ...(search
            ? {
                AND: [
                  {
                    OR: [
                      { title: { contains: search, mode: "insensitive" } },
                      { posterUrl: { contains: search, mode: "insensitive" } },
                      { bannerImage: { contains: search, mode: "insensitive" } },
                      { brochurePdfUrl: { contains: search, mode: "insensitive" } },
                    ],
                  },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          title: true,
          posterUrl: true,
          bannerImage: true,
          brochurePdfUrl: true,
          brochureTitle: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      for (const evt of events) {
        if ((typeFilter === "all" || typeFilter === "image") && (sourceFilter === "all" || sourceFilter === "event")) {
          if (evt.posterUrl && !seenUrls.has(evt.posterUrl)) {
            seenUrls.add(evt.posterUrl);
            items.push({
              id: evt.id + "-poster",
              url: evt.posterUrl,
              fileName: evt.posterUrl.split("/").pop() || "event-poster.jpg",
              title: evt.title + " (Poster)",
              source: "event",
              category: "Exhibition Poster",
              createdAt: evt.createdAt?.toISOString(),
              mediaType: "image",
            });
          }
          if (evt.bannerImage && !seenUrls.has(evt.bannerImage)) {
            seenUrls.add(evt.bannerImage);
            items.push({
              id: evt.id + "-banner",
              url: evt.bannerImage,
              fileName: evt.bannerImage.split("/").pop() || "event-banner.jpg",
              title: evt.title + " (Banner)",
              source: "event",
              category: "Exhibition Banner",
              createdAt: evt.createdAt?.toISOString(),
              mediaType: "image",
            });
          }
        }
        if ((typeFilter === "all" || typeFilter === "pdf") && (sourceFilter === "all" || sourceFilter === "event" || sourceFilter === "document")) {
          if (evt.brochurePdfUrl && !seenUrls.has(evt.brochurePdfUrl)) {
            seenUrls.add(evt.brochurePdfUrl);
            items.push({
              id: evt.id + "-brochure",
              url: evt.brochurePdfUrl,
              fileName: evt.brochurePdfUrl.split("/").pop() || "event-brochure.pdf",
              title: (evt.brochureTitle || evt.title) + " (Brochure PDF)",
              source: "document",
              category: "Exhibition Brochure",
              createdAt: evt.createdAt?.toISOString(),
              mediaType: "pdf",
            });
          }
        }
      }
    }

    // 3. Fetch from ECatalog model
    if ((typeFilter === "all" || typeFilter === "image") && (sourceFilter === "all" || sourceFilter === "catalog")) {
      const catalogs = await prisma.eCatalog.findMany({
        where: {
          isDeleted: false,
          coverImageUrl: { not: null },
          ...(search
            ? {
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { coverImageUrl: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          title: true,
          coverImageUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 40,
      });

      for (const cat of catalogs) {
        if (cat.coverImageUrl && !seenUrls.has(cat.coverImageUrl)) {
          seenUrls.add(cat.coverImageUrl);
          items.push({
            id: cat.id,
            url: cat.coverImageUrl,
            fileName: cat.coverImageUrl.split("/").pop() || "catalog-cover.jpg",
            title: cat.title,
            source: "catalog",
            category: "e-Catalog Cover",
            createdAt: cat.createdAt?.toISOString(),
            mediaType: "image",
          });
        }
      }
    }

    // 4. Scan public/media/public directory for uploaded images and documents
    if (sourceFilter === "all" || sourceFilter === "storage" || sourceFilter === "document") {
      try {
        const publicMediaDir = path.join(process.cwd(), "public", "media", "public");
        const files = await fs.readdir(publicMediaDir);
        for (const f of files) {
          const lower = f.toLowerCase();
          const isPdf = lower.endsWith(".pdf");
          const isImage =
            lower.endsWith(".jpg") ||
            lower.endsWith(".jpeg") ||
            lower.endsWith(".png") ||
            lower.endsWith(".webp") ||
            lower.endsWith(".svg") ||
            lower.endsWith(".gif");

          if ((typeFilter === "all" && (isImage || isPdf)) || (typeFilter === "image" && isImage) || (typeFilter === "pdf" && isPdf)) {
            const url = "/media/public/" + f;
            if (!seenUrls.has(url)) {
              if (!search || f.toLowerCase().includes(search)) {
                seenUrls.add(url);
                items.push({
                  id: "file-" + f,
                  url,
                  fileName: f,
                  title: f.replace(/[-_]/g, " "),
                  source: isPdf ? "document" : "storage",
                  category: isPdf ? "Curatorial PDF Document" : "Uploaded Media Storage",
                  mediaType: isPdf ? "pdf" : "image",
                });
              }
            }
          }
        }
      } catch {
        // Folder might be empty
      }

      // Also scan public/documents if available
      try {
        const publicDocsDir = path.join(process.cwd(), "public", "documents");
        const docFiles = await fs.readdir(publicDocsDir);
        for (const f of docFiles) {
          if (f.toLowerCase().endsWith(".pdf")) {
            if (typeFilter === "all" || typeFilter === "pdf") {
              const url = "/documents/" + f;
              if (!seenUrls.has(url)) {
                if (!search || f.toLowerCase().includes(search)) {
                  seenUrls.add(url);
                  items.push({
                    id: "doc-" + f,
                    url,
                    fileName: f,
                    title: f.replace(/[-_]/g, " "),
                    source: "document",
                    category: "Curatorial PDF Document",
                    mediaType: "pdf",
                  });
                }
              }
            }
          }
        }
      } catch {
        // Folder might not exist
      }
    }

    // Filter by search query if any
    const filtered = search
      ? items.filter(
          (it) =>
            it.fileName.toLowerCase().includes(search) ||
            (it.title && it.title.toLowerCase().includes(search)) ||
            (it.category && it.category.toLowerCase().includes(search))
        )
      : items;

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      items: paginatedItems,
      totalCount: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    });
  } catch (error: unknown) {
    console.error("[Media Vault API Error]:", error);
    const message = error instanceof Error ? error.message : "Error fetching media vault items";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
