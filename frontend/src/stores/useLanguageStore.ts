import { create } from 'zustand';
import i18n from '../i18n/i18n';
import { languages, LanguageConfig, getLanguageByCode } from '../i18n/languages';

<<<<<<< HEAD
export type SupportedLanguage =
  | 'en'
  | 'hi'
  | 'ne'
  // Arunachal Pradesh
  | 'nyishi'
  | 'adi'
  | 'galo'
  | 'monpa'
  | 'mishmi'
  // Assam
  | 'as'
  | 'brx'
  | 'karbi'
  | 'mishing'
  | 'dimasa'
  // Manipur
  | 'mni'
  | 'tangkhul'
  | 'thadou'
  | 'mao'
  // Meghalaya
  | 'kha'
  | 'garo'
  | 'pnar'
  // Mizoram
  | 'lus'
  | 'chakma'
  | 'mara'
  // Nagaland
  | 'konyak'
  | 'ao'
  | 'angami'
  | 'sema'
  | 'lotha'
  // Sikkim
  | 'bhutia'
  | 'lepcha'
  | 'limbu'
  // Tripura
  | 'kokborok'
  | 'bn';

export interface LanguageInfo {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  state: string;
  region: string;
  sampleVoiceText: string;
  speechCode?: string;
}
=======
export type SupportedLanguage = string;
>>>>>>> origin/main

interface LanguageState {
  currentLanguage: string;
  availableLanguages: LanguageConfig[];
  setLanguage: (langCode: string) => void;
}

const initialLang = localStorage.getItem('smriti_setu_language') || i18n.language || 'en';

export const useLanguageStore = create<LanguageState>((set) => ({
<<<<<<< HEAD
  currentLanguage: 'en',
  availableLanguages: [
    // Universal Default
    {
      code: 'en',
      label: 'English',
      nativeLabel: 'English',
      state: 'Universal',
      region: 'Universal / Pan-India',
      sampleVoiceText: 'Welcome to Smriti Setu, connecting memories and care.',
    },
    {
      code: 'hi',
      label: 'Hindi',
      nativeLabel: 'हिन्दी',
      state: 'National',
      region: 'National / NER Urban',
      sampleVoiceText: 'स्मृति सेतु में आपका स्वागत है, यादों और देखभाल को जोड़ते हुए।',
    },

    // 1. Arunachal Pradesh
    {
      code: 'nyishi',
      label: 'Nyishi',
      nativeLabel: 'Nyishi (নিশি)',
      state: 'Arunachal Pradesh',
      region: 'Papum Pare, East Kameng & Lower Subansiri',
      sampleVoiceText: 'Smriti Setu ho dornam, aam aji do nam nam.',
    },
    {
      code: 'adi',
      label: 'Adi',
      nativeLabel: 'Adi (আদি)',
      state: 'Arunachal Pradesh',
      region: 'East Siang, Upper Siang & Siang Valley',
      sampleVoiceText: 'Smriti Setu em lennam, simang doko.',
    },
    {
      code: 'galo',
      label: 'Galo',
      nativeLabel: 'Galo (গালো)',
      state: 'Arunachal Pradesh',
      region: 'West Siang & Lepa Rada',
      sampleVoiceText: 'Smriti Setu lo aai gaa, minam doko.',
    },
    {
      code: 'monpa',
      label: 'Monpa',
      nativeLabel: 'Monpa (མོན་པ)',
      state: 'Arunachal Pradesh',
      region: 'Tawang & West Kameng',
      sampleVoiceText: 'Smriti Setu la tashi delek, drenpa dang zhendon.',
    },
    {
      code: 'mishmi',
      label: 'Mishmi',
      nativeLabel: 'Mishmi (মিশ্মি)',
      state: 'Arunachal Pradesh',
      region: 'Dibang Valley, Lohit & Anjaw',
      sampleVoiceText: 'Smriti Setu kowa, thapa thapa mang.',
    },

    // 2. Assam
    {
      code: 'as',
      label: 'Assamese',
      nativeLabel: 'অসমীয়া (Asamiya)',
      state: 'Assam',
      region: 'Assam & Brahmaputra Valley',
      sampleVoiceText: 'স্মৃতি সেতু লৈ আপোনাক স্বাগতম, স্মৃতি আৰু সেৱাৰ এক সুন্দৰ মেলবন্ধন।',
    },
    {
      code: 'brx',
      label: 'Bodo',
      nativeLabel: 'बड़ो (Bodo)',
      state: 'Assam',
      region: 'Bodoland Territorial Region (BTR)',
      sampleVoiceText: 'स्मृति सेतुआव नोंथांखौ बरायबाय, गोसोखांथि आरो हेफाजाबनि गेजेर।',
    },
    {
      code: 'karbi',
      label: 'Karbi',
      nativeLabel: 'Karbi (কাৰ্বি)',
      state: 'Assam',
      region: 'Karbi Anglong & West Karbi Anglong',
      sampleVoiceText: 'Smriti Setu pen kachinghon, ningthe ningkan.',
    },
    {
      code: 'mishing',
      label: 'Mishing',
      nativeLabel: 'Mishing (মিচিং)',
      state: 'Assam',
      region: 'Dhemaji, Lakhimpur & Majuli',
      sampleVoiceText: 'Smriti Setu lo aipek, lu:nam do:ying.',
    },
    {
      code: 'dimasa',
      label: 'Dimasa',
      nativeLabel: 'Dimasa (দিমাচা)',
      state: 'Assam',
      region: 'Dima Hasao & Cachar Hills',
      sampleVoiceText: 'Smriti Setu ha ning hamjao, grao sangma.',
    },

    // 3. Manipur
    {
      code: 'mni',
      label: 'Manipuri (Meitei)',
      nativeLabel: 'মৈতৈলোন্ (Manipuri)',
      state: 'Manipur',
      region: 'Imphal Valley & Manipur',
      sampleVoiceText: 'স্মৃতি সেতুদা তরাম্না ওকচরি, নীংশিংবা অমসুং য়েংশিনবা।',
    },
    {
      code: 'tangkhul',
      label: 'Tangkhul',
      nativeLabel: 'Tangkhul (Ukhrul)',
      state: 'Manipur',
      region: 'Ukhrul & Kamjong Hills',
      sampleVoiceText: 'Smriti Setu li shiyan khavai, kacham kaphung.',
    },
    {
      code: 'thadou',
      label: 'Thadou',
      nativeLabel: 'Thadou (Kuki)',
      state: 'Manipur',
      region: 'Kangpokpi & Churachandpur',
      sampleVoiceText: 'Smriti Setu ah hunglhung jouse chibai.',
    },
    {
      code: 'mao',
      label: 'Mao',
      nativeLabel: 'Mao (Emela)',
      state: 'Manipur',
      region: 'Senapati & Mao-Maram',
      sampleVoiceText: 'Smriti Setu kasha, pfokho rari.',
    },

    // 4. Meghalaya
    {
      code: 'kha',
      label: 'Khasi',
      nativeLabel: 'Ka Ktien Khasi',
      state: 'Meghalaya',
      region: 'Khasi Hills & Shillong',
      sampleVoiceText: 'Khublei bad sngewbha sha ka Smriti Setu.',
    },
    {
      code: 'garo',
      label: 'Garo',
      nativeLabel: 'A·chik (Garo)',
      state: 'Meghalaya',
      region: 'Garo Hills & Tura',
      sampleVoiceText: 'Smriti Setu ona rimchaksoa, gisik ra·ani.',
    },
    {
      code: 'pnar',
      label: 'Pnar (Jaintia)',
      nativeLabel: 'Pnar (Jaintia)',
      state: 'Meghalaya',
      region: 'Jaintia Hills & Jowai',
      sampleVoiceText: 'Khublei shibun wa wan ha Smriti Setu.',
    },

    // 5. Mizoram
    {
      code: 'lus',
      label: 'Mizo',
      nativeLabel: 'Mizo ṭawng',
      state: 'Mizoram',
      region: 'Aizawl & Mizoram State',
      sampleVoiceText: 'Smriti Setu-ah kan lo lawm a che, hriatrengna leh enkawlna.',
    },
    {
      code: 'chakma',
      label: 'Chakma',
      nativeLabel: 'Chakma (𑄌𑄋𑄴𑄟)',
      state: 'Mizoram',
      region: 'Lawngtlai & CADC',
      sampleVoiceText: 'Smriti Setu tton poran, hiyari jontro.',
    },
    {
      code: 'mara',
      label: 'Mara',
      nativeLabel: 'Mara (Siaha)',
      state: 'Mizoram',
      region: 'Siaha & MADC',
      sampleVoiceText: 'Smriti Setu liata nama hmôpa alypa châ.',
    },

    // 6. Nagaland
    {
      code: 'konyak',
      label: 'Konyak',
      nativeLabel: 'Konyak Naga',
      state: 'Nagaland',
      region: 'Mon District',
      sampleVoiceText: 'Smriti Setu yang kahong, wangpa lemtou.',
    },
    {
      code: 'ao',
      label: 'Ao',
      nativeLabel: 'Ao Naga (Chungli)',
      state: 'Nagaland',
      region: 'Mokokchung District',
      sampleVoiceText: 'Smriti Setu nung pelashia agizüker, bilemtettsü.',
    },
    {
      code: 'angami',
      label: 'Angami',
      nativeLabel: 'Angami (Tenyidie)',
      state: 'Nagaland',
      region: 'Kohima & Dimapur',
      sampleVoiceText: 'Smriti Setu nu vorpu vi, kemenyhu kenia.',
    },
    {
      code: 'sema',
      label: 'Sema (Sumi)',
      nativeLabel: 'Sumi Naga',
      state: 'Nagaland',
      region: 'Zunheboto District',
      sampleVoiceText: 'Smriti Setu lhou aloi, kupusu kumghu.',
    },
    {
      code: 'lotha',
      label: 'Lotha',
      nativeLabel: 'Lotha Naga',
      state: 'Nagaland',
      region: 'Wokha District',
      sampleVoiceText: 'Smriti Setu lo engena omho, nchum nzan.',
    },

    // 7. Sikkim
    {
      code: 'bhutia',
      label: 'Sikkimese (Bhutia)',
      nativeLabel: 'Bhutia (འབྲས་ལྗོངས་སྐད)',
      state: 'Sikkim',
      region: 'North & East Sikkim',
      sampleVoiceText: 'Smriti Setu la tashi delek, sume chhoyig.',
    },
    {
      code: 'lepcha',
      label: 'Lepcha',
      nativeLabel: 'Lepcha (ᰛᰩᰵ)',
      state: 'Sikkim',
      region: 'Dzongu & West Sikkim',
      sampleVoiceText: 'Smriti Setu ka aachulay, chhyomuk sung.',
    },
    {
      code: 'limbu',
      label: 'Limbu',
      nativeLabel: 'Limbu (ᤕᤠᤰᤌᤢᤱ)',
      state: 'Sikkim',
      region: 'West Sikkim & Hill Region',
      sampleVoiceText: 'Smriti Setu o sewaro, themba themba.',
    },

    // 8. Tripura
    {
      code: 'kokborok',
      label: 'Kokborok',
      nativeLabel: 'Kokborok (ককবরক)',
      state: 'Tripura',
      region: 'Tripura Tribal Areas (TTAADC)',
      sampleVoiceText: 'Smriti Setu-o nungno kubui khakchangma, kharok tei joton.',
    },
    {
      code: 'bn',
      label: 'Bengali',
      nativeLabel: 'বাংলা (Bangla)',
      state: 'Tripura',
      region: 'Tripura & Agartala',
      sampleVoiceText: 'স্মৃতি সেতুতে আপনাকে স্বাগতম, স্মৃতি এবং যত্নের মিলন।',
    },
  ],
  setLanguage: (lang) => {
    i18n.changeLanguage(lang);
    set({ currentLanguage: lang });
=======
  currentLanguage: initialLang,
  availableLanguages: languages,
  setLanguage: (langCode: string) => {
    i18n.changeLanguage(langCode);
    set({ currentLanguage: langCode });
>>>>>>> origin/main
  },
}));

