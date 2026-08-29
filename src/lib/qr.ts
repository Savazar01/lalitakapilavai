import QRCode from "qrcode";
import { uploadBuffer } from "@/lib/storage";

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generates a PNG QR code buffer for an artwork or exhibition link.
 */
export async function generateQRCodeBuffer(
  targetUrl: string,
  options?: QRCodeOptions
): Promise<Buffer> {
  const qrBuffer = await QRCode.toBuffer(targetUrl, {
    type: "png",
    width: options?.width || 512,
    margin: options?.margin || 2,
    color: {
      dark: options?.color?.dark || "#1A1A1A", // Charcoal
      light: options?.color?.light || "#FAF7F2", // Parchment
    },
    errorCorrectionLevel: "H", // High fault tolerance for scanning in physical galleries
  });

  return qrBuffer;
}

/**
 * Generates an artwork exhibition QR code pointing to `/artwork/[slug]?qr=true`,
 * uploads the image to the storage adapter, and saves the QR asset.
 */
export async function generateAndStoreArtworkQR(
  slug: string,
  baseUrl?: string
): Promise<{ key: string; publicUrl: string; targetUrl: string }> {
  const host =
    baseUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3060";
  const targetUrl = `${host.replace(/\/+$/, "")}/artwork/${slug}?qr=true`;

  const qrBuffer = await generateQRCodeBuffer(targetUrl, {
    width: 600,
    margin: 2,
    color: {
      dark: "#0D0E12", // Obsidian
      light: "#FFFFFF",
    },
  });

  const key = `qr-codes/${slug}.png`;
  const uploadResult = await uploadBuffer(qrBuffer, key, "image/png", false);

  return {
    key: uploadResult.key,
    publicUrl: uploadResult.publicUrl,
    targetUrl,
  };
}

/**
 * Generates a Data URL (base64) string for inline display or PDF export.
 */
export async function generateQRCodeDataUrl(
  targetUrl: string,
  options?: QRCodeOptions
): Promise<string> {
  return await QRCode.toDataURL(targetUrl, {
    width: options?.width || 300,
    margin: options?.margin || 2,
    color: {
      dark: options?.color?.dark || "#1A1A1A",
      light: options?.color?.light || "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });
}
