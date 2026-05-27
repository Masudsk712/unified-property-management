"use client";

import { useNotificationStore } from "@/store";
import { useRealtimeNotifications } from "@/hooks/useRealtime";
import { formatTimeAgo, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Notification } from "@/types";

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Subscribe to real-time notifications
  useRealtimeNotifications();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      router.push(notification.link);
      setOpen(false);
    }
  };

  const getTypeStyles = (type: Notification["type"]) => {
    const map = {
      info: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30",
      warning: "border-l-amber-500 bg-amber-50 dark:bg-amber-950/30",
      success: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
      error: "border-l-red-500 bg-red-50 dark:bg-red-950/30",
    };
    return map[type];
  };

  const getDotColor = (type: Notification["type"]) => {
    const map = {
      info: "bg-blue-500",
      warning: "bg-amber-500",
      success: "bg-emerald-500",
      error: "bg-red-500",
    };
    return map[type];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="relative rounded-full"
        aria-label={`Notifications: ${unreadCount} unread`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-[380px] sm:w-96 rounded-xl border border-border bg-popover shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[460px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Bell className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm font-medium">No notifications</p>
                  <p className="text-xs mt-1">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "flex w-full gap-3 border-l-4 px-4 py-3 text-left transition-colors hover:bg-muted/50 border-b border-border/30",
                      getTypeStyles(notification.type),
                      !notification.read && "font-medium"
                    )}
                  >
                    <div className="mt-1">
                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          notification.read ? "bg-transparent border border-muted-foreground/30" : getDotColor(notification.type)
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-tight">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <Link
              href="/notifications"
              className="block px-4 py-3 text-center text-sm font-medium text-primary hover:bg-muted/50 rounded-b-xl border-t border-border"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

