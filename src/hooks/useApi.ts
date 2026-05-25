// ============================================================================
// Reusable Data-Fetching Hooks — TanStack Query wrappers for all entities
// ============================================================================

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Property,
  Tenant,
  MaintenanceRequest,
  Amenity,
  Booking,
  Notification,
  ActivityLog,
  DashboardStats,
  ApiResponse,
} from "@/types";

// ── Generic fetcher ───────────────────────────────────────────────────────
async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success || !res.ok) throw new Error(json.error ?? "Request failed");
  return json.data as T;
}

// ── Properties ────────────────────────────────────────────────────────────
export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: () => fetcher<Property[]>("/api/properties"),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["properties", id],
    queryFn: () => fetcher<Property>(`/api/properties/${id}`),
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetcher("/api/properties", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["properties"] }),
  });
}

// ── Tenants ───────────────────────────────────────────────────────────────
export function useTenants() {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: () => fetcher<Tenant[]>("/api/tenants"),
  });
}

// ── Maintenance ───────────────────────────────────────────────────────────
export function useMaintenanceRequests() {
  return useQuery({
    queryKey: ["maintenance"],
    queryFn: () => fetcher<MaintenanceRequest[]>("/api/maintenance"),
  });
}

export function useCreateMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetcher("/api/maintenance", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ── Amenities ─────────────────────────────────────────────────────────────
export function useAmenities() {
  return useQuery({
    queryKey: ["amenities"],
    queryFn: () => fetcher<Amenity[]>("/api/amenities"),
  });
}

// ── Bookings ──────────────────────────────────────────────────────────────
export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: () => fetcher<Booking[]>("/api/bookings"),
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetcher("/api/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ── Notifications ─────────────────────────────────────────────────────────
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetcher<Notification[]>("/api/notifications"),
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () =>
      fetcher<{
        stats: DashboardStats;
        recentActivity: ActivityLog[];
      }>("/api/dashboard/stats"),
  });
}