import fs from "fs";
import path from "path";
import type { OCRResult } from "@shared/schema";

/**
 * Mock OCR Service
 * 
 * In a real implementation, this would integrate with:
 * - EasyOCR for printed text
 * - TrOCR for handwritten text
 * - spaCy for NLP entity recognition
 * 
 * For this MVP, we simulate OCR processing with realistic results.
 */
class OCRService {
  private generateMockResult(uniqueClaimId: string, confidence: number): OCRResult {
    // Mock OCR results with comprehensive FORM-A data
    const villages = ['Kachargaon', 'Mendha', 'Bamni', 'Navegaon', 'Dhamangaon', 'Pench', 'Tadoba'];
    const maleNames = ['Ramesh Kumar', 'Mohan Singh', 'Suresh Yadav', 'Devendra Rao', 'Prakash Gond'];
    const femaleNames = ['Sita Devi', 'Geeta Bai', 'Kamala Devi', 'Savita Kumari', 'Madhuri Bai'];
    const districts = ['Seoni', 'Gadchiroli', 'Gondia', 'Wardha', 'Amravati', 'Chandrapur'];
    const states = ['Madhya Pradesh', 'Maharashtra'];
    const gramPanchayats = ['Gram Panchayat Kachargaon', 'Gram Panchayat Mendha', 'Gram Panchayat Central'];
    const tehsils = ['Seoni', 'Kurkheda', 'Gondia', 'Hinganghat', 'Chikhaldara'];

    const selectedVillage = villages[Math.floor(Math.random() * villages.length)];
    const selectedName = [...maleNames, ...femaleNames][Math.floor(Math.random() * (maleNames.length + femaleNames.length))];
    const selectedSpouse = femaleNames[Math.floor(Math.random() * femaleNames.length)];
    const selectedDistrict = districts[Math.floor(Math.random() * districts.length)];
    const selectedState = states[Math.floor(Math.random() * states.length)];
    const selectedGramPanchayat = gramPanchayats[Math.floor(Math.random() * gramPanchayats.length)];
    const selectedTehsil = tehsils[Math.floor(Math.random() * tehsils.length)];
    
    const totalArea = parseFloat((1 + Math.random() * 4).toFixed(2)); // 1-5 hectares

    // Generate family members
    const familyMembers = [
      { name: selectedSpouse, age: 25 + Math.floor(Math.random() * 15), relation: 'Spouse' },
      { name: 'Ravi Kumar', age: 8 + Math.floor(Math.random() * 12), relation: 'Son' },
      { name: 'Meera Kumari', age: 6 + Math.floor(Math.random() * 10), relation: 'Daughter' }
    ];

    // Distribute area across different types
    const habitationArea = parseFloat((totalArea * 0.3).toFixed(2));
    const cultivationArea = parseFloat((totalArea * 0.6).toFixed(2));
    const remainingArea = parseFloat((totalArea - habitationArea - cultivationArea).toFixed(2));

    return {
      claimantName: selectedName,
      spouseName: selectedSpouse,
      fatherMotherName: 'Late Govind Rao',
      address: `Village ${selectedVillage}, Post ${selectedVillage}`,
      village: selectedVillage,
      gramPanchayat: selectedGramPanchayat,
      tehsilTaluka: selectedTehsil,
      district: selectedDistrict,
      state: selectedState,
      scheduledTribe: Math.random() > 0.5 ? 'Yes' : 'No',
      scheduledTribeCertificate: 'ST Certificate No. ST/2020/1234',
      otherTraditionalForestDweller: Math.random() > 0.5 ? 'Yes' : 'No',
      spouseScheduledTribe: 'Yes',
      familyMembers: familyMembers,
      landForHabitation: habitationArea,
      landForSelfCultivation: cultivationArea,
      disputedLands: remainingArea > 0 ? remainingArea : 0,
      pattasLeasesGrants: 0,
      landForRehabilitationAlternative: 0,
      landDisplacedWithoutCompensation: 0,
      claimId: uniqueClaimId,
      area: totalArea.toString(),
      surveyNumber: `SY-${Math.floor(Math.random() * 9999) + 1000}`,
      rawText: `FORM – A\nCLAIM FORM FOR RIGHTS TO FOREST LAND\n\n1. Name of the claimant: ${selectedName}\n2. Name of the spouse: ${selectedSpouse}\n3. Name of father/mother: Late Govind Rao\n4. Address: Village ${selectedVillage}, Post ${selectedVillage}\n5. Village: ${selectedVillage}\n6. Gram Panchayat: ${selectedGramPanchayat}\n7. Tehsil/Taluka: ${selectedTehsil}\n8. District: ${selectedDistrict}\n9. (a) Scheduled Tribe: Yes\n   (b) Other Traditional Forest Dweller: No\n10. Family members: ${familyMembers.map(m => `${m.name} (${m.age} years, ${m.relation})`).join(', ')}\n\nNature of claim on land:\n1. Extent of forest land occupied\n   (a) for habitation: ${habitationArea} hectares\n   (b) for self-cultivation: ${cultivationArea} hectares\n   Total area: ${totalArea} hectares\n\nExtracted with ${confidence.toFixed(1)}% confidence.`,
      confidence: Math.round(confidence)
    };
  }

  /**
   * Process uploaded file and extract structured data
   */
  async processFile(filePath: string, mimeType: string): Promise<OCRResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found for OCR processing");
    }

    // Get file stats for processing simulation
    const fileStats = fs.statSync(filePath);
    const fileSizeKB = fileStats.size / 1024;

    // Simulate different confidence based on file type and size
    let baseConfidence = 85;
    
    if (mimeType === 'application/pdf') {
      baseConfidence = 90; // PDFs typically have better OCR results
    } else if (mimeType.startsWith('image/')) {
      baseConfidence = 75; // Images might have lower quality
    }

    // Adjust confidence based on file size (larger files might have better resolution)
    if (fileSizeKB > 1000) {
      baseConfidence += 5;
    } else if (fileSizeKB < 100) {
      baseConfidence -= 10;
    }

    // Add some randomness to simulate real-world variability
    const finalConfidence = Math.max(15, Math.min(98, 
      baseConfidence + (Math.random() * 20 - 10)
    ));

    // Generate unique claim ID for each processing
    const timestamp = Date.now().toString().slice(-4);
    const uniqueClaimId = `FRA-2024-${timestamp}`;

    // Generate comprehensive mock result using the new method
    let result: OCRResult = this.generateMockResult(uniqueClaimId, finalConfidence);

    // Simulate different quality results based on confidence
    if (result.confidence < 50) {
      // Low confidence - introduce some errors or missing fields
      result.district = result.district ? "[UNCLEAR]" : undefined;
      result.surveyNumber = "[ILLEGIBLE]";
      result.rawText = result.rawText.replace(/\d/g, (match) => 
        Math.random() > 0.7 ? "?" : match
      );
    } else if (result.confidence < 75) {
      // Medium confidence - some uncertainty
      result.rawText += "\n[Some text unclear due to image quality]";
    }

    console.log(`OCR processed file: ${filePath}, confidence: ${result.confidence}%`);

    // Auto-fill missing entities using lightweight NLP extraction
    try {
      const entities = await this.extractEntities(result.rawText || "");
      if (!result.claimantName && entities.names[0]) {
        result = { ...result, claimantName: entities.names[0] };
      }
      if (!result.village && entities.villages[0]) {
        result = { ...result, village: entities.villages[0] };
      }
      if (!result.claimId && entities.ids[0]) {
        result = { ...result, claimId: entities.ids[0] };
      }
      if (!result.area && entities.areas[0]) {
        result = { ...result, area: entities.areas[0] };
      }
    } catch (err) {
      console.warn("Entity extraction failed:", err);
    }

    return result;
  }

  /**
   * Reprocess file with manual corrections
   */
  async reprocessWithCorrections(
    filePath: string, 
    corrections: Partial<OCRResult>
  ): Promise<OCRResult> {
    const originalResult = await this.processFile(filePath, "application/pdf");
    
    return {
      ...originalResult,
      ...corrections,
      confidence: 100 // Manual corrections give 100% confidence
    };
  }

  /**
   * Extract entities using mock NLP processing
   */
  async extractEntities(text: string): Promise<{
    villages: string[];
    names: string[];
    areas: string[];
    ids: string[];
  }> {
    // Simulate NLP processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple regex-based entity extraction (mock implementation)
    const villages = this.extractMatches(text, /Village:\s*([A-Za-z\s]+)/gi);
    const names = this.extractMatches(text, /(?:Claimant|Name):\s*([A-Za-z\s]+)/gi);
    const areas = this.extractMatches(text, /Area:\s*([\d.]+)/gi);
    const ids = this.extractMatches(text, /(?:Claim ID|ID):\s*([A-Z0-9-]+)/gi);

    return { villages, names, areas, ids };
  }

  private extractMatches(text: string, regex: RegExp): string[] {
    const matches: string[] = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1].trim());
    }
    
    return matches;
  }
}

export const ocrService = new OCRService();
