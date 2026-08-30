import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MIME_MAP: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const segments = resolvedParams?.path;

    if (!Array.isArray(segments) || segments.length === 0) {
      return new NextResponse("Invalid Path", { status: 400 });
    }

    // Defensive Path Traversal Protection: reject any segment containing '..' or path separators
    const cleanSegments = segments.map((s) =>
      decodeURIComponent(s).replace(/[/\\?%*:|"<>]/g, "")
    );

    if (cleanSegments.some((s) => s.includes("..") || s.length === 0)) {
      return new NextResponse("Forbidden Path", { status: 403 });
    }

    const baseMediaDir = path.join(process.cwd(), "public", "media");

    // Attempt multiple candidate paths to support both /media/public/file.webp and /media/file.webp
    const candidatePaths = [
      path.join(baseMediaDir, ...cleanSegments),
      path.join(baseMediaDir, "public", ...cleanSegments),
      path.join(process.cwd(), "public", ...cleanSegments),
    ];

    let targetFilePath: string | null = null;

    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        try {
          const stats = fs.statSync(candidate);
          if (stats.isFile()) {
            targetFilePath = candidate;
            break;
          }
        } catch {
          continue;
        }
      }
    }

    if (!targetFilePath) {
      return new NextResponse("Media File Not Found", { status: 404 });
    }

    const ext = path.extname(targetFilePath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";
    const fileBuffer = fs.readFileSync(/*turbopackIgnore: true*/ targetFilePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error streaming media file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
