// ============================================================================
// Environment Validation Script — Pre-deployment Check
// Validates that all required environment variables are set correctly.
// Usage: npx tsx scripts/validate-env.ts
// ============================================================================

import { config } from "dotenv";
import { resolve } from "path";

// Load .env file
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

const REQUIRED_VARS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const;

const OPTIONAL_VARS = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "AUTH_GITHUB_ID",
  "AUTH_GITHUB_SECRET",
] as const;

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

function validate(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: [],
  };

  const env = process.env.NODE_ENV || "development";
  result.info.push(`Environment: ${env}`);

  // ── Check required variables ──────────────────────────────────────────
  for (const key of REQUIRED_VARS) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      result.errors.push(`❌ Missing required: ${key}`);
      result.valid = false;
    } else {
      result.info.push(`✓ ${key} is set`);
    }
  }

  // ── Validate DATABASE_URL format ─────────────────────────────────────
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    if (dbUrl.startsWith("mongodb+srv://")) {
      result.info.push("✓ DATABASE_URL uses MongoDB Atlas (SRV) format");
      if (dbUrl.includes("<password>") || dbUrl.includes("<username>")) {
        result.errors.push(
          "❌ DATABASE_URL contains placeholder values (<username> or <password>). Replace them with actual credentials."
        );
        result.valid = false;
      }
    } else if (dbUrl.startsWith("mongodb://")) {
      result.warnings.push(
        "⚠ DATABASE_URL uses direct connection (mongodb://). For production, use mongodb+srv:// with MongoDB Atlas."
      );
    } else {
      result.errors.push(
        "❌ DATABASE_URL doesn't appear to be a valid MongoDB connection string."
      );
      result.valid = false;
    }
  }

  // ── Validate AUTH_SECRET length ──────────────────────────────────────
  const authSecret = process.env.AUTH_SECRET;
  if (authSecret) {
    if (authSecret.length < 32) {
      result.errors.push(
        `❌ AUTH_SECRET is too short (${authSecret.length} chars). Use at least 64 characters (32 bytes hex). Generate: openssl rand -hex 32`
      );
      result.valid = false;
    }
    if (authSecret === "a8f3d5e7b2c4f1e9d6a3c5b7e9f2d4a7") {
      result.warnings.push(
        "⚠ AUTH_SECRET appears to be the default development secret. Generate a unique one for production."
      );
    }
  }

  // ── Validate NEXT_PUBLIC_APP_URL ─────────────────────────────────────
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    if (env === "production" && appUrl.includes("localhost")) {
      result.warnings.push(
        "⚠ NEXT_PUBLIC_APP_URL is set to localhost in production mode. Update to your actual domain."
      );
    }
    try {
      new URL(appUrl);
      result.info.push(`✓ NEXT_PUBLIC_APP_URL is a valid URL: ${appUrl}`);
    } catch {
      result.errors.push("❌ NEXT_PUBLIC_APP_URL is not a valid URL.");
      result.valid = false;
    }
  }

  // ── Check optional variables ─────────────────────────────────────────
  let missingOptionals = 0;
  for (const key of OPTIONAL_VARS) {
    if (!process.env[key] || process.env[key]!.trim() === "") {
      missingOptionals++;
    } else {
      result.info.push(`✓ ${key} is set`);
    }
  }
  if (missingOptionals > 0) {
    result.warnings.push(
      `⚠ ${missingOptionals} optional variable(s) not set. Some features may be unavailable.`
    );
  }

  // ── Production-specific checks ───────────────────────────────────────
  if (env === "production") {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      result.warnings.push(
        "⚠ CLOUDINARY_CLOUD_NAME not set. Image uploads will fail in production."
      );
    }
    if (!process.env.CLOUDINARY_API_KEY) {
      result.warnings.push(
        "⚠ CLOUDINARY_API_KEY not set. Image uploads will fail in production."
      );
    }
    if (!process.env.CLOUDINARY_API_SECRET) {
      result.warnings.push(
        "⚠ CLOUDINARY_API_SECRET not set. Image uploads will fail in production."
      );
    }
  }

  return result;
}

// ── Run Validation ─────────────────────────────────────────────────────────
console.log("============================================");
console.log("  Environment Variable Validation");
console.log("============================================\n");

const result = validate();

if (result.info.length > 0) {
  console.log("Info:");
  result.info.forEach((msg) => console.log(`  ${msg}`));
  console.log();
}

if (result.warnings.length > 0) {
  console.log("Warnings:");
  result.warnings.forEach((msg) => console.log(`  ${msg}`));
  console.log();
}

if (result.errors.length > 0) {
  console.log("Errors:");
  result.errors.forEach((msg) => console.log(`  ${msg}`));
  console.log();
}

console.log("============================================");
if (result.valid) {
  console.log("  ✅ Validation passed!");
} else {
  console.log("  ❌ Validation failed! Fix the errors above.");
}
console.log("============================================");

process.exit(result.valid ? 0 : 1);