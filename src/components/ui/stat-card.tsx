"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "./badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color = "from-blue-500 to-indigo-500",
  bgColor = "bg-blue-500/10",
  children,
  className,
}: StatCardProps) {
  const colorClass = color.split("-")[1] || "blue";

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "card-lift group relative overflow-hidden rounded-xl border border-border bg-card p-6",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn("rounded-xl p-3", bgColor)}>
          <Icon className={cn("h-6 w-6", `text-${colorClass}-500`)} />
        </div>
        {change !== undefined && change !== 0 && (
          <Badge
            variant={change > 0 ? "success" : "destructive"}
            className="flex items-center gap-1"
          >
            {change > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {change > 0 ? "+" : ""}
            {change.toFixed(1)}%
          </Badge>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="text-2xl font-bold tracking-tight mt-1">
          {children || value}
        </div>
      </div>
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
          color
        )}
      />
    </motion.div>
  );
}