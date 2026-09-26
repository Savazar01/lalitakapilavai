import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "savazai-webapps-platform",
      version: "0.1.0",
    },
    { status: 200 }
  );
}
