// ============================================================================
// Service Layer — Business logic between repositories and API routes
// ============================================================================

import {
  propertyRepo,
  tenantRepo,
  maintenanceRepo,
  amenityRepo,
  bookingRepo,
  paymentRepo,
  notificationRepo,
  activityLogRepo,
  dashboardRepo,
} from "@/repositories";
import { ApiResponse } from "@/types";
import type {
  CreatePropertyInput,
  UpdatePropertyInput,
  CreateTenantInput,
  CreateMaintenanceInput,
  CreateAmenityInput,
  CreateBookingInput,
  CreatePaymentInput,
  CreateNotificationInput,
  CreateActivityLogInput,
} from "@/validations";

// ── Pagination type ────────────────────────────────────────────────────────
export type Pagination = { page?: number; limit?: number };

// ── Generic error wrapper ─────────────────────────────────────────────────
async function wrap<T>(fn: () => Promise<T>): Promise<ApiResponse<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return { success: false, error: message };
  }
}

// ── Properties ────────────────────────────────────────────────────────────
export const propertyService = {
  async getAll(pagination?: Pagination): Promise<ApiResponse<unknown>> {
    return wrap(() => propertyRepo.findAll(pagination));
  },
  async getById(id: string): Promise<ApiResponse<unknown>> {
    return wrap(async () => {
      const prop = await propertyRepo.findById(id);
      if (!prop) throw new Error("Property not found");
      return prop;
    });
  },
  async getAnalytics(): Promise<ApiResponse<unknown>> {
    return wrap(() => propertyRepo.getAnalytics());
  },
  async create(input: CreatePropertyInput): Promise<ApiResponse<unknown>> {
    return wrap(() => propertyRepo.create(input));
  },
  async update(id: string, input: UpdatePropertyInput): Promise<ApiResponse<unknown>> {
    return wrap(() => propertyRepo.update(id, input));
  },
  async delete(id: string): Promise<ApiResponse<unknown>> {
    return wrap(() => propertyRepo.delete(id));
  },
};

// ── Tenants ───────────────────────────────────────────────────────────────
export const tenantService = {
  async getAll(pagination?: Pagination): Promise<ApiResponse<unknown>> {
    return wrap(() => tenantRepo.findAll(pagination));
  },
  async getById(id: string): Promise<ApiResponse<unknown>> {
    return wrap(async () => {
      const t = await tenantRepo.findById(id);
      if (!t) throw new Error("Tenant not found");
      return t;
    });
  },
  async create(input: CreateTenantInput): Promise<ApiResponse<unknown>> {
    return wrap(() => tenantRepo.create(input));
  },
  async update(id: string, data: Partial<CreateTenantInput>): Promise<ApiResponse<unknown>> {
    return wrap(() => tenantRepo.update(id, data));
  },
  async delete(id: string): Promise<ApiResponse<unknown>> {
    return wrap(() => tenantRepo.delete(id));
  },
};

// ── Maintenance ───────────────────────────────────────────────────────────
export const maintenanceService = {
  async getAll(pagination?: Pagination): Promise<ApiResponse<unknown>> {
    return wrap(() => maintenanceRepo.findAll(pagination));
  },
  async getById(id: string): Promise<ApiResponse<unknown>> {
    return wrap(async () => {
      const m = await maintenanceRepo.findById(id);
      if (!m) throw new Error("Maintenance request not found");
      return m;
    });
  },
  async create(input: CreateMaintenanceInput): Promise<ApiResponse<unknown>> {
    return wrap(() => maintenanceRepo.create(input));
  },
  async update(
    id: string,
    data: Partial<CreateMaintenanceInput> & { resolvedAt?: Date }
  ): Promise<ApiResponse<unknown>> {
    return wrap(() => maintenanceRepo.update(id, data));
  },
  async delete(id: string): Promise<ApiResponse<unknown>> {
    return wrap(() => maintenanceRepo.delete(id));
  },
};

// ── Amenities ─────────────────────────────────────────────────────────────
export const amenityService = {
  async getAll(pagination?: Pagination): Promise<ApiResponse<unknown>> {
    return wrap(() => amenityRepo.findAll(pagination));
  },
  async getById(id: string): Promise<ApiResponse<unknown>> {
    return wrap(async () => {
      const a = await amenityRepo.findById(id);
      if (!a) throw new Error("Amenity not found");
      return a;
    });
  },
  async create(input: CreateAmenityInput): Promise<ApiResponse<unknown>> {
    return wrap(() => amenityRepo.create(input));
  },
  async update(id: string, data: Partial<CreateAmenityInput>): Promise<ApiResponse<unknown>> {
    return wrap(() => amenityRepo.update(id, data));
  },
  async delete(id: string): Promise<ApiResponse<unknown>> {
    return wrap(() => amenityRepo.delete(id));
  },
};

// ── Bookings ──────────────────────────────────────────────────────────────
export const bookingService = {
  async getAll(pagination?: Pagination): Promise<ApiResponse<unknown>> {
    return wrap(() => bookingRepo.findAll(pagination));
  },
  async getById(id: string): Promise<ApiResponse<unknown>> {
    return wrap(async () => {
      const b = await bookingRepo.findById(id);
      if (!b) throw new Error("Booking not found");
      return b;
    });
  },
  async create(input: CreateBookingInput): Promise<ApiResponse<unknown>> {
    return wrap(() => bookingRepo.create(input));
  },
  async update(id: string, data: Partial<CreateBookingInput>): Promise<ApiResponse<unknown>> {
    return wrap(() => bookingRepo.update(id, data));
  },
  async delete(id: string): Promise<ApiResponse<unknown>> {
    return wrap(() => bookingRepo.delete(id));
  },
};

// ── Payments ──────────────────────────────────────────────────────────────
export const paymentService = {
  async getAll(pagination?: Pagination): Promise<ApiResponse<unknown>> {
    return wrap(() => paymentRepo.findAll(pagination));
  },
  async getById(id: string): Promise<ApiResponse<unknown>> {
    return wrap(async () => {
      const p = await paymentRepo.findById(id);
      if (!p) throw new Error("Payment not found");
      return p;
    });
  },
  async create(input: CreatePaymentInput): Promise<ApiResponse<unknown>> {
    return wrap(() => paymentRepo.create(input));
  },
};

// ── Notifications ─────────────────────────────────────────────────────────
export const notificationService = {
  async getByUser(userId: string): Promise<ApiResponse<unknown>> {
    return wrap(() => notificationRepo.findByUser(userId));
  },
  async create(input: CreateNotificationInput): Promise<ApiResponse<unknown>> {
    return wrap(() => notificationRepo.create(input));
  },
  async markRead(id: string): Promise<ApiResponse<unknown>> {
    return wrap(() => notificationRepo.markRead(id));
  },
  async markAllRead(userId: string): Promise<ApiResponse<unknown>> {
    return wrap(() => notificationRepo.markAllRead(userId));
  },
  async unreadCount(userId: string): Promise<ApiResponse<unknown>> {
    return wrap(() => notificationRepo.countUnread(userId));
  },
};

// ── Activity ──────────────────────────────────────────────────────────────
export const activityService = {
  async getAll(limit?: number): Promise<ApiResponse<unknown>> {
    return wrap(() => activityLogRepo.findAll(limit));
  },
  async create(input: CreateActivityLogInput): Promise<ApiResponse<unknown>> {
    return wrap(() => activityLogRepo.create(input));
  },
};

// ── Dashboard ─────────────────────────────────────────────────────────────
export const dashboardService = {
  async getStats(): Promise<ApiResponse<unknown>> {
    return wrap(() => dashboardRepo.getStats());
  },
};