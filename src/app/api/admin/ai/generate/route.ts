import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateAiContent, GenerateOptions } from "@/lib/ai-client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as GenerateOptions;
    const { prompt, action, context, tone, modelOverride } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const generatedText = await generateAiContent({
      prompt,
      action,
      context,
      tone,
      modelOverride,
    });

    return NextResponse.json({
      success: true,
      text: generatedText,
    });
  } catch (error: unknown) {
    console.error("AI Generation Error:", error);
    const message = error instanceof Error ? error.message : "AI Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
