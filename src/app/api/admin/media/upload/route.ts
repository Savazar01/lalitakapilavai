import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadBuffer } from "@/lib/storage";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import crypto from "crypto";
import { generateWatermarkSvg } from "@/lib/watermark";



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

    // 4. Determine Media Type & Watermarking Requirement
    const mediaType = (formData.get("mediaType") as string) || "artwork";
    const isArtworkParam = formData.get("isArtwork");
    const isArtwork = isArtworkParam !== null ? isArtworkParam === "true" : mediaType === "artwork";

    // Non-Artwork Media (Logos, favicons, page builder images, blog illustrations)
    // Completely skip watermark compositing and master vault archiving
    if (!isArtwork) {
      const cleanWebpBuffer = await sharp(inputBuffer)
        .webp({ quality: 88 })
        .toBuffer();

      const generalKey = `${assetId}.webp`;
      const uploadResult = await uploadBuffer(
        cleanWebpBuffer,
        generalKey,
        "image/webp",
        false // public
      );

      return NextResponse.json({
        success: true,
        assetId,
        publicUrl: uploadResult.publicUrl,
        watermarkedUrl: uploadResult.publicUrl,
        primaryImageUrl: uploadResult.publicUrl,
        isWatermarked: false,
        mediaType,
        width,
        height,
        format: "webp",
        originalFormat: origExtension,
        originalSizeBytes: inputBuffer.length,
        optimizedSizeBytes: cleanWebpBuffer.length,
      });
    }

    // 5. Artwork Master Asset: Save Untouched Master to Protected Vault
    const masterKey = `masters/${assetId}.${origExtension}`;
    const masterUpload = await uploadBuffer(
      inputBuffer,
      masterKey,
      file.type || `image/${origExtension}`,
      true // isProtected
    );

    // 6. Query Watermark Settings from DB or Default
    const systemSettings = await prisma.systemSetting.findFirst().catch(() => null);
    const watermarkText =
      customWatermark ||
      systemSettings?.watermarkText ||
      "© Lalita Kapilavai | lalitakapilavai.com";
    const opacity = systemSettings?.watermarkOpacity || 0.85;

    // Generate Clean Cross-Platform SVG Overlay
    const svgOverlay = generateWatermarkSvg({
      width,
      height,
      text: watermarkText,
      opacity,
      fontSize: systemSettings?.watermarkFontSize || undefined,
    });

    // 7. Generate Watermarked WebP Derivative
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
      isWatermarked: true,
      mediaType: "artwork",
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
