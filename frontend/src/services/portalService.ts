import { 
  HealthFacility, 
  NERState, 
  HealthServiceCategory, 
  GovProgram, 
  GovUpdate, 
  GovResource, 
  GovPortalFilters 
} from '../types/govPortal';

import { nerStatesData } from '../data/statesData';
import { sampleFacilitiesData } from '../data/facilitiesData';
import { sampleHealthServicesData } from '../data/healthServicesData';
import { sampleProgramsData } from '../data/programsData';
import { sampleUpdatesData } from '../data/updatesData';
import { sampleResourcesData } from '../data/resourcesData';
import { apiClient } from './api';

export const portalService = {
  getStates: async (): Promise<NERState[]> => {
    try {
      const res = await apiClient.get('/portal/states');
      return res.data;
    } catch {
      return Promise.resolve(nerStatesData);
    }
  },

  getStateByCode: async (code: string): Promise<NERState | undefined> => {
    try {
      const res = await apiClient.get(`/portal/states/${code}`);
      return res.data;
    } catch {
      return Promise.resolve(
        nerStatesData.find((s) => s.code === code || s.name.toLowerCase() === code.toLowerCase())
      );
    }
  },

  getHealthServices: async (): Promise<HealthServiceCategory[]> => {
    try {
      const res = await apiClient.get('/portal/services');
      return res.data;
    } catch {
      return Promise.resolve(sampleHealthServicesData);
    }
  },

  searchFacilities: async (filters: GovPortalFilters): Promise<HealthFacility[]> => {
    try {
      const params = new URLSearchParams();
      if (filters.searchQuery) params.set('searchQuery', filters.searchQuery);
      if (filters.selectedState && filters.selectedState !== 'All') {
        params.set('state', filters.selectedState);
      }
      if (filters.selectedDistrict && filters.selectedDistrict !== 'All') {
        params.set('district', filters.selectedDistrict);
      }
      if (filters.selectedType && filters.selectedType !== 'All') {
        params.set('type', filters.selectedType);
      }
      if (filters.hasCognitiveOnly) {
        params.set('hasCognitiveOnly', 'true');
      }

      const res = await apiClient.get(`/portal/facilities?${params.toString()}`);
      return res.data;
    } catch {
      // Offline fallback: filter locally
      let result = [...sampleFacilitiesData];

      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        result = result.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.district.toLowerCase().includes(q) ||
            f.state.toLowerCase().includes(q) ||
            f.services.some((s) => s.toLowerCase().includes(q))
        );
      }

      if (filters.selectedState && filters.selectedState !== 'All') {
        result = result.filter((f) => f.state.toLowerCase() === filters.selectedState?.toLowerCase());
      }

      if (filters.selectedDistrict && filters.selectedDistrict !== 'All') {
        result = result.filter((f) => f.district.toLowerCase() === filters.selectedDistrict?.toLowerCase());
      }

      if (filters.selectedType && filters.selectedType !== 'All') {
        result = result.filter((f) => f.type === filters.selectedType);
      }

      if (filters.hasCognitiveOnly) {
        result = result.filter((f) => f.hasCognitiveCare);
      }

      return Promise.resolve(result);
    }
  },

  getPrograms: async (): Promise<GovProgram[]> => {
    try {
      const res = await apiClient.get('/portal/programs');
      return res.data;
    } catch {
      return Promise.resolve(sampleProgramsData);
    }
  },

  getUpdates: async (): Promise<GovUpdate[]> => {
    try {
      const res = await apiClient.get('/portal/updates');
      return res.data;
    } catch {
      return Promise.resolve(sampleUpdatesData);
    }
  },

  getResources: async (): Promise<GovResource[]> => {
    try {
      const res = await apiClient.get('/portal/resources');
      return res.data;
    } catch {
      return Promise.resolve(sampleResourcesData);
    }
  },
};
