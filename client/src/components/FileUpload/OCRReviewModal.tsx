import { useState, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { X, Save, AlertTriangle } from "lucide-react";
import type { OCRResult } from "@/types";

interface OCRReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  ocrData: { file: any; ocrResult: OCRResult } | null;
}

export function OCRReviewModal({ isOpen, onClose, ocrData }: OCRReviewModalProps) {
  const [formData, setFormData] = useState({
    // Basic Information
    claimantName: "",
    spouseName: "",
    fatherMotherName: "",
    address: "",
    village: "",
    gramPanchayat: "",
    tehsilTaluka: "",
    district: "",
    state: "",
    
    // Tribal Status
    scheduledTribe: "",
    scheduledTribeCertificate: "",
    otherTraditionalForestDweller: "",
    spouseScheduledTribe: "",
    
    // Family Members (will be stored as JSON)
    familyMembers: [] as Array<{name: string; age: number; relation: string}>,
    
    // Land Claims
    landForHabitation: "",
    landForSelfCultivation: "",
    disputedLands: "",
    pattasLeasesGrants: "",
    landForRehabilitationAlternative: "",
    landDisplacedWithoutCompensation: "",
    
    // Legacy fields
    claimId: "",
    area: "",
    surveyNumber: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update form data when OCR data changes
  useEffect(() => {
    if (ocrData?.ocrResult) {
      const result = ocrData.ocrResult;
      setFormData({
        // Basic Information
        claimantName: result.claimantName || "",
        spouseName: result.spouseName || "",
        fatherMotherName: result.fatherMotherName || "",
        address: result.address || "",
        village: result.village || "",
        gramPanchayat: result.gramPanchayat || "",
        tehsilTaluka: result.tehsilTaluka || "",
        district: result.district || "",
        state: result.state || "",
        
        // Tribal Status
        scheduledTribe: result.scheduledTribe || "",
        scheduledTribeCertificate: result.scheduledTribeCertificate || "",
        otherTraditionalForestDweller: result.otherTraditionalForestDweller || "",
        spouseScheduledTribe: result.spouseScheduledTribe || "",
        
        // Family Members
        familyMembers: result.familyMembers || [],
        
        // Land Claims
        landForHabitation: result.landForHabitation?.toString() || "",
        landForSelfCultivation: result.landForSelfCultivation?.toString() || "",
        disputedLands: result.disputedLands?.toString() || "",
        pattasLeasesGrants: result.pattasLeasesGrants?.toString() || "",
        landForRehabilitationAlternative: result.landForRehabilitationAlternative?.toString() || "",
        landDisplacedWithoutCompensation: result.landDisplacedWithoutCompensation?.toString() || "",
        
        // Legacy fields
        claimId: result.claimId || "",
        area: result.area || "",
        surveyNumber: result.surveyNumber || "",
      });
    }
  }, [ocrData]);

  const saveOCRMutation = useMutation({
    mutationFn: api.saveOCRData,
    onSuccess: () => {
      toast({
        title: "Claim Created Successfully",
        description: "OCR data has been reviewed and saved as a new claim.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save claim data",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    if (!ocrData) return;

    // Validate required fields
    if (!formData.claimantName || !formData.village || !formData.claimId || !formData.area) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields: Claimant Name, Village, Claim ID, and Area.",
        variant: "destructive",
      });
      return;
    }

    const saveData = {
      ...formData,
      confidence: ocrData.ocrResult.confidence,
      rawText: ocrData.ocrResult.rawText,
      fileId: ocrData.file.id,
    };

    saveOCRMutation.mutate(saveData);
  }, [formData, ocrData, saveOCRMutation, toast]);

  const handleReject = useCallback(() => {
    toast({
      title: "OCR Data Rejected",
      description: "The extracted data has been rejected and will not be saved.",
    });
    onClose();
  }, [onClose, toast]);

  if (!isOpen || !ocrData) return null;

  const { ocrResult } = ocrData;
  const confidenceColor = 
    ocrResult.confidence >= 80 
      ? "bg-accent/10 text-accent" 
      : ocrResult.confidence >= 60 
      ? "bg-chart-1/10 text-chart-1" 
      : "bg-destructive/10 text-destructive";

  const lowConfidence = ocrResult.confidence < 60;
  const fieldClass = (required?: boolean) => (
    `${required && lowConfidence ? 'ring-1 ring-destructive/50' : ''}`
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-foreground">
              OCR Text Review
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Document */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Original Document
            </h4>
            <div className="bg-muted rounded-lg p-4 h-64 flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Document preview not available
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Original file: {ocrData.file.originalName}
                </p>
              </div>
            </div>
          </div>

          {/* Extracted Text */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-foreground">
                Extracted Text
              </h4>
              <Badge className={confidenceColor} data-testid="confidence-badge">
                Confidence: {ocrResult.confidence}%
              </Badge>
            </div>
            
            <div className="space-y-6">
              {/* Basic Information Section */}
              <div>
                <h5 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-1">
                  Basic Information
                </h5>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="claimantName" className="text-xs font-medium text-muted-foreground">
                      1. Name of the claimant *
                    </Label>
                    <Input
                      id="claimantName"
                      value={formData.claimantName}
                      onChange={(e) => handleInputChange("claimantName", e.target.value)}
                      className={`mt-1 ${fieldClass(true)}`}
                      data-testid="input-claimant-name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="spouseName" className="text-xs font-medium text-muted-foreground">
                      2. Name of the spouse
                    </Label>
                    <Input
                      id="spouseName"
                      value={formData.spouseName}
                      onChange={(e) => handleInputChange("spouseName", e.target.value)}
                      className="mt-1"
                      data-testid="input-spouse-name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="fatherMotherName" className="text-xs font-medium text-muted-foreground">
                      3. Name of father/mother
                    </Label>
                    <Input
                      id="fatherMotherName"
                      value={formData.fatherMotherName}
                      onChange={(e) => handleInputChange("fatherMotherName", e.target.value)}
                      className="mt-1"
                      data-testid="input-father-mother-name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address" className="text-xs font-medium text-muted-foreground">
                      4. Address
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="mt-1"
                      data-testid="input-address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="village" className="text-xs font-medium text-muted-foreground">
                        5. Village *
                      </Label>
                      <Input
                        id="village"
                        value={formData.village}
                        onChange={(e) => handleInputChange("village", e.target.value)}
                        className={`mt-1 ${fieldClass(true)}`}
                        data-testid="input-village"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="gramPanchayat" className="text-xs font-medium text-muted-foreground">
                        6. Gram Panchayat
                      </Label>
                      <Input
                        id="gramPanchayat"
                        value={formData.gramPanchayat}
                        onChange={(e) => handleInputChange("gramPanchayat", e.target.value)}
                        className="mt-1"
                        data-testid="input-gram-panchayat"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="tehsilTaluka" className="text-xs font-medium text-muted-foreground">
                        7. Tehsil/Taluka
                      </Label>
                      <Input
                        id="tehsilTaluka"
                        value={formData.tehsilTaluka}
                        onChange={(e) => handleInputChange("tehsilTaluka", e.target.value)}
                        className="mt-1"
                        data-testid="input-tehsil-taluka"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="district" className="text-xs font-medium text-muted-foreground">
                        8. District
                      </Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) => handleInputChange("district", e.target.value)}
                        className="mt-1"
                        data-testid="input-district"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="state" className="text-xs font-medium text-muted-foreground">
                      State
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="mt-1"
                      data-testid="input-state"
                    />
                  </div>
                </div>
              </div>

              {/* Tribal Status Section */}
              <div>
                <h5 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-1">
                  9. Tribal Status
                </h5>
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="scheduledTribe" className="text-xs font-medium text-muted-foreground">
                        (a) Scheduled Tribe
                      </Label>
                      <select
                        id="scheduledTribe"
                        value={formData.scheduledTribe}
                        onChange={(e) => handleInputChange("scheduledTribe", e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-md"
                        data-testid="select-scheduled-tribe"
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="otherTraditionalForestDweller" className="text-xs font-medium text-muted-foreground">
                        (b) Other Traditional Forest Dweller
                      </Label>
                      <select
                        id="otherTraditionalForestDweller"
                        value={formData.otherTraditionalForestDweller}
                        onChange={(e) => handleInputChange("otherTraditionalForestDweller", e.target.value)}
                        className="mt-1 w-full px-3 py-2 text-sm border border-border rounded-md"
                        data-testid="select-other-traditional"
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="scheduledTribeCertificate" className="text-xs font-medium text-muted-foreground">
                      ST Certificate Details
                    </Label>
                    <Input
                      id="scheduledTribeCertificate"
                      value={formData.scheduledTribeCertificate}
                      onChange={(e) => handleInputChange("scheduledTribeCertificate", e.target.value)}
                      className="mt-1"
                      placeholder="Certificate Number/Details"
                      data-testid="input-st-certificate"
                    />
                  </div>
                </div>
              </div>

              {/* Legacy Fields */}
              <div>
                <h5 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-1">
                  Claim Details
                </h5>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="claimId" className="text-xs font-medium text-muted-foreground">
                      Claim ID *
                    </Label>
                    <Input
                      id="claimId"
                      value={formData.claimId}
                      onChange={(e) => handleInputChange("claimId", e.target.value)}
                      className={`mt-1 ${fieldClass(true)}`}
                      data-testid="input-claim-id"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="area" className="text-xs font-medium text-muted-foreground">
                        Total Area (Hectares) *
                      </Label>
                      <Input
                        id="area"
                        type="number"
                        step="0.01"
                        value={formData.area}
                        onChange={(e) => handleInputChange("area", e.target.value)}
                        className={`mt-1 ${fieldClass(true)}`}
                        data-testid="input-area"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="surveyNumber" className="text-xs font-medium text-muted-foreground">
                        Survey Number
                      </Label>
                      <Input
                        id="surveyNumber"
                        value={formData.surveyNumber}
                        onChange={(e) => handleInputChange("surveyNumber", e.target.value)}
                        className="mt-1"
                        data-testid="input-survey-number"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nature of Claim on Land */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-1">
            Nature of Claim on Land (Hectares)
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="landForHabitation" className="text-xs font-medium text-muted-foreground">
                (a) For habitation
              </Label>
              <Input
                id="landForHabitation"
                type="number"
                step="0.01"
                value={formData.landForHabitation}
                onChange={(e) => handleInputChange("landForHabitation", e.target.value)}
                className="mt-1"
                data-testid="input-land-habitation"
              />
            </div>
            
            <div>
              <Label htmlFor="landForSelfCultivation" className="text-xs font-medium text-muted-foreground">
                (b) For self-cultivation
              </Label>
              <Input
                id="landForSelfCultivation"
                type="number"
                step="0.01"
                value={formData.landForSelfCultivation}
                onChange={(e) => handleInputChange("landForSelfCultivation", e.target.value)}
                className="mt-1"
                data-testid="input-land-cultivation"
              />
            </div>
            
            <div>
              <Label htmlFor="disputedLands" className="text-xs font-medium text-muted-foreground">
                2. Disputed lands if any
              </Label>
              <Input
                id="disputedLands"
                type="number"
                step="0.01"
                value={formData.disputedLands}
                onChange={(e) => handleInputChange("disputedLands", e.target.value)}
                className="mt-1"
                data-testid="input-disputed-lands"
              />
            </div>
            
            <div>
              <Label htmlFor="pattasLeasesGrants" className="text-xs font-medium text-muted-foreground">
                3. Pattas/leases/grants
              </Label>
              <Input
                id="pattasLeasesGrants"
                type="number"
                step="0.01"
                value={formData.pattasLeasesGrants}
                onChange={(e) => handleInputChange("pattasLeasesGrants", e.target.value)}
                className="mt-1"
                data-testid="input-pattas-leases"
              />
            </div>
            
            <div>
              <Label htmlFor="landForRehabilitationAlternative" className="text-xs font-medium text-muted-foreground">
                4. Land for rehabilitation/alternative
              </Label>
              <Input
                id="landForRehabilitationAlternative"
                type="number"
                step="0.01"
                value={formData.landForRehabilitationAlternative}
                onChange={(e) => handleInputChange("landForRehabilitationAlternative", e.target.value)}
                className="mt-1"
                data-testid="input-rehabilitation-land"
              />
            </div>
            
            <div>
              <Label htmlFor="landDisplacedWithoutCompensation" className="text-xs font-medium text-muted-foreground">
                5. Land displaced without compensation
              </Label>
              <Input
                id="landDisplacedWithoutCompensation"
                type="number"
                step="0.01"
                value={formData.landDisplacedWithoutCompensation}
                onChange={(e) => handleInputChange("landDisplacedWithoutCompensation", e.target.value)}
                className="mt-1"
                data-testid="input-displaced-land"
              />
            </div>
          </div>
        </div>

        {/* Family Members */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-1">
            10. Family Members
          </h4>
          {formData.familyMembers.length > 0 ? (
            <div className="space-y-2">
              {formData.familyMembers.map((member, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 p-2 bg-muted/50 rounded">
                  <div className="text-sm">{member.name}</div>
                  <div className="text-sm">{member.age} years</div>
                  <div className="text-sm text-muted-foreground">{member.relation}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No family members extracted</p>
          )}
        </div>

        {/* Raw OCR Output */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-foreground mb-3">
            Raw OCR Text
          </h4>
          <Textarea
            value={ocrResult.rawText}
            readOnly
            className="h-32 font-mono text-xs resize-none"
            data-testid="textarea-raw-ocr"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-border">
          <Button 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleReject}
            data-testid="button-reject"
          >
            <X className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveOCRMutation.isPending}
            data-testid="button-save"
          >
            <Save className="mr-2 h-4 w-4" />
            {saveOCRMutation.isPending ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
