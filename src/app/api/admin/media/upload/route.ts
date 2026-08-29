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
    const fontSize = Math.max(16, Math.min(Math.round(width * 0.028), 48));
    const bannerHeight = Math.max(40, Math.round(fontSize * 2.2));

    // Elegant SVG Watermark Overlay with dark blur bar and warm gold/ivory text
    const svgOverlay = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bannerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0D0E12" stop-opacity="0" />
            <stop offset="40%" stop-color="#0D0E12" stop-opacity="${opacity * 1.2}" />
            <stop offset="100%" stop-color="#0D0E12" stop-opacity="${opacity * 1.5}" />
          </linearGradient>
        </defs>
        <rect x="0" y="${height - bannerHeight}" width="${width}" height="${bannerHeight}" fill="url(#bannerGrad)" />
        <text 
          x="${width / 2}" 
          y="${height - bannerHeight / 2 + fontSize / 3}" 
          text-anchor="middle" 
          font-family="Georgia, serif" 
          font-size="${fontSize}px" 
          font-weight="600" 
          letter-spacing="2px"
          fill="#FAF7F2" 
          fill-opacity="${Math.min(opacity + 0.3, 0.85)}"
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
