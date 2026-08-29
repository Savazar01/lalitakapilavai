import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadBuffer } from "@/lib/storage";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import crypto from "crypto";

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Better-Auth Admin Session Verification
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized administrative access" },
        { status: 401 }
      );
    }

    // 2. Parse Multipart Form Data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const customWatermark = formData.get("watermarkText") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided in upload request" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // 3. Extract Image Metadata via Sharp & Validate Format
    const allowedFormats = ["jpeg", "jpg", "png", "webp", "gif", "tiff", "tif"];
    const metadata = await sharp(inputBuffer).metadata();
    if (!metadata.width || !metadata.height || !metadata.format) {
      return NextResponse.json(
        { error: "Failed to read image dimensions or unsupported format" },
        { status: 422 }
      );
    }

    const detectedFormat = metadata.format.toLowerCase();
    if (!allowedFormats.includes(detectedFormat)) {
      return NextResponse.json(
        {
          error: `Unsupported image format (${detectedFormat}). Please upload JPEG, PNG, WebP, GIF, or TIFF.`,
        },
        { status: 400 }
      );
    }

    const width = metadata.width;
    const height = metadata.height;
    const origExtension = detectedFormat === "jpeg" ? "jpg" : detectedFormat;
    const assetId = crypto.randomUUID();

    // 4. Save Untouched Master Asset to Protected Vault
    const masterKey = `masters/${assetId}.${origExtension}`;
    const masterUpload = await uploadBuffer(
      inputBuffer,
      masterKey,
      file.type || `image/${origExtension}`,
      true // isProtected
    );

    // 5. Query Watermark Settings from DB or Default
    const systemSettings = await prisma.systemSetting.findFirst().catch(() => null);
    const watermarkText =
      customWatermark ||
      systemSettings?.watermarkText ||
      "© Lalita Kapilavai | lalitakapilavai.com";
    const opacity = systemSettings?.watermarkOpacity || 0.45;

    // Calculate proportional font and banner dimensions
    const fontSize = Math.max(18, Math.min(Math.round(width * 0.03), 48));
    const bannerHeight = Math.max(48, Math.round(fontSize * 2.4));

    // High-Contrast Luxury SVG Watermark Overlay with solid obsidian backdrop & temple-gold border
    const svgOverlay = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="textShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.9"/>
          </filter>
        </defs>
        <!-- Overt Obsidian Protection Banner -->
        <rect x="0" y="${height - bannerHeight}" width="${width}" height="${bannerHeight}" fill="#0F0E0D" fill-opacity="${Math.max(0.75, opacity)}" />
        <line x1="0" y1="${height - bannerHeight}" x2="${width}" y2="${height - bannerHeight}" stroke="#D4AF37" stroke-width="2" stroke-opacity="${Math.max(0.8, opacity)}" />
        <text 
          x="${width / 2}" 
          y="${height - bannerHeight / 2 + fontSize / 3}" 
          text-anchor="middle" 
          font-family="Georgia, 'Cinzel Decorative', serif" 
          font-size="${fontSize}px" 
          font-weight="700" 
          letter-spacing="2.5px"
          fill="#FAF7F2" 
          filter="url(#textShadow)"
        >
          ${escapeXml(watermarkText)}
        </text>
      </svg>
    `;

    // 6. Generate Watermarked WebP Derivative
    const watermarkedBuffer = await sharp(inputBuffer)
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0,
        },
      ])
      .webp({ quality: 85 })
      .toBuffer();

    const watermarkedKey = `watermarked/${assetId}.webp`;
    const watermarkedUpload = await uploadBuffer(
      watermarkedBuffer,
      watermarkedKey,
      "image/webp",
      false // public
    );

    return NextResponse.json({
      success: true,
      assetId,
      publicUrl: watermarkedUpload.publicUrl,
      watermarkedUrl: watermarkedUpload.publicUrl,
      primaryImageUrl: watermarkedUpload.publicUrl,
      protectedS3Key: masterUpload.key,
      vaultKey: masterUpload.key,
      masterKey: masterUpload.key,
      width,
      height,
      format: "webp",
      originalFormat: origExtension,
      originalSizeBytes: inputBuffer.length,
      watermarkedSizeBytes: watermarkedBuffer.length,
    });
  } catch (error: unknown) {
    console.error("Media watermarking upload error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
