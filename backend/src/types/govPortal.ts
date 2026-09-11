// TypeScript Interfaces for Public NER Government Healthcare Portal Backend

export type NERStateCode = 'AS' | 'AR' | 'MN' | 'ML' | 'MZ' | 'NL' | 'SK' | 'TR';

export interface NERState {
  code: NERStateCode;
  name: string;
  capital: string;
  districtsCount: number;
  totalFacilities: number;
  cognitiveCareNodes: number;
  primaryLanguage: string;
  districts: string[];
  description: string;
  imageUrl: string;
}

export type FacilityType = 
  | 'Medical College Hospital'
  | 'District Hospital'
  | 'Sub-Divisional Hospital'
  | 'Community Health Centre (CHC)'
  | 'Primary Health Centre (PHC)'
  | 'Specialized Cognitive Care Centre';

export interface HealthFacility {
  id: string;
  name: string;
  state: string;
  stateCode: NERStateCode;
  district: string;
  type: FacilityType;
  address: string;
  contactNumber: string;
  emergencyNumber?: string;
  services: string[];
  bedCapacity?: number;
  hasCognitiveCare: boolean;
  sampleDataFlag: boolean;
}

export interface HealthServiceCategory {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: string;
  featured: boolean;
  actionLabel: string;
}

export interface GovProgram {
  id: string;
  title: string;
  department: string;
  description: string;
  targetAudience: string;
  coverage: string;
  linkText: string;
}

export interface GovUpdate {
  id: string;
  date: string;
  category: 'Bulletin' | 'Notice' | 'Guideline' | 'Camp';
  title: string;
  summary: string;
  isUrgent?: boolean;
}

export interface GovResource {
  id: string;
  title: string;
  category: 'Patient' | 'Caregiver' | 'Clinical' | 'Language Pack';
  format: 'PDF' | 'Guide' | 'Audio';
  size: string;
  language: string;
  description: string;
}

export interface GovPortalFilters {
  searchQuery?: string;
  selectedState?: string;
  selectedDistrict?: string;
  selectedType?: string;
  hasCognitiveOnly?: boolean;
}
