// Extensible Language Configuration for SMRITI-SETU North-East India (NER) Platform
// Simplified to approved 8 unique languages

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  label: string; // Alias for name (backward compatibility)
  nativeLabel: string; // Alias for nativeName (backward compatibility)
  sampleVoiceText: string;
  state: string;
  region: string;
  direction: 'ltr' | 'rtl';
  fallbackCode: string;
}

export const NER_STATES = [
  'Common',
  'Assam',
  'Manipur',
  'Mizoram',
  'Sikkim',
  'Tripura',
] as const;

export type NERStateName = typeof NER_STATES[number];

export const languages: LanguageConfig[] = [
  // ALL NER / COMMON
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    label: 'English',
    nativeLabel: 'English',
    sampleVoiceText: 'Welcome to Smriti Setu, connecting memories and care across North-East India.',
    state: 'Common',
    region: 'All NER',
    direction: 'ltr',
    fallbackCode: 'en',
  },

  // ASSAM
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    label: 'Assamese',
    nativeLabel: 'অসমীয়া',
    sampleVoiceText: 'স্মৃতি সেতু লৈ আপোনাক স্বাগতম, স্মৃতি আৰু সেৱাৰ এক সুন্দৰ মেলবন্ধন।',
    state: 'Assam',
    region: 'Assam',
    direction: 'ltr',
    fallbackCode: 'en',
  },
  {
    code: 'brx',
    name: 'Bodo',
    nativeName: 'बर’',
    label: 'Bodo',
    nativeLabel: 'बर’',
    sampleVoiceText: 'स्मृति सेतुआव नोंथांखौ बरायबाय, गोसोखांथि आरो हेफाजाबनि गेजेर।',
    state: 'Assam',
    region: 'Assam',
    direction: 'ltr',
    fallbackCode: 'as',
  },

  // MANIPUR
  {
    code: 'mni',
    name: 'Manipuri (Meiteilon)',
    nativeName: 'মৈতৈলোন্ (Meiteilon)',
    label: 'Manipuri (Meiteilon)',
    nativeLabel: 'মৈতৈলোন্ (Meiteilon)',
    sampleVoiceText: 'স্মৃতি-সেতুদা অদোমবু তরাম্না ওকচরি।',
    state: 'Manipur',
    region: 'Manipur',
    direction: 'ltr',
    fallbackCode: 'en',
  },

  // MIZORAM
  {
    code: 'lus',
    name: 'Mizo',
    nativeName: 'Mizo ṭawng',
    label: 'Mizo',
    nativeLabel: 'Mizo ṭawng',
    sampleVoiceText: 'Smriti Setu-ah chibai leh lo lawm a che u.',
    state: 'Mizoram',
    region: 'Mizoram',
    direction: 'ltr',
    fallbackCode: 'en',
  },

  // SIKKIM
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    label: 'Nepali',
    nativeLabel: 'नेपाली',
    sampleVoiceText: 'स्मृति सेतुमा तपाईंलाई हार्दिक स्वागत छ, सम्झना र हेरचाहको सेतु।',
    state: 'Sikkim',
    region: 'Sikkim',
    direction: 'ltr',
    fallbackCode: 'en',
  },

  // TRIPURA
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    label: 'Bengali',
    nativeLabel: 'বাংলা',
    sampleVoiceText: 'স্মৃতি সেতুতে আপনাকে স্বাগতম, স্মৃতি এবং যত্নের মিলন।',
    state: 'Tripura',
    region: 'Tripura & Assam',
    direction: 'ltr',
    fallbackCode: 'en',
  },
  {
    code: 'trp',
    name: 'Kokborok',
    nativeName: 'Kokborok',
    label: 'Kokborok',
    nativeLabel: 'Kokborok',
    sampleVoiceText: 'Smriti Setu o nogo kahamiyok Kokborok bai.',
    state: 'Tripura',
    region: 'Tripura',
    direction: 'ltr',
    fallbackCode: 'bn',
  },
];

export const DEFAULT_LANGUAGE_CODE = 'en';

export const getLanguageByCode = (code: string): LanguageConfig => {
  return (
    languages.find((lang) => lang.code.toLowerCase() === code.toLowerCase()) ||
    languages[0]
  );
};

export const getLanguagesByState = (state: string): LanguageConfig[] => {
  if (state === 'All') return languages;
  return languages.filter((lang) => lang.state === state);
};

export const getFallbackChain = (code: string): string[] => {
  const lang = getLanguageByCode(code);
  const chain: string[] = [lang.code];
  if (lang.fallbackCode && !chain.includes(lang.fallbackCode)) {
    chain.push(lang.fallbackCode);
  }
  if (!chain.includes('en')) chain.push('en');
  return chain;
};
