import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerBaseUrl } from "@/lib/get-base-url";
import { generateQRCodeBuffer, generateQRCodeSvg } from "@/lib/qr";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") || "svg").toLowerCase();
    const isDownload = searchParams.get("download") !== "false";

    const catalog = await prisma.eCatalog.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
        isDeleted: false,
      },
      select: {
        id: true,
        slug: true,
        title: true,
      },
    });

    if (!catalog) {
      return NextResponse.json({ error: "Catalog not found" }, { status: 404 });
    }

    const baseUrl = await getServerBaseUrl();
    const cleanBase = baseUrl.replace(/\/+$/, "");
    const targetUrl = `${cleanBase}/catalogs/${catalog.slug}`;

    if (format === "png") {
      const pngBuffer = await generateQRCodeBuffer(targetUrl, {
        width: 1024,
        margin: 2,
        color: {
          dark: "#1C1814",
          light: "#FFFFFF",
        },
      });

      const disposition = isDownload ? "attachment" : "inline";
      return new Response(pngBuffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `${disposition}; filename="${catalog.slug}-qr.png"`,
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    }

    // Default: Vector SVG
    const svgString = await generateQRCodeSvg(targetUrl, {
      margin: 2,
      color: {
        dark: "#1C1814",
        light: "#FFFFFF",
      },
    });

    const disposition = isDownload ? "attachment" : "inline";
    return new Response(svgString, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `${disposition}; filename="${catalog.slug}-qr.svg"`,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error: unknown) {
    console.error("[CATALOG_QR_API_ERROR]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
