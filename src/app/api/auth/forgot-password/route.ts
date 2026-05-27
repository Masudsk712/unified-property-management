// ============================================================================
// Auth Forgot Password API — POST
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { forgotPassword } from "@/services/auth.service";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
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
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const result = await forgotPassword(parsed.data.email);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[FORGOT-PASSWORD] Error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}