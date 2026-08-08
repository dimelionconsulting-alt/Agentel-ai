"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UsagePoint } from "@/services/dashboard";

export function UsageChart({ data }: { data: UsagePoint[] }) {
  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle>Call volume</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="inbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0e7490" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0e7490" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="outbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0369a1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0369a1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="inbound"
              stroke="#0e7490"
              fill="url(#inbound)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="outbound"
              stroke="#0369a1"
              fill="url(#outbound)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
