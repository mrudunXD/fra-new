import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Layout/Header";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { ArrowLeft, Save } from "lucide-react";

export default function ClaimEdit() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: claim, isLoading, error } = useQuery({
    queryKey: ["/api/claims", id],
    queryFn: () => api.getClaim(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          title="Edit Claim"
          description="Modify claim information"
        />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          title="Claim Not Found"
          description="The requested claim could not be found"
        />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : "Claim not found"}
                </p>
                <Button onClick={() => setLocation("/claims")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Claims
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={`Edit Claim ${claim.claimId}`}
        description="Modify forest rights claim information"
      />
      
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={() => setLocation(`/claims/${id}`)}
              data-testid="button-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Details
            </Button>
            
            <Button 
              data-testid="button-save"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Edit Claim Form</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <p className="mb-4">Claim editing functionality coming soon...</p>
                <p className="text-sm">
                  This will provide a comprehensive form to edit all FORM-A fields including:
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Basic claimant information</li>
                  <li>• Tribal status and certificates</li>
                  <li>• Family members</li>
                  <li>• Land claim details</li>
                  <li>• Geographic information</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}