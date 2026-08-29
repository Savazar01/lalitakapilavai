import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMediaStream } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized access to master vault" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Missing asset key parameter" },
        { status: 400 }
      );
    }

    const { stream, contentType } = await getMediaStream(key);

    // Convert readable stream to web Response
    // @ts-expect-error - node stream to web stream bridge
    return new Response(stream, {
      headers: {
        "Content-Type": contentType || "image/jpeg",
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Content-Disposition": `inline; filename="${key.split("/").pop()}"`,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error reading vault asset";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
