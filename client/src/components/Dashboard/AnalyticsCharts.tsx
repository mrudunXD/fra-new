import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { ClaimWithFiles } from "@/types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  approved: "#10b981",
  pending: "#6b7280",
  rejected: "#ef4444",
  review_required: "#f59e0b",
};

export function AnalyticsCharts() {
  const { data: claims } = useQuery<ClaimWithFiles[]>({
    queryKey: ["/api/claims", 1000],
    queryFn: () => api.getClaims(1000),
  });

  const { statusData, villageData, trendData } = useMemo(() => {
    const byStatus: Record<string, number> = {};
    const byVillage: Record<string, number> = {};
    const byDate: Record<string, number> = {};

    (claims || []).forEach((c) => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      const v = c.village || "Unknown";
      byVillage[v] = (byVillage[v] || 0) + 1;
      const dateKey = new Date(c.createdAt as any).toISOString().slice(0, 10);
      byDate[dateKey] = (byDate[dateKey] || 0) + 1;
    });

    const statusData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));
    const villageData = Object.entries(byVillage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
    const trendData = Object.entries(byDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, value }));

    return { statusData, villageData, trendData };
  }, [claims]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90}>
                {statusData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#8884d8"} />
                ))}
              </Pie>
              <ReTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Claims by Village (Top 10)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={villageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <ReTooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Claims Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <ReTooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}


