"use client";

import { tenants } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
  Users, Search, Filter, ArrowUpDown, ChevronRight,
  MapPin, Home, CalendarDays, DollarSign, AlertCircle,
  Plus, UserCheck, Clock,
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import Link from "next/link";

const statusColors: Record<string, "success" | "warning" | "destructive" | "info" | "secondary"> = {
  active: "success",
  pending: "warning",
  expired: "secondary" as const,
  evicted: "destructive",
};

const ITEMS_PER_PAGE = 5;

export default function TenantsPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { setTimeout(() => setLoading(false), 600); }, []);

  const filtered = useMemo(() => {
    let result = tenants.filter((t) => {
      const matchesSearch =
        (t.user?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (t.user?.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
        t.unit.toLowerCase().includes(search.toLowerCase()) ||
        (t.property?.name ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortBy === "name") {
      result.sort((a, b) => (a.user?.name ?? "").localeCompare(b.user?.name ?? ""));
    } else if (sortBy === "rent") {
      result.sort((a, b) => b.rentAmount - a.rentAmount);
    } else if (sortBy === "date") {
      result.sort((a, b) => new Date(b.leaseStart).getTime() - new Date(a.leaseStart).getTime());
    }
    return result;
  }, [search, statusFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground mt-1">Manage tenant information and lease agreements</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "Total", value: tenants.length, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active", value: tenants.filter((t) => t.status === "active").length, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Pending", value: tenants.filter((t) => t.status === "pending").length, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Expired", value: tenants.filter((t) => t.status === "expired" || t.status === "evicted").length, color: "text-red-500", bg: "bg-red-500/10" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <div className={cn("rounded-lg p-2 inline-flex", stat.bg)}>
              <Users className={cn("h-4 w-4", stat.color)} />
            </div>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search tenants by name, email, unit..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="h-10 w-full rounded-lg border border-input bg-muted/50 pl-10 pr-4 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["all", "active", "pending", "expired"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              className="capitalize whitespace-nowrap"
            >
              {s}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => setSortBy(sortBy === "name" ? "rent" : sortBy === "rent" ? "date" : "name")}>
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sort: {sortBy === "name" ? "Name" : sortBy === "rent" ? "Rent" : "Date"}
          </Button>
        </div>
      </div>

      {/* Tenant List */}
      {paginated.length > 0 ? (
        <div className="space-y-3">
          {paginated.map((tenant) => (
            <motion.div
              key={tenant.id}
              whileHover={{ x: 4 }}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
            >
              {/* Avatar & Name */}
              <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-56">
                <img
                  src={tenant.user?.image ?? "https://ui-avatars.com/api/?name=" + (tenant.user?.name || "U") + "&background=6366f1&color=fff"}
                  alt={tenant.user?.name ?? "Tenant"}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{tenant.user?.name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground truncate">{tenant.user?.email ?? ""}</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-4 flex-1 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Home className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{tenant.property?.name ?? "—"} · {tenant.unit}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{formatCurrency(tenant.rentAmount)}/mo</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{formatDate(tenant.leaseStart)} – {formatDate(tenant.leaseEnd)}</span>
                </div>
              </div>

              {/* Status & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 w-full sm:w-auto">
                <Badge variant={statusColors[tenant.status] ?? "secondary"} className="capitalize">
                  {tenant.status}
                </Badge>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No tenants found"
          description="Try adjusting your search or filter criteria."
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

