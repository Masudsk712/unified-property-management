// ============================================================================
// Auth Helpers — Role-based access control & session utilities
// ============================================================================

import { auth } from "@/lib/auth";
import { UserRole } from "@/types";
import { NextResponse } from "next/server";

/**
 * Get the current session or throw if unauthenticated.
 */
export async function getSessionOrThrow() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Get the current user role from session.
 */
export async function getUserRole(): Promise<UserRole | null> {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((session?.user as any)?.role as UserRole) ?? null;
}

/**
 * Check if the current user has one of the allowed roles.
 */
export async function requireRole(
  ...roles: UserRole[]
): Promise<void> {
  const role = await getUserRole();
  if (!role || !roles.includes(role)) {
    throw new Error("Forbidden: insufficient permissions");
  }
}

/**
 * Standardized unauthorized response.
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}

/**
 * Standardized forbidden response.
 */
export function forbiddenResponse() {
  return NextResponse.json(
    { success: false, error: "Forbidden: insufficient permissions" },
    { status: 403 }
  );
}

/**
 * Standardized not-found response.
 */
export function notFoundResponse(entity = "Resource") {
  return NextResponse.json(
    { success: false, error: `${entity} not found` },
    { status: 404 }
  );
}

/**
 * Standardized success response.
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Standardized error response.
 */
export function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}