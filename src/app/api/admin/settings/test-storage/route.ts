import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { testGoogleWorkspaceConnection, GoogleServicesConfig } from "@/lib/storage/google-drive-driver";
import { testNextcloudConnection, NextcloudConfig } from "@/lib/storage/nextcloud-driver";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { provider, config } = body as {
      provider: "google" | "nextcloud";
      config: Record<string, unknown>;
    };

    if (provider === "google") {
      const result = await testGoogleWorkspaceConnection(config as unknown as GoogleServicesConfig);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    if (provider === "nextcloud") {
      const result = await testNextcloudConnection(config as unknown as NextcloudConfig);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    return NextResponse.json({ error: "Invalid storage provider requested" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error testing storage connection";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
