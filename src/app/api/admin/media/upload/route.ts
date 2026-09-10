import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadBuffer } from "@/lib/storage";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import crypto from "crypto";
import heicConvert from "heic-convert";
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

    // 2b. PDF Document Upload Bypass (Curatorial Monographs, Exhibition Catalogs, CVs)
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf") ||
      formData.get("mediaType") === "document";

    if (isPdf) {
      const assetId = crypto.randomUUID();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const docKey = `documents/${assetId}_${sanitizedName}`;
      const uploadResult = await uploadBuffer(
        inputBuffer,
        docKey,
        "application/pdf",
        false
      );

      return NextResponse.json({
        success: true,
        assetId,
        publicUrl: uploadResult.publicUrl,
        fileUrl: uploadResult.publicUrl,
        fileName: file.name,
        mediaType: "document",
        fileSizeBytes: inputBuffer.length,
      });
    }

    // 2c. Intercept Apple HEIC / HEICS Images and Transcode to High-Fidelity JPEG
    const fileNameLower = file.name.toLowerCase();
    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      file.type === "image/heic-sequence" ||
      fileNameLower.endsWith(".heic") ||
      fileNameLower.endsWith(".heics") ||
      fileNameLower.endsWith(".heif");

    let processingBuffer: Buffer = inputBuffer;
    let convertedFromHeic = false;

    if (isHeic) {
      try {
        // Transcode Apple HEIC buffer into high-fidelity JPEG
        // 95% quality preserves 22k gold leaf foil, gesso reliefs, and fine brushwork micro-textures
        const convertedArrayBuffer = await heicConvert({
          buffer: inputBuffer,
          format: "JPEG",
          quality: 0.95,
        });
        processingBuffer = Buffer.from(convertedArrayBuffer);
        convertedFromHeic = true;
      } catch (heicErr) {
        console.error("Failed to decode Apple HEIC file:", heicErr);
        return NextResponse.json(
          { error: "Could not decode Apple HEIC/HEICS image. Please verify file integrity." },
          { status: 422 }
        );
      }
    }

    // 3. Extract Image Metadata via Sharp & Validate Format
    const allowedFormats = ["jpeg", "jpg", "png", "webp", "gif", "tiff", "tif"];
    const metadata = await sharp(processingBuffer).metadata();
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
          error: `Unsupported image format (${detectedFormat}). Please upload JPEG, PNG, WebP, GIF, TIFF, or Apple HEIC/HEICS.`,
        },
        { status: 400 }
      );
    }

    const width = metadata.width;
    const height = metadata.height;
    const origExtension = convertedFromHeic ? "jpg" : (detectedFormat === "jpeg" ? "jpg" : detectedFormat);
    const assetId = crypto.randomUUID();

    // 4. Determine Media Type & Watermarking Requirement
    const mediaType = (formData.get("mediaType") as string) || "artwork";
    const isArtworkParam = formData.get("isArtwork");
    const isArtwork = isArtworkParam !== null ? isArtworkParam === "true" : mediaType === "artwork";

    // Non-Artwork Media (Logos, favicons, page builder images, blog illustrations)
    // Completely skip watermark compositing and master vault archiving
    if (!isArtwork) {
      const cleanWebpBuffer = await sharp(processingBuffer)
        .webp({ quality: 88 })
        .toBuffer();

      const generalKey = `${assetId}.webp`;
      const uploadResult = await uploadBuffer(
        cleanWebpBuffer,
        generalKey,
        "image/webp",
        false // public (persists locally to public/media/public or S3)
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
        originalFormat: convertedFromHeic ? "heic" : origExtension,
        convertedFromHeic,
        originalSizeBytes: inputBuffer.length,
        optimizedSizeBytes: cleanWebpBuffer.length,
      });
    }

    // 5. Artwork Master Asset: Save to Protected Vault (Local disk public/media/vault or Cloud S3)
    // If converted from HEIC, generate a 95% archival JPEG master with 4:4:4 chroma subsampling
    let masterBuffer = inputBuffer;
    let masterExtension = origExtension;
    let masterMime = file.type || `image/${origExtension}`;

    if (convertedFromHeic) {
      masterBuffer = await sharp(processingBuffer)
        .jpeg({ quality: 95, chromaSubsampling: "4:4:4" })
        .toBuffer();
      masterExtension = "jpg";
      masterMime = "image/jpeg";
    }

    const masterKey = `masters/${assetId}.${masterExtension}`;
    const masterUpload = await uploadBuffer(
      masterBuffer,
      masterKey,
      masterMime,
      true // isProtected (writes to local vault or protected cloud storage)
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
      style: systemSettings?.watermarkStyle || "REPEAT_DIAGONAL",
    });

    // 7. Generate Watermarked WebP Derivative directly from processingBuffer
    const watermarkedBuffer = await sharp(processingBuffer)
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
      false // public (writes to local public/media/public or public cloud storage)
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
      originalFormat: convertedFromHeic ? "heic" : origExtension,
      convertedFromHeic,
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
