import { NextRequest, NextResponse } from "next/server";
import { generateQRCodeDataUrl } from "@/lib/qr";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getServerBaseUrl } from "@/lib/get-base-url";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const eventId = searchParams.get("eventId");
  const directUrl = searchParams.get("url");
  const originParam = searchParams.get("origin");

  let targetUrl = directUrl;
  if (!targetUrl && slug) {
    const baseUrl = originParam
      ? originParam.replace(/\/+$/, "")
      : await getServerBaseUrl(request);

    if (eventId) {
      targetUrl = `${baseUrl}/artwork/${slug}?qr=true&eventId=${encodeURIComponent(eventId)}`;
    } else {
      targetUrl = `${baseUrl}/artwork/${slug}?qr=true`;
    }
  }

  if (!targetUrl) {
    return NextResponse.json(
      { error: "Missing required slug or url parameter" },
      { status: 400 }
    );
  }

  try {
    const dataUrl = await generateQRCodeDataUrl(targetUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: "#0F0E0D",
        light: "#FFFFFF",
      },
    });

    return NextResponse.json({ dataUrl, targetUrl });
  } catch (error) {
    console.error("QR Code Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR Code" },
      { status: 500 }
    );
  }
}
