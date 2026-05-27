// ============================================================================
// Socket.IO Event Architecture — Type-safe event definitions
// ============================================================================

import type {
  MaintenanceRequest,
  Booking,
  Notification,
  ActivityLog,
  DashboardStats,
  UserRole,
} from "@/types";

// ── Event name constants ───────────────────────────────────────────────────
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: "connect",
  DISCONNECT: "disconnect",

  // Room management
  JOIN_ROLE_ROOM: "join:role",
  LEAVE_ROLE_ROOM: "leave:role",

  // Maintenance events
  MAINTENANCE_CREATED: "maintenance:created",
  MAINTENANCE_UPDATED: "maintenance:updated",
  MAINTENANCE_RESOLVED: "maintenance:resolved",

  // Booking events
  BOOKING_CREATED: "booking:created",
  BOOKING_UPDATED: "booking:updated",
  BOOKING_CANCELLED: "booking:cancelled",

  // Notification events
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_MARK_READ: "notification:mark-read",

  // Dashboard events
  DASHBOARD_REFRESH: "dashboard:refresh",

  // Activity feed events
  ACTIVITY_NEW: "activity:new",

  // Payment events
  PAYMENT_COMPLETED: "payment:completed",
  PAYMENT_FAILED: "payment:failed",
} as const;

// ── Event payload types ────────────────────────────────────────────────────
export interface ServerToClientEvents {
  [SOCKET_EVENTS.MAINTENANCE_CREATED]: (data: MaintenanceRequest) => void;
  [SOCKET_EVENTS.MAINTENANCE_UPDATED]: (data: MaintenanceRequest) => void;
  [SOCKET_EVENTS.MAINTENANCE_RESOLVED]: (data: MaintenanceRequest) => void;
  [SOCKET_EVENTS.BOOKING_CREATED]: (data: Booking) => void;
  [SOCKET_EVENTS.BOOKING_UPDATED]: (data: Booking) => void;
  [SOCKET_EVENTS.BOOKING_CANCELLED]: (data: Booking) => void;
  [SOCKET_EVENTS.NOTIFICATION_NEW]: (data: Notification) => void;
  [SOCKET_EVENTS.DASHBOARD_REFRESH]: (data: DashboardStats) => void;
  [SOCKET_EVENTS.ACTIVITY_NEW]: (data: ActivityLog) => void;
  [SOCKET_EVENTS.PAYMENT_COMPLETED]: (data: { paymentId: string; tenantId: string; amount: number }) => void;
  [SOCKET_EVENTS.PAYMENT_FAILED]: (data: { paymentId: string; tenantId: string; reason: string }) => void;
}

export interface ClientToServerEvents {
  [SOCKET_EVENTS.JOIN_ROLE_ROOM]: (role: UserRole) => void;
  [SOCKET_EVENTS.LEAVE_ROLE_ROOM]: (role: UserRole) => void;
}

// ── Role-based room names ──────────────────────────────────────────────────
export const ROLE_ROOMS: Record<UserRole, string> = {
  admin: "room:admin",
  manager: "room:manager",
  tenant: "room:tenant",
};

// ── Broadcast target helpers ───────────────────────────────────────────────
export type BroadcastTarget = "all" | UserRole | UserRole[];