import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Layout/Header";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { ArrowLeft, Edit, MapPin } from "lucide-react";
import type { Claim } from "@/types";

export default function ClaimDetail() {
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
          title="Claim Details"
          description="View claim information"
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

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: "bg-accent/10 text-accent",
      pending: "bg-chart-1/10 text-chart-1",
      rejected: "bg-destructive/10 text-destructive",
      review_required: "bg-chart-2/10 text-chart-2",
    } as const;

    const variant = variants[status as keyof typeof variants] || variants.pending;

    return (
      <Badge className={variant}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={`Claim ${claim.claimId}`}
        description="Detailed view of forest rights claim"
      />
      
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/claims")}
              data-testid="button-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Claims
            </Button>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => setLocation(`/claims/${id}/edit`)}
                data-testid="button-edit"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation(`/map?claim=${claim.claimId}`)}
                data-testid="button-map"
              >
                <MapPin className="mr-2 h-4 w-4" />
                View on Map
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Claimant Name</label>
                  <p className="text-sm">{claim.claimantName}</p>
                </div>
                {claim.spouseName && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Spouse Name</label>
                    <p className="text-sm">{claim.spouseName}</p>
                  </div>
                )}
                {claim.fatherMotherName && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Father/Mother Name</label>
                    <p className="text-sm">{claim.fatherMotherName}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Village</label>
                  <p className="text-sm">{claim.village}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">District</label>
                  <p className="text-sm">{claim.district || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">State</label>
                  <p className="text-sm">{claim.state || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Claim Status */}
            <Card>
              <CardHeader>
                <CardTitle>Claim Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(claim.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Area</label>
                  <p className="text-sm">{claim.area} hectares</p>
                </div>
                {claim.surveyNumber && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Survey Number</label>
                    <p className="text-sm">{claim.surveyNumber}</p>
                  </div>
                )}
                {claim.ocrConfidence && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">OCR Confidence</label>
                    <p className="text-sm">{claim.ocrConfidence}%</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{new Date(claim.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tribal Status */}
          {(claim.scheduledTribe || claim.otherTraditionalForestDweller) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tribal Status</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claim.scheduledTribe && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Scheduled Tribe</label>
                    <p className="text-sm">{claim.scheduledTribe}</p>
                  </div>
                )}
                {claim.otherTraditionalForestDweller && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Other Traditional Forest Dweller</label>
                    <p className="text-sm">{claim.otherTraditionalForestDweller}</p>
                  </div>
                )}
                {claim.scheduledTribeCertificate && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">ST Certificate</label>
                    <p className="text-sm">{claim.scheduledTribeCertificate}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Land Claims */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Nature of Claim on Land</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {claim.landForHabitation && parseFloat(claim.landForHabitation) > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">For Habitation</label>
                    <p className="text-sm">{claim.landForHabitation} hectares</p>
                  </div>
                )}
                {claim.landForSelfCultivation && parseFloat(claim.landForSelfCultivation) > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">For Self-Cultivation</label>
                    <p className="text-sm">{claim.landForSelfCultivation} hectares</p>
                  </div>
                )}
                {claim.disputedLands && parseFloat(claim.disputedLands) > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Disputed Lands</label>
                    <p className="text-sm">{claim.disputedLands} hectares</p>
                  </div>
                )}
                {claim.pattasLeasesGrants && parseFloat(claim.pattasLeasesGrants) > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Pattas/Leases/Grants</label>
                    <p className="text-sm">{claim.pattasLeasesGrants} hectares</p>
                  </div>
                )}
                {claim.landForRehabilitationAlternative && parseFloat(claim.landForRehabilitationAlternative) > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rehabilitation Land</label>
                    <p className="text-sm">{claim.landForRehabilitationAlternative} hectares</p>
                  </div>
                )}
                {claim.landDisplacedWithoutCompensation && parseFloat(claim.landDisplacedWithoutCompensation) > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Displaced Land</label>
                    <p className="text-sm">{claim.landDisplacedWithoutCompensation} hectares</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Family Members */}
          {claim.familyMembers && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Family Members</CardTitle>
              </CardHeader>
              <CardContent>
                {typeof claim.familyMembers === 'string' ? (
                  (() => {
                    try {
                      const members = JSON.parse(claim.familyMembers);
                      return members.length > 0 ? (
                        <div className="space-y-2">
                          {members.map((member: any, index: number) => (
                            <div key={index} className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded">
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Name</label>
                                <p className="text-sm">{member.name}</p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Age</label>
                                <p className="text-sm">{member.age} years</p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Relation</label>
                                <p className="text-sm">{member.relation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No family members recorded</p>
                      );
                    } catch {
                      return <p className="text-sm text-muted-foreground">No family members recorded</p>;
                    }
                  })()
                ) : (
                  <p className="text-sm text-muted-foreground">No family members recorded</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}