import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ClaimWithFiles } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Plus, 
  Search, 
  Download 
} from "lucide-react";

export function QuickActions() {
  const { data: claims } = useQuery<ClaimWithFiles[]>({
    queryKey: ["/api/claims", 1000],
    queryFn: () => api.getClaims(1000),
  });

  const exportCSV = () => {
    const rows = (claims || []).map(c => ({
      claimId: c.claimId,
      claimantName: c.claimantName,
      village: c.village,
      district: c.district || "",
      state: c.state || "",
      area: c.area,
      status: c.status,
      ocrConfidence: c.ocrConfidence ?? "",
      createdAt: c.createdAt as any,
    }));
    const header = Object.keys(rows[0] || { claimId: '', claimantName: '' });
    const csv = [header.join(','), ...rows.map(r => header.map(h => JSON.stringify((r as any)[h] ?? "")).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claims_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const actions = [
    {
      title: "View Map",
      icon: MapPin,
      color: "text-primary",
      href: "/map",
    },
    {
      title: "New Claim",
      icon: Plus,
      color: "text-accent",
      href: "/upload",
    },
    {
      title: "Search Claims",
      icon: Search,
      color: "text-chart-2",
      href: "/claims",
    },
    {
      title: "Export Data",
      icon: Download,
      color: "text-chart-1",
      href: "#",
      onClick: exportCSV,
    },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const ActionButton = (
              <Button
                key={index}
                variant="outline"
                className="flex flex-col items-center p-4 h-auto hover:bg-muted transition-colors"
                onClick={action.onClick}
                data-testid={`action-${action.title.toLowerCase().replace(" ", "-")}`}
              >
                <Icon className={`h-6 w-6 ${action.color} mb-2`} />
                <span className="text-sm font-medium text-foreground">
                  {action.title}
                </span>
              </Button>
            );

            if (action.href && action.href !== "#") {
              return (
                <Link key={index} href={action.href} className="block">
                  <div className="flex flex-col items-center p-4 h-auto border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors">
                    <Icon className={`h-6 w-6 ${action.color} mb-2`} />
                    <span className="text-sm font-medium text-foreground">
                      {action.title}
                    </span>
                  </div>
                </Link>
              );
            }

            return ActionButton;
          })}
        </div>

        {/* Filter Controls */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Filter by Region</h4>
          <div className="space-y-3">
            <Select>
              <SelectTrigger data-testid="select-state">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maharashtra">Maharashtra</SelectItem>
                <SelectItem value="chhattisgarh">Chhattisgarh</SelectItem>
                <SelectItem value="odisha">Odisha</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger data-testid="select-district">
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gadchiroli">Gadchiroli</SelectItem>
                <SelectItem value="chandrapur">Chandrapur</SelectItem>
                <SelectItem value="gondia">Gondia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
