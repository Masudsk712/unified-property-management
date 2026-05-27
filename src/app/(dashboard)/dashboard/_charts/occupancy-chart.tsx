"use client";

import { memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";

type Props = {
  data: { month: string; rate: number }[];
  rate: number;
};

export const OccupancyChart = memo(function OccupancyChart({ data, rate }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg">Occupancy Rate</h3>
          <p className="text-sm text-muted-foreground">Portfolio occupancy trend</p>
        </div>
        <Badge variant="info" className="flex items-center gap-1">
          {rate}%
        </Badge>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            domain={[80, 92]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="var(--info)"
            strokeWidth={2}
            dot={{ fill: "var(--info)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default OccupancyChart;