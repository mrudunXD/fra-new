import { Header } from "@/components/Layout/Header";
import { StatsGrid } from "@/components/Dashboard/StatsGrid";
import { AnalyticsCharts } from "@/components/Dashboard/AnalyticsCharts";

export default function Analytics() {
  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Analytics"
        description="Visualize claims data and track progress"
      />
      <main className="p-6">
        <StatsGrid />
        <AnalyticsCharts />
      </main>
    </div>
  );
}


