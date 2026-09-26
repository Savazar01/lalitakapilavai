import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { uploadBuffer, getMediaStream } from "@/lib/storage";
import { generateWatermarkSvg } from "@/lib/watermark";

export const dynamic = "force-dynamic";

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function resolveArtworkSourceBuffer(artwork: {
  protectedS3Key?: string | null;
  primaryImageUrl?: string | null;
  watermarkedWebpUrl?: string | null;
}): Promise<Buffer | null> {
  // 1. Try protected master asset first
  if (artwork.protectedS3Key) {
    try {
      const cleanKey = artwork.protectedS3Key
        .replace(/^[/\\]+/, "")
        .replace(/^(media[/\\]|public[/\\]|vault[/\\])+/g, "");
      
      const { stream } = await getMediaStream(cleanKey);
      const buf = await streamToBuffer(stream);
      if (buf && buf.length > 0) return buf;
    } catch {
      // Fallback to local files or primaryImageUrl
    }
  }

  // 2. Try primaryImageUrl or watermarkedWebpUrl locally
  const targetUrl = artwork.primaryImageUrl || artwork.watermarkedWebpUrl;
  if (!targetUrl) return null;

  if (targetUrl.startsWith("/media/") || targetUrl.startsWith("media/")) {
    const relativePath = targetUrl.replace(/^\/?media\//, "");
    const possiblePaths = [
      path.join(process.cwd(), "public", "media", "vault", relativePath),
      path.join(process.cwd(), "public", "media", "public", relativePath),
      path.join(process.cwd(), "public", "media", relativePath),
      path.join(process.cwd(), "public", relativePath),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(/*turbopackIgnore: true*/ p)) {
        return fs.readFileSync(/*turbopackIgnore: true*/ p);
      }
    }
  }

  // 3. Remote URL fetch
  if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://")) {
    try {
      const res = await fetch(targetUrl);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        return Buffer.from(arrayBuf);
      }
    } catch {
      return null;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { artworkId } = body;

    const systemSettings = await prisma.systemSetting.findFirst().catch(() => null);
    const defaultText = systemSettings?.watermarkText || "© SavazAI WebApps | All Rights Reserved";
    const defaultOpacity = systemSettings?.watermarkOpacity ?? 0.85;
    const defaultStyle = (systemSettings?.watermarkStyle || "REPEAT_DIAGONAL") as
      | "REPEAT_DIAGONAL"
      | "BANNER"
      | "CORNER"
      | "BOTH";
    const defaultFontSize = systemSettings?.watermarkFontSize || undefined;

    // Determine target artworks
    const artworks = artworkId
      ? await prisma.artwork.findMany({
          where: { id: artworkId, isDeleted: false },
        })
      : await prisma.artwork.findMany({
          where: { isDeleted: false },
        });

    if (artworks.length === 0) {
      return NextResponse.json(
        { error: "No artworks found to process" },
        { status: 404 }
      );
    }

    const results: { id: string; title: string; success: boolean; url?: string; error?: string }[] = [];

    for (const art of artworks) {
      try {
        const sourceBuffer = await resolveArtworkSourceBuffer(art);
        if (!sourceBuffer) {
          results.push({
            id: art.id,
            title: art.title,
            success: false,
            error: "Source image buffer could not be located",
          });
          continue;
        }

        const metadata = await sharp(sourceBuffer).metadata();
        const width = metadata.width || 1200;
        const height = metadata.height || 800;

        // Check custom overrides
        let text = defaultText;
        let opacity = defaultOpacity;
        let style = defaultStyle;
        const fontSize = defaultFontSize;

        if (art.watermarkOverride && art.customWatermark) {
          const cw = art.customWatermark as {
            text?: string;
            opacity?: number;
            style?: "REPEAT_DIAGONAL" | "BANNER" | "CORNER" | "BOTH";
          };
          if (cw.text?.trim()) text = cw.text.trim();
          if (typeof cw.opacity === "number") opacity = cw.opacity;
          if (cw.style) style = cw.style;
        }

        const svgOverlay = generateWatermarkSvg({
          width,
          height,
          text,
          opacity,
          fontSize,
          style,
        });

        const watermarkedBuffer = await sharp(sourceBuffer)
          .composite([
            {
              input: Buffer.from(svgOverlay),
              top: 0,
              left: 0,
            },
          ])
          .webp({ quality: 85 })
          .toBuffer();

        const assetId = crypto.randomUUID();
        const watermarkedKey = `watermarked/${assetId}.webp`;
        const uploadResult = await uploadBuffer(
          watermarkedBuffer,
          watermarkedKey,
          "image/webp",
          false
        );

        await prisma.artwork.update({
          where: { id: art.id },
          data: {
            watermarkedWebpUrl: uploadResult.publicUrl,
          },
        });

        results.push({
          id: art.id,
          title: art.title,
          success: true,
          url: uploadResult.publicUrl,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Watermark processing failed";
        results.push({
          id: art.id,
          title: art.title,
          success: false,
          error: message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    return NextResponse.json({
      success: true,
      processed: artworks.length,
      succeeded: successCount,
      failed: artworks.length - successCount,
      results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error re-watermarking artworks";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
