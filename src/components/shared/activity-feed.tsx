"use client";

import { useState } from "react";
import { useRealtimeActivity } from "@/hooks/useRealtime";
import { formatTimeAgo, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowRight, Wrench, CalendarDays, DollarSign, Building2, User, Settings } from "lucide-react";
import Link from "next/link";
import type { ActivityLog } from "@/types";

const ACTIVITY_ICONS: Record<ActivityLog["type"], React.ComponentType<{ className?: string }>> = {
  booking: CalendarDays,
  maintenance: Wrench,
  property: Building2,
  payment: DollarSign,
  user: User,
  system: Settings,
};

const ACTIVITY_COLORS: Record<ActivityLog["type"], string> = {
  booking: "bg-blue-500/10 text-blue-500",
  maintenance: "bg-orange-500/10 text-orange-500",
  property: "bg-violet-500/10 text-violet-500",
  payment: "bg-emerald-500/10 text-emerald-500",
  user: "bg-cyan-500/10 text-cyan-500",
  system: "bg-gray-500/10 text-gray-500",
};

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
  initialActivities?: ActivityLog[];
}

export function ActivityFeed({ limit = 5, showHeader = true, initialActivities = [] }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>(initialActivities);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  // Subscribe to real-time activity
  useRealtimeActivity((newActivity) => {
    setActivities((prev) => [newActivity, ...prev].slice(0, 50));
    setNewIds((prev) => new Set([...prev, newActivity.id]));

    // Clear highlight after animation
    setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev);
        next.delete(newActivity.id);
        return next;
      });
    }, 3000);
  });

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Activity className="h-10 w-10 mb-3 opacity-30" />
        <p className="text-sm font-medium">No recent activity</p>
        <p className="text-xs mt-1">Actions will appear here in real-time</p>
      </div>
    );
  }

  return (
    <div>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Live Activity</h3>
            <p className="text-sm text-muted-foreground">
              Real-time updates across your portfolio
            </p>
          </div>
          <Link href="/dashboard/activity">
            <span className="flex items-center gap-1 text-sm text-primary hover:underline">
              View All
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      )}

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {activities.slice(0, limit).map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.type] ?? Activity;
            const isNew = newIds.has(activity.id);

            return (
              <motion.div
                key={activity.id}
                initial={isNew ? { opacity: 0, x: -20, height: 0 } : false}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={cn(
                  "flex items-center gap-4 rounded-lg p-4 transition-all",
                  isNew
                    ? "bg-primary/5 border border-primary/20 shadow-sm"
                    : "hover:bg-muted/50"
                )}
              >
                <div className="relative">
                  <img
                    src={activity.userAvatar ?? undefined}
                    alt={activity.userName}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                  />
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background",
                      ACTIVITY_COLORS[activity.type].split(" ")[0] ?? "bg-primary/10"
                    )}
                  >
                    <Icon className={cn("h-3 w-3", ACTIVITY_COLORS[activity.type])} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.userName}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium text-foreground/80">{activity.target}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.createdAt)}
                    </p>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {activity.type}
                    </Badge>
                    {isNew && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-primary font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        New
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-56 mt-1" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}