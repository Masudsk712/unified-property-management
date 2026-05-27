// ============================================================================
// Auth Service — Reusable authentication logic
// Handles register, login, logout, forgot/reset password
// ============================================================================

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// ── Types ──────────────────────────────────────────────────────────────────

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterResult {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export interface ForgotPasswordResult {
  success: boolean;
  message: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

// ── Register ───────────────────────────────────────────────────────────────

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const { name, email, password, phone } = input;
  const normalizedEmail = email.toLowerCase().trim();

  // Check for existing user
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw new Error("A user with this email already exists");
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

  // Welcome notification
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "Welcome!",
      message: `Welcome to Unified Property Management, ${name}! Your account has been created.`,
      type: "success",
    },
  });

  // Activity log
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      userName: name,
      action: "registered",
      target: "Account",
      type: "user",
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

// ── Forgot Password ────────────────────────────────────────────────────────

export async function forgotPassword(email: string): Promise<ForgotPasswordResult> {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return {
      success: true,
      message:
        "If an account with that email exists, we have sent a password reset link.",
    };
  }

  const token = uuidv4();
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  // Delete any existing tokens for this user
  await prisma.verificationToken.deleteMany({
    where: { identifier: normalizedEmail },
  });

  // Create new reset token
  await prisma.verificationToken.create({
    data: {
      identifier: normalizedEmail,
      token,
      expires,
    },
  });

  // In production: send email via nodemailer/SendGrid/etc.
  console.log(`[AUTH] Password reset token for ${normalizedEmail}: ${token}`);
  console.log(
    `[AUTH] Reset link: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`
  );

  return {
    success: true,
    message:
      "If an account with that email exists, we have sent a password reset link.",
  };
}

// ── Reset Password ─────────────────────────────────────────────────────────

export async function resetPassword(input: ResetPasswordInput): Promise<{ success: boolean; message: string }> {
  const { token, password } = input;

  // Find valid token
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    throw new Error("Invalid or expired reset token. Please request a new one.");
  }

  const user = await prisma.user.findUnique({
    where: { email: verificationToken.identifier },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Delete used token
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  // Activity log
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      userName: user.name,
      action: "reset password",
      target: "Account",
      type: "user",
    },
  });

  return {
    success: true,
    message: "Password has been reset successfully. You can now log in.",
  };
}

// ── Verify Email (optional) ────────────────────────────────────────────────

export async function verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    throw new Error("Invalid or expired verification token.");
  }

  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  return { success: true, message: "Email verified successfully." };
}