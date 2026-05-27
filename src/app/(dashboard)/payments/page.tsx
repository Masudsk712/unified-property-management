"use client";

import { payments } from "@/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
  DollarSign, Search, Filter, ArrowUpDown, ChevronRight,
  CreditCard, TrendingUp, TrendingDown, Download,
  CalendarDays, CheckCircle2, AlertCircle, Clock, XCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusColors: Record<string, "success" | "warning" | "destructive" | "info" | "secondary"> = {
  completed: "success",
  pending: "warning",
  failed: "destructive",
  refunded: "info",
};

const typeIcons: Record<string, React.ElementType> = {
  rent: DollarSign,
  deposit: CreditCard,
  fee: AlertCircle,
  refund: CheckCircle2,
};

const ITEMS_PER_PAGE = 5;

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { setTimeout(() => setLoading(false), 600); }, []);

  const filtered = useMemo(() => {
    let result = payments.filter((p) => {
      const matchesSearch =
        (p.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortBy === "amount") {
      result.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "date") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "status") {
      result.sort((a, b) => a.status.localeCompare(b.status));
    }
    return result;
  }, [search, statusFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

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
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">Track rent payments, deposits, and fees</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {[
          { label: "Total Collected", value: totalRevenue, color: "text-emerald-500", bg: "bg-emerald-500/10", format: (v: number) => formatCurrency(v) },
          { label: "Pending", value: pendingAmount, color: "text-amber-500", bg: "bg-amber-500/10", format: (v: number) => formatCurrency(v) },
          { label: "Completed", value: payments.filter((p) => p.status === "completed").length, color: "text-blue-500", bg: "bg-blue-500/10", format: (v: number) => `${v} txns` },
          { label: "Failed", value: payments.filter((p) => p.status === "failed").length, color: "text-red-500", bg: "bg-red-500/10", format: (v: number) => `${v} txns` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <div className={cn("rounded-lg p-2 inline-flex", stat.bg)}>
              <DollarSign className={cn("h-4 w-4", stat.color)} />
            </div>
            <p className="text-2xl font-bold mt-2">{stat.format(stat.value)}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search payments by description or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="h-10 w-full rounded-lg border border-input bg-muted/50 pl-10 pr-4 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["all", "completed", "pending", "failed", "refunded"].map((s) => (
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
          <Button variant="outline" size="sm" onClick={() => setSortBy(sortBy === "date" ? "amount" : sortBy === "amount" ? "status" : "date")}>
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sort: {sortBy === "date" ? "Date" : sortBy === "amount" ? "Amount" : "Status"}
          </Button>
        </div>
      </div>

      {/* Payment List */}
      {paginated.length > 0 ? (
        <div className="space-y-3">
          {paginated.map((payment) => {
            const Icon = typeIcons[payment.type] || DollarSign;
            return (
              <motion.div
                key={payment.id}
                whileHover={{ x: 4 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
              >
                {/* Type Icon */}
                <div className={cn(
                  "rounded-full p-2.5 flex-shrink-0",
                  payment.status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                  payment.status === "pending" ? "bg-amber-500/10 text-amber-500" :
                  payment.status === "failed" ? "bg-red-500/10 text-red-500" :
                  "bg-blue-500/10 text-blue-500"
                )}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{payment.description || payment.type}</p>
                    <Badge variant={statusColors[payment.status] ?? "secondary"} className="text-xs capitalize">
                      {payment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {payment.method?.replace("_", " ")} · {payment.id}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(payment.createdAt)}
                    </span>
                    {payment.paidAt && (
                      <span className="flex items-center gap-1 text-emerald-500">
                        <CheckCircle2 className="h-3 w-3" />
                        Paid {formatDate(payment.paidAt)}
                      </span>
                    )}
                    {payment.dueDate && (
                      <span className={cn("flex items-center gap-1", payment.status === "pending" ? "text-amber-500" : "")}>
                        <Clock className="h-3 w-3" />
                        Due {formatDate(payment.dueDate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <p className={cn(
                    "font-bold text-lg",
                    payment.status === "failed" ? "text-destructive" : ""
                  )}>
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{payment.type}</p>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 hidden sm:block" />
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={DollarSign}
          title="No payments found"
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