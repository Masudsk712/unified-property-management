// ============================================================================
// Tenant Dashboard Page — Tenant-facing dashboard
// ============================================================================

"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Home, CalendarDays, CreditCard, Wrench, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardStats, activities } from "@/data/mock";
import { formatCurrency, formatNumber, formatTimeAgo } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function TenantDashboardPage() {
  const { data: session } = useSession();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Tenant Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl border border-violet-500/20 bg-violet-500/5"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10">
            <Home className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {session?.user?.name || "Tenant"} — Your home dashboard
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="bg-violet-500/20 text-violet-500 border-violet-500/30">
            Tenant
          </Badge>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </motion.div>

      {/* Tenant Quick Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Rent Due", value: 1500, icon: "💳", format: formatCurrency },
          { title: "Days Left", value: 15, icon: "📅", format: (v: number) => `${v} days` },
          { title: "Open Requests", value: 2, icon: "🔧", format: formatNumber },
          { title: "Amenities Used", value: 5, icon: "🏊", format: formatNumber },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-lift rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">{stat.title}</p>
            <p className="text-2xl font-bold mt-1">{stat.format(stat.value)}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        {[
          { title: "Pay Rent", icon: CreditCard, href: "/payments", color: "bg-blue-500/10 text-blue-500" },
          { title: "Book Amenity", icon: CalendarDays, href: "/amenities", color: "bg-emerald-500/10 text-emerald-500" },
          { title: "Report Issue", icon: Wrench, href: "/maintenance/create", color: "bg-orange-500/10 text-orange-500" },
        ].map((action) => (
          <Link key={action.title} href={action.href}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="card-lift flex items-center gap-4 rounded-xl border border-border bg-card p-5 cursor-pointer"
            >
              <div className={`rounded-xl p-3 ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground">Click to proceed</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center text-sm font-bold text-violet-500">
                {activity.userName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.userName}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>
                </p>
                <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.createdAt)}</p>
              </div>
              <Badge variant="secondary" className="text-xs">{activity.type}</Badge>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <h3 className="font-semibold text-lg mb-4">Notifications</h3>
        <div className="space-y-3">
          {[
            { title: "Rent Due Soon", message: "Your rent of $1,500 is due in 15 days.", type: "warning" },
            { title: "Maintenance Update", message: "Plumbing request #1023 has been resolved.", type: "success" },
            { title: "Amenity Booking", message: "You have booked the gym for tomorrow at 10 AM.", type: "info" },
          ].map((notif) => (
            <div key={notif.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className={`mt-0.5 h-2 w-2 rounded-full ${
                notif.type === "warning" ? "bg-warning" :
                notif.type === "success" ? "bg-success" : "bg-info"
              }`} />
              <div>
                <p className="text-sm font-medium">{notif.title}</p>
                <p className="text-xs text-muted-foreground">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}