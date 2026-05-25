// ============================================================================
// Unified Property Management — TypeScript Type Definitions
// MongoDB-compatible: all IDs are strings (ObjectId serialized).
// ============================================================================

// ── Auth ──────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "manager" | "tenant";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: Date | null;
  password?: string | null;
  image?: string | null;
  phone?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
}

// ── Properties ────────────────────────────────────────────────────────────
export type PropertyType = "apartment" | "house" | "condo" | "commercial" | "townhouse";
export type PropertyStatus = "occupied" | "vacant" | "maintenance" | "listed";

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: PropertyType;
  status: PropertyStatus;
  units: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  image?: string | null;
  description?: string | null;
  amenities: string[];
  yearBuilt?: number | null;
  squareFeet?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Tenants ───────────────────────────────────────────────────────────────
export type TenantStatus = "active" | "pending" | "expired" | "evicted";

export interface Tenant {
  id: string;
  userId: string;
  propertyId: string;
  unit: string;
  leaseStart: Date;
  leaseEnd: Date;
  rentAmount: number;
  securityDeposit: number;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  property?: Property;
}

// ── Maintenance ───────────────────────────────────────────────────────────
export type MaintenanceCategory = "plumbing" | "electrical" | "hvac" | "structural" | "appliance" | "pest" | "other";
export type MaintenancePriority = "low" | "medium" | "high" | "emergency";
export type MaintenanceStatus = "open" | "in-progress" | "resolved" | "closed";

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  propertyName: string;
  unit: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedTo?: string | null;
  requestedBy: string;
  cost?: number | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date | null;
  property?: Property;
  assignedUser?: User | null;
}

// ── Amenities ─────────────────────────────────────────────────────────────
export type AmenityType = "gym" | "pool" | "clubhouse" | "bbq" | "playground" | "parking" | "rooftop" | "lounge" | "other";
export type AmenityStatus = "available" | "maintenance" | "closed";

export interface Amenity {
  id: string;
  propertyId: string;
  name: string;
  type: AmenityType;
  description?: string | null;
  capacity: number;
  openTime: string;
  closeTime: string;
  requiresBooking: boolean;
  image?: string | null;
  status: AmenityStatus;
  createdAt: Date;
  updatedAt: Date;
  property?: Property;
}

// ── Bookings ──────────────────────────────────────────────────────────────
export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";

export interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  amenityId: string;
  amenityName: string;
  userId: string;
  userName: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  guestCount?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  property?: Property;
  amenity?: Amenity;
  user?: User;
}

// ── Payments ──────────────────────────────────────────────────────────────
export type PaymentType = "rent" | "deposit" | "fee" | "refund";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type PaymentMethod = "bank_transfer" | "credit_card" | "cash" | "check";

export interface Payment {
  id: string;
  tenantId: string;
  propertyId: string;
  userId: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  method: PaymentMethod;
  dueDate?: Date | null;
  paidAt?: Date | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Notifications ─────────────────────────────────────────────────────────
export type NotificationType = "info" | "warning" | "success" | "error";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string | null;
  createdAt: Date;
}

// ── Activity Log ──────────────────────────────────────────────────────────
export type ActivityType = "booking" | "maintenance" | "property" | "payment" | "user" | "system";

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  action: string;
  target: string;
  type: ActivityType;
  createdAt: Date;
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalProperties: number;
  totalUnits: number;
  occupancyRate: number;
  totalRevenue: number;
  revenueChange: number;
  occupancyChange: number;
  activeMaintenanceRequests: number;
  maintenanceChange: number;
  totalBookings: number;
  bookingChange: number;
  monthlyRevenue: { month: string; revenue: number }[];
  occupancyTrend: { month: string; rate: number }[];
  maintenanceByCategory: { category: string; count: number }[];
  revenueByProperty: { property: string; revenue: number }[];
}

// ── Navigation ────────────────────────────────────────────────────────────
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  children?: NavItem[];
}

// ── API Responses ─────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}