// ============================================================================
// Environment Variable Validation — Production-Safe Configuration
// Validates required env vars at startup and provides typed access.
// ============================================================================

const requiredVars = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const;

const optionalVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "AUTH_GITHUB_ID",
  "AUTH_GITHUB_SECRET",
] as const;

interface EnvConfig {
  DATABASE_URL: string;
  AUTH_SECRET: string;
  AUTH_URL: string;
  NEXT_PUBLIC_APP_URL: string;
  NODE_ENV: "development" | "production" | "test";
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  PORT: string;
}

/**
 * Validates required environment variables and warns about missing optional ones.
 * Call this early in the app lifecycle (e.g., instrumentation.ts or server.ts).
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const key of requiredVars) {
    if (!process.env[key]) {
      missing.push(key);
      console.error(`[ENV] Missing required environment variable: ${key}`);
    }
  }

  for (const key of optionalVars) {
    if (!process.env[key]) {
      console.warn(`[ENV] Optional environment variable not set: ${key}`);
    }
  }

  return { valid: missing.length === 0, missing };
}

/**
 * Get a typed environment variable with a fallback.
 */
export function getEnv(key: keyof EnvConfig, fallback?: string): string {
  const value = process.env[key];
  if (value !== undefined && value !== "") return value;
  if (fallback !== undefined) return fallback;

  if (requiredVars.includes(key as (typeof requiredVars)[number])) {
    throw new Error(
      `[ENV] Required environment variable "${key}" is not set. ` +
        "Check your .env file or Vercel environment variables."
    );
  }

  return "";
}

/**
 * Environment-aware helpers.
 */
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_DEVELOPMENT =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";
export const IS_VERCEL = !!process.env.VERCEL;
export const IS_EDGE = process.env.NEXT_RUNTIME === "edge";