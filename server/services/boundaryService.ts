// Service for generating random boundary geometry based on village location
export interface VillageLocation {
  village: string;
  lat: number;
  lng: number;
  district?: string;
  state?: string;
}

// Mock database of village coordinates (in a real app, this would be from a geodatabase)
const VILLAGE_COORDINATES: Record<string, VillageLocation> = {
  'kachargaon': { village: 'Kachargaon', lat: 20.5937, lng: 78.9629, district: 'Seoni', state: 'Madhya Pradesh' },
  'mendha': { village: 'Mendha', lat: 20.1376, lng: 79.2963, district: 'Gadchiroli', state: 'Maharashtra' },
  'bamni': { village: 'Bamni', lat: 21.8974, lng: 79.6512, district: 'Gondia', state: 'Maharashtra' },
  'navegaon': { village: 'Navegaon', lat: 21.0285, lng: 79.2108, district: 'Wardha', state: 'Maharashtra' },
  'dhamangaon': { village: 'Dhamangaon', lat: 20.7476, lng: 77.3463, district: 'Amravati', state: 'Maharashtra' },
  'pench': { village: 'Pench', lat: 21.6093, lng: 79.2961, district: 'Seoni', state: 'Madhya Pradesh' },
  'tadoba': { village: 'Tadoba', lat: 20.2091, lng: 79.3370, district: 'Chandrapur', state: 'Maharashtra' },
  'chikhaldara': { village: 'Chikhaldara', lat: 21.2667, lng: 77.4667, district: 'Amravati', state: 'Maharashtra' },
  'melghat': { village: 'Melghat', lat: 21.2500, lng: 77.2500, district: 'Amravati', state: 'Maharashtra' },
  'satpura': { village: 'Satpura', lat: 22.5000, lng: 78.0000, district: 'Hoshangabad', state: 'Madhya Pradesh' },
};

export class BoundaryService {
  /**
   * Generate a random polygon boundary around a village location
   * @param village Village name
   * @param areaHectares Area of the plot in hectares
   * @returns GeoJSON polygon geometry
   */
  static generateRandomBoundary(village: string, areaHectares: number): any {
    const villageKey = village.toLowerCase().trim();
    
    // Try to find exact match first, then partial match
    let villageLocation = VILLAGE_COORDINATES[villageKey];
    if (!villageLocation) {
      // Look for partial matches
      const partialMatch = Object.keys(VILLAGE_COORDINATES).find(key => 
        key.includes(villageKey) || villageKey.includes(key)
      );
      if (partialMatch) {
        villageLocation = VILLAGE_COORDINATES[partialMatch];
      }
    }
    
    // If no match found, use a default location in central India
    if (!villageLocation) {
      villageLocation = {
        village: village,
        lat: 21.0000 + (Math.random() - 0.5) * 2, // Random location in central India
        lng: 78.0000 + (Math.random() - 0.5) * 2,
        district: 'Unknown',
        state: 'Maharashtra'
      };
    }

    // Generate a random polygon around the village center
    const centerLat = villageLocation.lat;
    const centerLng = villageLocation.lng;
    
    // Calculate approximate radius in degrees for the given area
    // 1 hectare ≈ 0.001 degrees radius (very rough approximation)
    const baseRadius = Math.sqrt(areaHectares) * 0.001;
    const radiusVariation = baseRadius * 0.3; // 30% variation
    
    // Generate a polygon with 6-8 vertices
    const numVertices = 6 + Math.floor(Math.random() * 3);
    const coordinates: number[][] = [];
    
    for (let i = 0; i < numVertices; i++) {
      const angle = (2 * Math.PI * i) / numVertices;
      // Add some randomness to make it look more natural
      const randomRadius = baseRadius + (Math.random() - 0.5) * radiusVariation;
      const randomAngle = angle + (Math.random() - 0.5) * 0.3; // ±17 degrees variation
      
      const lat = centerLat + randomRadius * Math.cos(randomAngle);
      const lng = centerLng + randomRadius * Math.sin(randomAngle);
      
      coordinates.push([lng, lat]); // GeoJSON uses [longitude, latitude]
    }
    
    // Close the polygon by adding the first point at the end
    coordinates.push(coordinates[0]);
    
    return {
      type: 'Polygon',
      coordinates: [coordinates]
    };
  }
  
  /**
   * Get village location data for a given village name
   * @param village Village name
   * @returns Village location data or null if not found
   */
  static getVillageLocation(village: string): VillageLocation | null {
    const villageKey = village.toLowerCase().trim();
    
    // Try exact match first
    let villageLocation = VILLAGE_COORDINATES[villageKey];
    if (villageLocation) {
      return villageLocation;
    }
    
    // Try partial match
    const partialMatch = Object.keys(VILLAGE_COORDINATES).find(key => 
      key.includes(villageKey) || villageKey.includes(key)
    );
    
    return partialMatch ? VILLAGE_COORDINATES[partialMatch] : null;
  }
  
  /**
   * List all available villages in the database
   * @returns Array of village location data
   */
  static getAllVillages(): VillageLocation[] {
    return Object.values(VILLAGE_COORDINATES);
  }
}