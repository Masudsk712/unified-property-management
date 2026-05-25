// ============================================================================
// Repository Layer — Thin Data-Access Wrappers over Prisma
// Each function returns a plain query; services add business logic.
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

// ────────────────────────────────────────────────────────────────────────────
// Properties
// ────────────────────────────────────────────────────────────────────────────
export const propertyRepo = {
  findAll() {
    return prisma.property.findMany({ orderBy: { createdAt: "desc" } });
  },
  findById(id: string) {
    return prisma.property.findUnique({
      where: { id },
      include: { tenants: true, maintenanceRequests: true },
    });
  },
  create(input: CreatePropertyInput) {
    return prisma.property.create({ data: input });
  },
  update(id: string, input: UpdatePropertyInput) {
    return prisma.property.update({ where: { id }, data: input });
  },
  delete(id: string) {
    return prisma.property.delete({ where: { id } });
  },
  count() {
    return prisma.property.count();
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Tenants
// ────────────────────────────────────────────────────────────────────────────
export const tenantRepo = {
  findAll() {
    return prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true, property: true },
    });
  },
  findByProperty(propertyId: string) {
    return prisma.tenant.findMany({
      where: { propertyId },
      include: { user: true },
    });
  },
  findByUser(userId: string) {
    return prisma.tenant.findMany({
      where: { userId },
      include: { property: true },
    });
  },
  findById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
      include: { user: true, property: true },
    });
  },
  create(input: CreateTenantInput) {
    return prisma.tenant.create({ data: input });
  },
  update(id: string, data: Partial<CreateTenantInput>) {
    return prisma.tenant.update({ where: { id }, data });
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
  findAll() {
    return prisma.maintenanceRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { property: true, assignedUser: true },
    });
  },
  findByProperty(propertyId: string) {
    return prisma.maintenanceRequest.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
      include: { assignedUser: true },
    });
  },
  findById(id: string) {
    return prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { property: true, assignedUser: true },
    });
  },
  create(input: CreateMaintenanceInput) {
    return prisma.maintenanceRequest.create({ data: input });
  },
  update(id: string, data: Partial<CreateMaintenanceInput> & { resolvedAt?: Date }) {
    return prisma.maintenanceRequest.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.maintenanceRequest.delete({ where: { id } });
  },
  countByStatus() {
    return prisma.maintenanceRequest.groupBy({
      by: ["status"],
      _count: true,
    });
  },
  countByCategory() {
    return prisma.maintenanceRequest.groupBy({
      by: ["category"],
      _count: true,
    });
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Amenities
// ────────────────────────────────────────────────────────────────────────────
export const amenityRepo = {
  findAll() {
    return prisma.amenity.findMany({
      orderBy: { createdAt: "desc" },
      include: { property: true },
    });
  },
  findByProperty(propertyId: string) {
    return prisma.amenity.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
    });
  },
  findById(id: string) {
    return prisma.amenity.findUnique({
      where: { id },
      include: { property: true },
    });
  },
  create(input: CreateAmenityInput) {
    return prisma.amenity.create({ data: input });
  },
  update(id: string, data: Partial<CreateAmenityInput>) {
    return prisma.amenity.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.amenity.delete({ where: { id } });
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Bookings
// ────────────────────────────────────────────────────────────────────────────
export const bookingRepo = {
  findAll() {
    return prisma.booking.findMany({
      orderBy: { date: "desc" },
      include: { property: true, amenity: true, user: true },
    });
  },
  findByProperty(propertyId: string) {
    return prisma.booking.findMany({
      where: { propertyId },
      orderBy: { date: "desc" },
      include: { amenity: true, user: true },
    });
  },
  findByUser(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      include: { property: true, amenity: true },
    });
  },
  findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: { property: true, amenity: true, user: true },
    });
  },
  create(input: CreateBookingInput) {
    return prisma.booking.create({ data: input });
  },
  update(id: string, data: Partial<CreateBookingInput>) {
    return prisma.booking.update({ where: { id }, data });
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
  findAll() {
    return prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: { tenant: true, property: true, user: true },
    });
  },
  findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: { tenant: true, property: true, user: true },
    });
  },
  create(input: CreatePaymentInput) {
    return prisma.payment.create({ data: input });
  },
  update(id: string, data: Partial<CreatePaymentInput>) {
    return prisma.payment.update({ where: { id }, data });
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Notifications
// ────────────────────────────────────────────────────────────────────────────
export const notificationRepo = {
  findByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },
  create(input: CreateNotificationInput) {
    return prisma.notification.create({ data: input });
  },
  markRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  },
  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },
  countUnread(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
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
    });
  },
  create(input: CreateActivityLogInput) {
    return prisma.activityLog.create({ data: input });
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Dashboard Aggregate
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
    const [propertyCount, properties, maintenanceCount, bookingCount] =
      await Promise.all([
        prisma.property.count(),
        prisma.property.findMany({
          select: { units: true, occupiedUnits: true, monthlyRevenue: true },
        }),
        prisma.maintenanceRequest.count({
          where: { status: { in: ["open", "in-progress"] } },
        }),
        prisma.booking.count(),
      ]);

    const agg = properties as { units: number; occupiedUnits: number; monthlyRevenue: number }[];

    return {
      totalProperties: propertyCount,
      totalUnits: agg.reduce((s, p) => s + p.units, 0),
      occupiedUnits: agg.reduce((s, p) => s + p.occupiedUnits, 0),
      totalRevenue: agg.reduce((s, p) => s + p.monthlyRevenue, 0),
      activeMaintenance: maintenanceCount,
      totalBookings: bookingCount,
    };
  },
};