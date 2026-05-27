// ============================================================================
// Zod Validation Schemas — Unified Property Management
// Every schema mirrors the Prisma models for safe data ingestion.
// ============================================================================

import { z } from "zod";

// ── Helpers ───────────────────────────────────────────────────────────────
const optionalString = z.string().optional();
const dateLike = z.union([z.string(), z.date()]).transform((v) => new Date(v));

// ── Auth ──────────────────────────────────────────────────────────────────
export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  image: z.string().url().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

// ── Properties ────────────────────────────────────────────────────────────
export const createPropertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  name: z.string().min(2).max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000).optional().or(z.literal("")),
  type: z.enum(["apartment", "house", "condo", "commercial", "townhouse"]),
  status: z.enum(["occupied", "vacant", "maintenance", "listed"]).default("vacant"),
  address: z.string().min(5, "Address is required").max(300),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(50),
  zipCode: z.string().min(4).max(15),
  rent: z.number().min(0, "Rent must be a positive number"),
  securityDeposit: z.number().min(0).default(0),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  area: z.number().min(0).optional(),
  squareFeet: z.number().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  image: optionalString,
  units: z.number().int().min(0).default(0),
  occupiedUnits: z.number().int().min(0).default(0),
  monthlyRevenue: z.number().min(0).default(0),
  yearBuilt: z.number().int().optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

// ── Tenants ───────────────────────────────────────────────────────────────
export const createTenantSchema = z.object({
  userId: z.string().min(1),
  propertyId: z.string().min(1),
  unit: z.string().min(1).max(20),
  leaseStart: dateLike,
  leaseEnd: dateLike,
  rentAmount: z.number().min(0),
  securityDeposit: z.number().min(0).default(0),
  status: z.enum(["active", "pending", "expired", "evicted"]).default("active"),
});

export const updateTenantSchema = createTenantSchema.partial();

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

// ── Maintenance ───────────────────────────────────────────────────────────
export const createMaintenanceSchema = z.object({
  propertyId: z.string().min(1),
  propertyName: z.string().min(1),
  unit: z.string().min(1),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  category: z.enum(["plumbing", "electrical", "hvac", "structural", "appliance", "pest", "other"]).default("other"),
  priority: z.enum(["low", "medium", "high", "emergency"]).default("medium"),
  status: z.enum(["open", "in-progress", "resolved", "closed"]).default("open"),
  assignedTo: z.string().optional(),
  requestedBy: z.string().min(1),
  cost: z.number().min(0).optional(),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial().extend({
  resolvedAt: dateLike.optional(),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;

// ── Amenities ─────────────────────────────────────────────────────────────
export const createAmenitySchema = z.object({
  propertyId: z.string().min(1),
  name: z.string().min(2).max(200),
  type: z.enum(["gym", "pool", "clubhouse", "bbq", "playground", "parking", "rooftop", "lounge", "other"]).default("other"),
  description: optionalString,
  capacity: z.number().int().min(0).default(0),
  openTime: z.string().default("06:00"),
  closeTime: z.string().default("22:00"),
  requiresBooking: z.boolean().default(false),
  image: optionalString,
  status: z.enum(["available", "maintenance", "closed"]).default("available"),
});

export const updateAmenitySchema = createAmenitySchema.partial();

export type CreateAmenityInput = z.infer<typeof createAmenitySchema>;

// ── Bookings ──────────────────────────────────────────────────────────────
export const createBookingSchema = z.object({
  propertyId: z.string().min(1),
  propertyName: z.string().min(1),
  amenityId: z.string().min(1),
  amenityName: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1),
  date: dateLike,
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  status: z.enum(["confirmed", "pending", "cancelled", "completed"]).default("pending"),
  guestCount: z.number().int().min(1).optional(),
  notes: optionalString,
});

export const updateBookingSchema = createBookingSchema.partial();

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ── Payments ──────────────────────────────────────────────────────────────
export const createPaymentSchema = z.object({
  tenantId: z.string().min(1),
  propertyId: z.string().min(1),
  userId: z.string().min(1),
  amount: z.number().min(0),
  type: z.enum(["rent", "deposit", "fee", "refund"]).default("rent"),
  status: z.enum(["pending", "completed", "failed", "refunded"]).default("pending"),
  method: z.enum(["bank_transfer", "credit_card", "cash", "check"]).default("bank_transfer"),
  dueDate: dateLike.optional(),
  paidAt: dateLike.optional(),
  description: optionalString,
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

// ── Notifications ─────────────────────────────────────────────────────────
export const createNotificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(2).max(200),
  message: z.string().min(1).max(2000),
  type: z.enum(["info", "warning", "success", "error"]).default("info"),
  read: z.boolean().default(false),
  link: optionalString,
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

// ── Activity ──────────────────────────────────────────────────────────────
export const createActivityLogSchema = z.object({
  userId: z.string().min(1),
  userName: z.string().min(1),
  userAvatar: optionalString,
  action: z.string().min(1).max(300),
  target: z.string().min(1).max(300),
  type: z.enum(["booking", "maintenance", "property", "payment", "user", "system"]).default("system"),
});

export type CreateActivityLogInput = z.infer<typeof createActivityLogSchema>;