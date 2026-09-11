import { GovUpdate } from '../types/govPortal';

export const sampleUpdatesData: GovUpdate[] = [
  {
    id: 'upd-1',
    date: '28 Aug 2026',
    category: 'Camp',
    title: 'Regional Cognitive Health Screening Camps Launched in Kamrup Metro & East Khasi Hills',
    summary: 'Free memory screening camps and Smriti-Setu caregiver onboarding workshops commenced at GMCH Guwahati and Civil Hospital Shillong.',
    isUrgent: true,
  },
  {
    id: 'upd-2',
    date: '25 Aug 2026',
    category: 'Guideline',
    title: 'Updated Caregiver Guidelines Released for Elderly Cognitive Care',
    summary: 'Ministry releases new multilingual practical handbook for family memory garden creation and daily routine reminders.',
    isUrgent: false,
  },
  {
    id: 'upd-3',
    date: '20 Aug 2026',
    category: 'Notice',
    title: 'Tele-MANAS & Elderly Helpline 14567 Service Capacity Expanded Across NER States',
    summary: '24x7 toll-free mental health helpline now supports Assamese, Bengali, Khasi, Mizo, and Meiteilon languages.',
    isUrgent: false,
  },
];
