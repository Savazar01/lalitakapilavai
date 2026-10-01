import { NextResponse } from "next/server";
import { generateCaptchaChallenge } from "@/lib/security/captcha-validator";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const challenge = generateCaptchaChallenge();
    return NextResponse.json({
      success: true,
      question: challenge.question,
      token: challenge.token,
    });
  } catch (error) {
    console.error("[CaptchaGenerateAPI] Error generating challenge:", error);
    return NextResponse.json(
      { error: "Failed to generate security challenge" },
      { status: 500 }
    );
  }
}
