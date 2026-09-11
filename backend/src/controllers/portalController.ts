import { Request, Response } from 'express';
import { dataStore } from '../store/dataStore';
import { GovPortalFilters } from '../types/govPortal';

export const getStates = (req: Request, res: Response) => {
  try {
    const states = dataStore.getStates();
    res.json(states);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve states', details: error.message });
  }
};

export const getStateByCode = (req: Request, res: Response) => {
  try {
    const code = req.params.code as string;
    const state = dataStore.getStateByCode(code);
    if (!state) {
      res.status(404).json({ error: `State with code or name '${code}' not found` });
      return;
    }
    res.json(state);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve state', details: error.message });
  }
};

export const getFacilities = (req: Request, res: Response) => {
  try {
    const filters: GovPortalFilters = {
      searchQuery: req.query.searchQuery as string | undefined,
      selectedState: req.query.state as string | undefined,
      selectedDistrict: req.query.district as string | undefined,
      selectedType: req.query.type as string | undefined,
      hasCognitiveOnly: req.query.hasCognitiveOnly === 'true',
    };

    const facilities = dataStore.searchFacilities(filters);
    res.json(facilities);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve facilities', details: error.message });
  }
};

export const getServices = (req: Request, res: Response) => {
  try {
    const services = dataStore.getHealthServices();
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve services', details: error.message });
  }
};

export const getPrograms = (req: Request, res: Response) => {
  try {
    const programs = dataStore.getPrograms();
    res.json(programs);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve programs', details: error.message });
  }
};

export const getUpdates = (req: Request, res: Response) => {
  try {
    const updates = dataStore.getUpdates();
    res.json(updates);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve updates', details: error.message });
  }
};

export const getResources = (req: Request, res: Response) => {
  try {
    const resources = dataStore.getResources();
    res.json(resources);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve resources', details: error.message });
  }
};
