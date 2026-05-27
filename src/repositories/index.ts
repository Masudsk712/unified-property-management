// ============================================================================
// Repository Layer — Optimized Data-Access Wrappers over Prisma
// Uses selective field projection, pagination, and minimal includes.
// ============================================================================

import prisma from "@/lib/prisma";
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

// ── Helpers ────────────────────────────────────────────────────────────────

type Pagination = { page?: number; limit?: number };
type PaginatedResult<T> = { data: T[]; total: number; page: number; limit: number; totalPages: number };

async function paginate<T>(
  queryFn: () => Promise<T[]>,
  countFn: () => Promise<number>,
  { page = 1, limit = 20 }: Pagination
): Promise<PaginatedResult<T>> {
  const [data, total] = await Promise.all([queryFn(), countFn()]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ────────────────────────────────────────────────────────────────────────────
// Properties
// ────────────────────────────────────────────────────────────────────────────
export const propertyRepo = {
  /** Lightweight list — only fields needed for cards/lists */
  findAll(pagination?: Pagination) {
    const { page = 1, limit = 20 } = pagination ?? {};
    const select = {
      id: true, title: true, name: true, type: true, status: true,
      city: true, state: true, rent: true, bedrooms: true, bathrooms: true,
      area: true, image: true, images: true, units: true, occupiedUnits: true,
      monthlyRevenue: true, createdAt: true,
    } as const;
    const query = () =>
      prisma.property.findMany({
        select,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
    const count = () => prisma.property.count();
    return paginate(query, count, { page, limit });
  },

  /** Full detail with relations */
  findById(id: string) {
    return prisma.property.findUnique({
      where: { id },
      include: {
        tenants: { select: { id: true, unit: true, status: true, user: { select: { name: true, email: true } } } },
        maintenanceRequests: { select: { id: true, title: true, status: true, priority: true, createdAt: true }, take: 5, orderBy: { createdAt: "desc" } },
      },
    });
  },

  create(input: CreatePropertyInput) {
    return prisma.property.create({ data: input as any });
  },

  update(id: string, input: UpdatePropertyInput) {
    return prisma.property.update({ where: { id }, data: input as any });
  },

  delete(id: string) {
    return prisma.property.delete({ where: { id } });
  },

  count() {
    return prisma.property.count();
  },

  countByStatus() {
    return prisma.property.groupBy({ by: ["status"], _count: true });
  },

  countByType() {
    return prisma.property.groupBy({ by: ["type"], _count: true });
  },

  /** Optimized analytics — single aggregate query */
  async getAnalytics() {
    const [total, statusBreakdown, typeBreakdown, aggregates] = await Promise.all([
      prisma.property.count(),
      prisma.property.groupBy({ by: ["status"], _count: true, _sum: { rent: true } }),
      prisma.property.groupBy({ by: ["type"], _count: true }),
      // Use aggregate to avoid fetching all records
      prisma.property.aggregate({
        _sum: { rent: true, monthlyRevenue: true, units: true, occupiedUnits: true },
      }),
    ]);

    // City breakdown via lightweight groupBy
    const cityBreakdown = await prisma.property.groupBy({
      by: ["city"],
      _count: true,
    });

    const totalRent = aggregates._sum.rent ?? 0;
    const totalRevenue = aggregates._sum.monthlyRevenue ?? 0;
    const totalUnits = aggregates._sum.units ?? 0;
    const occupiedUnits = aggregates._sum.occupiedUnits ?? 0;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    return {
      total,
      totalRent,
      totalRevenue,
      totalUnits,
      occupiedUnits,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      statusBreakdown: statusBreakdown.map(s => ({ status: s.status, count: s._count, totalRent: s._sum.rent ?? 0 })),
      typeBreakdown: typeBreakdown.map(t => ({ type: t.type, count: t._count })),
      cityBreakdown: cityBreakdown.map(({ city, _count }) => ({ city, count: _count })),
    };
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Tenants
// ────────────────────────────────────────────────────────────────────────────
export const tenantRepo = {
  findAll(pagination?: Pagination) {
    const { page = 1, limit = 20 } = pagination ?? {};
    const select = {
      id: true, unit: true, status: true, leaseStart: true, leaseEnd: true,
      rentAmount: true, securityDeposit: true, createdAt: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      property: { select: { id: true, name: true, address: true, city: true } },
    } as const;
    const query = () =>
      prisma.tenant.findMany({
        select,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
    const count = () => prisma.tenant.count();
    return paginate(query, count, { page, limit });
  },

  findByProperty(propertyId: string) {
    return prisma.tenant.findMany({
      where: { propertyId },
      select: { id: true, unit: true, status: true, rentAmount: true, leaseEnd: true, user: { select: { name: true, email: true } } },
    });
  },

  findByUser(userId: string) {
    return prisma.tenant.findMany({
      where: { userId },
      select: { id: true, unit: true, status: true, rentAmount: true, leaseEnd: true, property: { select: { name: true, address: true } } },
    });
  },

  findById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, image: true } },
        property: { select: { id: true, name: true, address: true, city: true, state: true } },
      },
    });
  },

  create(input: CreateTenantInput) {
    return prisma.tenant.create({ data: input as any });
  },

  update(id: string, data: Partial<CreateTenantInput>) {
    return prisma.tenant.update({ where: { id }, data: data as any });
  },

  delete(id: string) {
    return prisma.tenant.delete({ where: { id } });
  },

  count() {
    return prisma.tenant.count();
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Maintenance
// ────────────────────────────────────────────────────────────────────────────
export const maintenanceRepo = {
  findAll(pagination?: Pagination) {
    const { page = 1, limit = 20 } = pagination ?? {};
    const select = {
      id: true, title: true, category: true, priority: true, status: true,
      unit: true, propertyName: true, createdAt: true, updatedAt: true,
      property: { select: { id: true, name: true } },
      assignedUser: { select: { id: true, name: true } },
    } as const;
    const query = () =>
      prisma.maintenanceRequest.findMany({
        select,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
    const count = () => prisma.maintenanceRequest.count();
    return paginate(query, count, { page, limit });
  },

  findByProperty(propertyId: string) {
    return prisma.maintenanceRequest.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true, priority: true, createdAt: true, assignedUser: { select: { name: true } } },
    });
  },

  findById(id: string) {
    return prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        property: { select: { id: true, name: true, address: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });
  },

  create(input: CreateMaintenanceInput) {
    return prisma.maintenanceRequest.create({ data: input as any });
  },

  update(id: string, data: Partial<CreateMaintenanceInput> & { resolvedAt?: Date }) {
    return prisma.maintenanceRequest.update({ where: { id }, data: data as any });
  },

  delete(id: string) {
    return prisma.maintenanceRequest.delete({ where: { id } });
  },

  countByStatus() {
    return prisma.maintenanceRequest.groupBy({ by: ["status"], _count: true });
  },

  countByCategory() {
    return prisma.maintenanceRequest.groupBy({ by: ["category"], _count: true });
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Amenities
// ────────────────────────────────────────────────────────────────────────────
export const amenityRepo = {
  findAll(pagination?: Pagination) {
    const { page = 1, limit = 20 } = pagination ?? {};
    const select = {
      id: true, name: true, type: true, status: true, capacity: true,
      openTime: true, closeTime: true, requiresBooking: true, image: true,
      property: { select: { id: true, name: true } },
    } as const;
    const query = () =>
      prisma.amenity.findMany({
        select,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
    const count = () => prisma.amenity.count();
    return paginate(query, count, { page, limit });
  },

  findByProperty(propertyId: string) {
    return prisma.amenity.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, type: true, status: true },
    });
  },

  findById(id: string) {
    return prisma.amenity.findUnique({
      where: { id },
      include: { property: { select: { id: true, name: true } } },
    });
  },

  create(input: CreateAmenityInput) {
    return prisma.amenity.create({ data: input as any });
  },

  update(id: string, data: Partial<CreateAmenityInput>) {
    return prisma.amenity.update({ where: { id }, data: data as any });
  },

  delete(id: string) {
    return prisma.amenity.delete({ where: { id } });
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Bookings
// ────────────────────────────────────────────────────────────────────────────
export const bookingRepo = {
  findAll(pagination?: Pagination) {
    const { page = 1, limit = 20 } = pagination ?? {};
    const select = {
      id: true, date: true, startTime: true, endTime: true, status: true,
      guestCount: true, propertyName: true, amenityName: true,
      property: { select: { id: true, name: true } },
      amenity: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
    } as const;
    const query = () =>
      prisma.booking.findMany({
        select,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
    const count = () => prisma.booking.count();
    return paginate(query, count, { page, limit });
  },

  findByProperty(propertyId: string) {
    return prisma.booking.findMany({
      where: { propertyId },
      orderBy: { date: "desc" },
      select: { id: true, date: true, status: true, amenityName: true, user: { select: { name: true } } },
    });
  },

  findByUser(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      select: { id: true, date: true, status: true, propertyName: true, amenityName: true },
    });
  },

  findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        property: { select: { id: true, name: true } },
        amenity: { select: { id: true, name: true, type: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

  create(input: CreateBookingInput) {
    return prisma.booking.create({ data: input as any });
  },

  update(id: string, data: Partial<CreateBookingInput>) {
    return prisma.booking.update({ where: { id }, data: data as any });
  },

  delete(id: string) {
    return prisma.booking.delete({ where: { id } });
  },

  count() {
    return prisma.booking.count();
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Payments
// ────────────────────────────────────────────────────────────────────────────
export const paymentRepo = {
  findAll(pagination?: Pagination) {
    const { page = 1, limit = 20 } = pagination ?? {};
    const select = {
      id: true, amount: true, type: true, status: true, method: true,
      dueDate: true, paidAt: true, createdAt: true,
      tenant: { select: { id: true, unit: true } },
      property: { select: { id: true, name: true } },
      user: { select: { id: true, name: true } },
    } as const;
    const query = () =>
      prisma.payment.findMany({
        select,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
    const count = () => prisma.payment.count();
    return paginate(query, count, { page, limit });
  },

  findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        tenant: { select: { id: true, unit: true } },
        property: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

  create(input: CreatePaymentInput) {
    return prisma.payment.create({ data: input as any });
  },

  update(id: string, data: Partial<CreatePaymentInput>) {
    return prisma.payment.update({ where: { id }, data: data as any });
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Notifications
// ────────────────────────────────────────────────────────────────────────────
export const notificationRepo = {
  findByUser(userId: string, limit = 50) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, title: true, message: true, type: true, read: true, link: true, createdAt: true },
    });
  },

  create(input: CreateNotificationInput) {
    return prisma.notification.create({ data: input as any });
  },

  markRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { read: true } });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },

  countUnread(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } });
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Activity Log
// ────────────────────────────────────────────────────────────────────────────
export const activityLogRepo = {
  findAll(limit = 20) {
    return prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, userId: true, userName: true, userAvatar: true, action: true, target: true, type: true, createdAt: true },
    });
  },

  create(input: CreateActivityLogInput) {
    return prisma.activityLog.create({ data: input as any });
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Dashboard Aggregate (fully optimized)
// ────────────────────────────────────────────────────────────────────────────
export const dashboardRepo = {
  async getStats(): Promise<{
    totalProperties: number;
    totalUnits: number;
    occupiedUnits: number;
    totalRevenue: number;
    activeMaintenance: number;
    totalBookings: number;
  }> {
    const [propertyCount, aggregates, maintenanceCount, bookingCount] =
      await Promise.all([
        prisma.property.count(),
        prisma.property.aggregate({
          _sum: { units: true, occupiedUnits: true, monthlyRevenue: true },
        }),
        prisma.maintenanceRequest.count({
          where: { status: { in: ["open", "in-progress"] } },
        }),
        prisma.booking.count(),
      ]);

    return {
      totalProperties: propertyCount,
      totalUnits: aggregates._sum.units ?? 0,
      occupiedUnits: aggregates._sum.occupiedUnits ?? 0,
      totalRevenue: aggregates._sum.monthlyRevenue ?? 0,
      activeMaintenance: maintenanceCount,
      totalBookings: bookingCount,
    };
  },
};