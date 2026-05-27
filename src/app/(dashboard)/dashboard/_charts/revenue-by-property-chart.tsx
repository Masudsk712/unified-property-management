"use client";

import { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: { property: string; revenue: number }[];
};

export const RevenueByPropertyChart = memo(function RevenueByPropertyChart({ data }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg">Revenue by Property</h3>
          <p className="text-sm text-muted-foreground">Monthly revenue distribution</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            type="number"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="property"
            stroke="var(--muted-foreground)"
            fontSize={12}
            width={120}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
            }}
          />
          <Bar dataKey="revenue" radius={[0, 6, 6, 0]} fill="var(--primary)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default RevenueByPropertyChart;