import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export interface StorageConfig {
  bucket: string;
  publicUrl: string;
  isLocalStorage: boolean;
  endpoint?: string;
  region?: string;
}

let cachedS3Client: S3Client | null = null;
let cachedConfig: StorageConfig | null = null;

/**
 * Dynamically resolves storage configuration from PostgreSQL SystemSetting
 * with environment variable fallback.
 */
export async function getStorageConfig(): Promise<StorageConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  let dbSettings = null;
  try {
    dbSettings = await prisma.systemSetting.findFirst();
  } catch {
    // Database might be initializing during build or migrations
  }

  const accountId =
    dbSettings?.r2AccountId ||
    process.env.R2_ACCOUNT_ID ||
    process.env.AWS_ACCOUNT_ID;
  const accessKeyId =
    process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
  const secretAccessKey =
    process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";
  const bucket =
    dbSettings?.r2BucketName ||
    process.env.R2_BUCKET_NAME ||
    process.env.S3_BUCKET_NAME ||
    "lalitakapilavai-media";
  const publicUrl =
    dbSettings?.r2PublicUrl ||
    process.env.R2_PUBLIC_URL ||
    process.env.S3_PUBLIC_DOMAIN ||
    "/media";
  const region = dbSettings?.s3Region || process.env.AWS_REGION || "auto";

  // Check if credentials are valid cloud credentials or dummy/local placeholders
  const isDummyCredential =
    !accessKeyId ||
    accessKeyId.includes("dummy") ||
    accessKeyId.includes("your-r2") ||
    !secretAccessKey ||
    secretAccessKey.includes("dummy");

  if (isDummyCredential) {
    cachedConfig = {
      bucket,
      publicUrl: publicUrl.startsWith("http") ? publicUrl : "/media",
      isLocalStorage: true,
    };
    return cachedConfig;
  }

  // Cloudflare R2 or custom S3 endpoint
  const endpoint = accountId
    ? `https://${accountId}.r2.cloudflarestorage.com`
    : process.env.S3_ENDPOINT;

  cachedConfig = {
    bucket,
    publicUrl,
    isLocalStorage: false,
    endpoint,
    region,
  };

  return cachedConfig;
}

/**
 * Returns an authenticated S3Client instance.
 */
export async function getStorageClient(): Promise<S3Client | null> {
  const config = await getStorageConfig();
  if (config.isLocalStorage) {
    return null;
  }

  if (cachedS3Client) {
    return cachedS3Client;
  }

  const accessKeyId =
    process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
  const secretAccessKey =
    process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";

  cachedS3Client = new S3Client({
    region: config.region || "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return cachedS3Client;
}

/**
 * Uploads a Buffer to storage (Cloudflare R2, AWS S3, or Local Vault Fallback)
 */
export async function uploadBuffer(
  buffer: Buffer,
  key: string,
  contentType: string,
  isProtected = false
): Promise<{ key: string; publicUrl: string }> {
  const config = await getStorageConfig();
  const client = await getStorageClient();

  if (config.isLocalStorage || !client) {
    // Local filesystem storage fallback
    const subFolder = isProtected ? "vault" : "public";
    const baseDir = path.join(process.cwd(), "public", "media", subFolder);
    const filePath = path.join(baseDir, key);

    // Ensure target folder exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);

    const publicUrl = isProtected
      ? `/api/admin/media/vault?key=${encodeURIComponent(key)}`
      : `/media/${subFolder}/${key}`;

    return { key, publicUrl };
  }

  // Cloud R2 / S3 Upload
  const fullKey = isProtected ? `vault/${key}` : `public/${key}`;

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: fullKey,
      Body: buffer,
      ContentType: contentType,
      CacheControl: isProtected ? "no-store, private" : "public, max-age=31536000, immutable",
    })
  );

  const cleanBase = config.publicUrl.replace(/\/+$/, "");
  const publicUrl = isProtected
    ? await generatePresignedDownloadUrl(fullKey, 3600)
    : `${cleanBase}/${fullKey}`;

  return { key: fullKey, publicUrl };
}

/**
 * Generates a presigned upload URL for direct browser uploads.
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 3600
): Promise<string> {
  const config = await getStorageConfig();
  const client = await getStorageClient();

  if (config.isLocalStorage || !client) {
    return `/api/admin/media/upload?key=${encodeURIComponent(key)}`;
  }

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generates a presigned download URL for protected master files.
 */
export async function generatePresignedDownloadUrl(
  key: string,
  expiresInSeconds = 900
): Promise<string> {
  const config = await getStorageConfig();
  const client = await getStorageClient();

  if (config.isLocalStorage || !client) {
    return `/api/admin/media/vault?key=${encodeURIComponent(key)}`;
  }

  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });

  return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Retrieves a Readable stream for audio (MP3/WAV) or concert video streaming.
 */
export async function getMediaStream(
  key: string
): Promise<{ stream: Readable; contentType?: string; contentLength?: number }> {
  const config = await getStorageConfig();
  const client = await getStorageClient();

  if (config.isLocalStorage || !client) {
    // Check public or vault folder
    let filePath = path.join(process.cwd(), "public", "media", "vault", key);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), "public", "media", "public", key);
    }
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), "public", "media", key);
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Media asset not found: ${key}`);
    }

    const stat = fs.statSync(filePath);
    return {
      stream: fs.createReadStream(filePath),
      contentLength: stat.size,
    };
  }

  const response = await client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    })
  );

  return {
    stream: response.Body as Readable,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
  };
}
