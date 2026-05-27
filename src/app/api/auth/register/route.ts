// ============================================================================
// Auth Register API — POST (sign up)
// ============================================================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signUpSchema } from "@/validations";
import { successResponse, errorResponse } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone ?? null,
        role: "tenant",
      },
    });

    // Create a welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome!",
        message: `Welcome to Unified Property Management, ${name}! Your account has been created.`,
        type: "success",
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        userName: name,
        action: "registered",
        target: "Account",
        type: "user",
      },
    });

    return successResponse(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      201
    );
  } catch (error: unknown) {
    console.error("Register error:", error);

    // Prisma unique constraint violation (duplicate email)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Prisma connection/network errors
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error
    ) {
      const code = (error as { code: string }).code;
      // P2010, P2021, P2024, P2025: connection, table-not-found, etc.
      if (
        code === "P2010" ||
        code === "P2021" ||
        code === "P2024" ||
        code === "P2025"
      ) {
        console.error(`[REGISTER] Prisma error ${code}:`, error);
        return NextResponse.json(
          {
            success: false,
            error:
              "Database service is temporarily unavailable. Please try again later.",
          },
          { status: 503 }
        );
      }
    }

    // Generic server error
    return errorResponse("Registration failed. Please try again.", 500);
  }
}
