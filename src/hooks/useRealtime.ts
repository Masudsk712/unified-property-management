// ============================================================================
// useRealtime — High-level real-time hooks
// Bridges Socket.IO events → Zustand store / React Query cache invalidation
// ============================================================================

"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSocket } from "./useSocket";
import { useNotificationStore } from "@/store";
import { SOCKET_EVENTS } from "@/lib/socket-types";
import type {
  MaintenanceRequest,
  Booking,
  Notification,
  ActivityLog,
  DashboardStats,
} from "@/types";

// ── useRealtimeNotifications — Listens for new notifications, updates store ─
export function useRealtimeNotifications() {
  const { subscribe, isConnected } = useSocket();
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!isConnected) return;

    const unsub = subscribe(SOCKET_EVENTS.NOTIFICATION_NEW, (notification: Notification) => {
      addNotification(notification);

      // Show toast for incoming notifications
      toast(notification.title, {
        description: notification.message,
        action: notification.link
          ? {
              label: "View",
              onClick: () => {
                window.location.href = notification.link!;
              },
            }
          : undefined,
      });
    });

    return unsub;
  }, [subscribe, isConnected, addNotification]);
}

// ── useRealtimeMaintenance — Listens for maintenance updates ───────────────
export function useRealtimeMaintenance() {
  const { subscribe, isConnected } = useSocket();
  const qc = useQueryClient();

  useEffect(() => {
    if (!isConnected) return;

    const unsubs = [
      subscribe(SOCKET_EVENTS.MAINTENANCE_CREATED, (data: MaintenanceRequest) => {
        qc.invalidateQueries({ queryKey: ["maintenance"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        toast.info("New maintenance request", {
          description: `${data.title} — ${data.unit}`,
        });
      }),

      subscribe(SOCKET_EVENTS.MAINTENANCE_UPDATED, (data: MaintenanceRequest) => {
        qc.invalidateQueries({ queryKey: ["maintenance"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        toast.info("Maintenance request updated", {
          description: `${data.title} → ${data.status.replace("-", " ")}`,
        });
      }),

      subscribe(SOCKET_EVENTS.MAINTENANCE_RESOLVED, (data: MaintenanceRequest) => {
        qc.invalidateQueries({ queryKey: ["maintenance"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        toast.success("Maintenance resolved", {
          description: data.title,
        });
      }),
    ];

    return () => unsubs.forEach((fn) => fn());
  }, [subscribe, isConnected, qc]);
}

// ── useRealtimeBookings — Listens for booking status changes ───────────────
export function useRealtimeBookings() {
  const { subscribe, isConnected } = useSocket();
  const qc = useQueryClient();

  useEffect(() => {
    if (!isConnected) return;

    const unsubs = [
      subscribe(SOCKET_EVENTS.BOOKING_CREATED, (data: Booking) => {
        qc.invalidateQueries({ queryKey: ["bookings"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        toast.info("New booking created", {
          description: `${data.amenityName} by ${data.userName}`,
        });
      }),

      subscribe(SOCKET_EVENTS.BOOKING_UPDATED, (data: Booking) => {
        qc.invalidateQueries({ queryKey: ["bookings"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        toast.info("Booking updated", {
          description: `${data.amenityName} → ${data.status}`,
        });
      }),

      subscribe(SOCKET_EVENTS.BOOKING_CANCELLED, (data: Booking) => {
        qc.invalidateQueries({ queryKey: ["bookings"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        toast.warning("Booking cancelled", {
          description: `${data.amenityName} by ${data.userName}`,
        });
      }),
    ];

    return () => unsubs.forEach((fn) => fn());
  }, [subscribe, isConnected, qc]);
}

// ── useRealtimeDashboard — Listens for dashboard refresh signals ──────────
export function useRealtimeDashboard() {
  const { subscribe, isConnected } = useSocket();
  const qc = useQueryClient();

  useEffect(() => {
    if (!isConnected) return;

    const unsub = subscribe(SOCKET_EVENTS.DASHBOARD_REFRESH, (_data: DashboardStats) => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    });

    return unsub;
  }, [subscribe, isConnected, qc]);
}

// ── useRealtimeActivity — Listens for new activity log entries ────────────
export function useRealtimeActivity(
  onNewActivity?: (activity: ActivityLog) => void
) {
  const { subscribe, isConnected } = useSocket();
  const qc = useQueryClient();
  const callbackRef = useRef(onNewActivity);
  callbackRef.current = onNewActivity;

  useEffect(() => {
    if (!isConnected) return;

    const unsub = subscribe(SOCKET_EVENTS.ACTIVITY_NEW, (activity: ActivityLog) => {
      // Invalidate activity cache
      qc.invalidateQueries({ queryKey: ["activity"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });

      // Call user-provided callback
      callbackRef.current?.(activity);
    });

    return unsub;
  }, [subscribe, isConnected, qc]);
}

// ── useRealtimePayments — Listens for payment events ──────────────────────
export function useRealtimePayments() {
  const { subscribe, isConnected } = useSocket();
  const qc = useQueryClient();

  useEffect(() => {
    if (!isConnected) return;

    const unsubs = [
      subscribe(SOCKET_EVENTS.PAYMENT_COMPLETED, (data) => {
        qc.invalidateQueries({ queryKey: ["payments"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        toast.success("Payment completed", {
          description: `$${data.amount.toLocaleString()} received`,
        });
      }),

      subscribe(SOCKET_EVENTS.PAYMENT_FAILED, (data) => {
        qc.invalidateQueries({ queryKey: ["payments"] });
        toast.error("Payment failed", {
          description: data.reason,
        });
      }),
    ];

    return () => unsubs.forEach((fn) => fn());
  }, [subscribe, isConnected, qc]);
}

// ── Master hook — subscribe to all real-time streams at once ───────────────
export function useAllRealtime() {
  useRealtimeNotifications();
  useRealtimeMaintenance();
  useRealtimeBookings();
  useRealtimeDashboard();
  useRealtimePayments();
}