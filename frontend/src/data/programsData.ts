import { GovProgram } from '../types/govPortal';

export const sampleProgramsData: GovProgram[] = [
  {
    id: 'prog-1',
    title: 'North Eastern Regional Cognitive Health Initiative',
    department: 'North Eastern Council (NEC) & Ministry of Health',
    description: 'Deployment of stationary ESP32 cognitive assistance gateways and digital memory care tools across regional medical centers in all 8 NER states.',
    targetAudience: 'Elderly Patients & Primary Caregivers',
    coverage: 'All 8 North Eastern States',
    linkText: 'Read Program Details',
  },
  {
    id: 'prog-2',
    title: 'National Programme for Healthcare of the Elderly (NPHCE)',
    department: 'Ministry of Health & Family Welfare',
    description: 'Dedicated geriatric outpatient clinics, regional medical college nodes, and community health worker training for elderly wellness.',
    targetAudience: 'Senior Citizens Aged 60+',
    coverage: 'Nationwide & NER Districts',
    linkText: 'Explore NPHCE Guidelines',
  },
  {
    id: 'prog-3',
    title: 'Ayushman Bharat PM-JAY & Digital Health Mission',
    department: 'National Health Authority (NHA)',
    description: 'Ayushman Bharat ABHA health ID integration for seamless cognitive activity records, clinical summaries, and facility referrals.',
    targetAudience: 'Citizens & Regional Facilities',
    coverage: 'Pan-India',
    linkText: 'Access ABHA Integration',
  },
];
