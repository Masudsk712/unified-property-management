"use client";

import { useState, useEffect, Suspense, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  DollarSign,
  Wrench,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  ArrowRight,
  Plus,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

// ── Dynamically import heavy charting to reduce initial bundle ────────────
const RevenueChart = dynamic(() => import("./_charts/revenue-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const OccupancyChart = dynamic(() => import("./_charts/occupancy-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const RevenueByPropertyChart = dynamic(() => import("./_charts/revenue-by-property-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const MaintenancePieChart = dynamic(() => import("./_charts/maintenance-pie-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

// ── Animated Counter (uses requestAnimationFrame instead of setInterval) ──
function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.5,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame: number;
    const end = value;
    const increment = end / (duration * 60);
    let start = 0;
    const tick = () => {
      start += increment;
      if (start >= end) {
        setCount(end);
      } else {
        setCount(Math.floor(start));
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────
function ChartSkeleton() {
  return <Skeleton className="h-[300px] w-full rounded-xl" />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6">
            <div className="flex justify-between">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-24 mt-4" />
            <Skeleton className="h-8 w-32 mt-2" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}

// ── Stat Card (memoized) ──────────────────────────────────────────────────
const StatCard = memo(function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  bgColor,
  format,
}: {
  title: string;
  value: number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  format: (v: number) => string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card-lift group relative overflow-hidden rounded-xl border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-xl ${bgColor} p-3`}>
          <Icon className="h-6 w-6" />
        </div>
        {change !== 0 && (
          <Badge
            variant={change > 0 ? "success" : "destructive"}
            className="flex items-center gap-1"
          >
            {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {formatPercentage(change)}
          </Badge>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold tracking-tight mt-1">
          {title === "Total Revenue" ? (
            <AnimatedCounter value={value} prefix="$" />
          ) : title === "Occupancy Rate" ? (
            <AnimatedCounter value={value} suffix="%" />
          ) : (
            <AnimatedCounter value={value} />
          )}
        </p>
      </div>
    </motion.div>
  );
});

// ── Quick Action Card (memoized) ──────────────────────────────────────────
const QuickActionCard = memo(function QuickActionCard({
  title,
  icon: Icon,
  href,
  color,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/50"
      >
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">Click to get started</p>
        </div>
        <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </motion.div>
    </Link>
  );
});

// ── Main Dashboard Page ───────────────────────────────────────────────────
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Inline mock data (avoids importing 292-line mock.ts into every bundle)
  const mockRevenue = [
    { month: "Jan", revenue: 42000 }, { month: "Feb", revenue: 45000 },
    { month: "Mar", revenue: 48000 }, { month: "Apr", revenue: 51000 },
    { month: "May", revenue: 54000 }, { month: "Jun", revenue: 52000 },
    { month: "Jul", revenue: 58000 }, { month: "Aug", revenue: 61000 },
    { month: "Sep", revenue: 59000 }, { month: "Oct", revenue: 63000 },
    { month: "Nov", revenue: 67000 }, { month: "Dec", revenue: 72000 },
  ];

  const mockOccupancy = [
    { month: "Jan", rate: 85 }, { month: "Feb", rate: 86 },
    { month: "Mar", rate: 87 }, { month: "Apr", rate: 88 },
    { month: "May", rate: 89 }, { month: "Jun", rate: 90 },
    { month: "Jul", rate: 91 }, { month: "Aug", rate: 90 },
    { month: "Sep", rate: 89 }, { month: "Oct", rate: 88 },
    { month: "Nov", rate: 87 }, { month: "Dec", rate: 88 },
  ];

  const mockRevenueByProperty = [
    { property: "Skyline Towers", revenue: 72000 },
    { property: "Harbor View", revenue: 58000 },
    { property: "Oakwood", revenue: 45000 },
    { property: "Sunset Villas", revenue: 38000 },
    { property: "Park Avenue", revenue: 52000 },
  ];

  const mockMaintenance = [
    { category: "Plumbing", count: 12 }, { category: "Electrical", count: 8 },
    { category: "HVAC", count: 15 }, { category: "Structural", count: 5 },
    { category: "Appliance", count: 10 }, { category: "Other", count: 6 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back. Here's what's happening across your portfolio.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <CalendarDays className="mr-2 h-4 w-4" />
            Last 30 days
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue" value={723000} change={12.5}
          icon={DollarSign} color="from-emerald-500 to-teal-500"
          bgColor="bg-emerald-500/10" format={formatCurrency}
        />
        <StatCard
          title="Properties" value={24} change={0}
          icon={Building2} color="from-blue-500 to-indigo-500"
          bgColor="bg-blue-500/10" format={formatNumber}
        />
        <StatCard
          title="Occupancy Rate" value={88} change={-1.2}
          icon={Users} color="from-violet-500 to-purple-500"
          bgColor="bg-violet-500/10" format={(v) => `${v}%`}
        />
        <StatCard
          title="Maintenance" value={56} change={-8.3}
          icon={Wrench} color="from-orange-500 to-amber-500"
          bgColor="bg-orange-500/10" format={formatNumber}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart data={mockRevenue} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <OccupancyChart data={mockOccupancy} rate={88} />
        </Suspense>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueByPropertyChart data={mockRevenueByProperty} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <MaintenancePieChart data={mockMaintenance} />
        </Suspense>
      </div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <ActivityFeed limit={5} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <QuickActionCard title="Add Property" icon={Building2} href="/properties/add" color="bg-blue-500/10 text-blue-500" />
        <QuickActionCard title="Create Maintenance Request" icon={Wrench} href="/maintenance/create" color="bg-orange-500/10 text-orange-500" />
        <QuickActionCard title="View Bookings" icon={CalendarDays} href="/amenities/bookings" color="bg-violet-500/10 text-violet-500" />
      </motion.div>
    </motion.div>
  );
}