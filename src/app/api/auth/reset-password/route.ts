// ============================================================================
// Auth Reset Password API — POST
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resetPassword } from "@/services/auth.service";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 3 requests per minute per IP
    const key = getRateLimitKey(req);
    const { success, remaining, resetTime } = rateLimit(key, {
      interval: 60_000,
      maxRequests: 3,
    });

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((resetTime - Date.now()) / 1000)),
            "X-RateLimit-Remaining": String(remaining),
          },
        }
      );
    }

    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await resetPassword(parsed.data);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("[RESET-PASSWORD] Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again later.";

    const isBadRequest =
      message.includes("Invalid") ||
      message.includes("expired") ||
      message.includes("User not found");

    return NextResponse.json(
      { success: false, error: message },
      { status: isBadRequest ? 400 : 500 }
    );
  }
}