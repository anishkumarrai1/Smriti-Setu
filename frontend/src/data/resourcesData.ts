import { GovResource } from '../types/govPortal';

export const sampleResourcesData: GovResource[] = [
  {
    id: 'res-1',
    title: 'Patient & Family Memory Care Handbook',
    category: 'Patient',
    format: 'PDF',
    size: '2.4 MB',
    language: 'English / Assamese / Hindi',
    description: 'Practical guide for senior citizens and family members on daily memory exercises, hydration, and peaceful routines.',
  },
  {
    id: 'res-2',
    title: 'Caregiver Memory Garden & Reminders Setup Guide',
    category: 'Caregiver',
    format: 'PDF',
    size: '1.8 MB',
    language: 'English / Bengali',
    description: 'Instructions for caregivers on creating photo timelines, setting medicine reminders, and tracking activity difficulty.',
  },
  {
    id: 'res-3',
    title: 'Clinician Protocol for Adaptive Cognitive Assessment',
    category: 'Clinical',
    format: 'PDF',
    size: '3.1 MB',
    language: 'English',
    description: 'Clinical manual detailing session score interpretation, adaptive difficulty shifts, and telemetry review.',
  },
  {
    id: 'res-4',
    title: 'Regional Language Voice Packs (Assamese & Bengali)',
    category: 'Language Pack',
    format: 'Audio',
    size: '14.2 MB',
    language: 'Assamese / Bengali',
    description: 'Voice audio prompts for text-to-speech interaction across regional cognitive activities.',
  },
];
