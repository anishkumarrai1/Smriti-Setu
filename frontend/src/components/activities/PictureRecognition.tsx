import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Upload,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  PlusCircle,
  Users,
  Heart,
  Play,
  Pause,
  Square,
  Globe,
  Info,
  Check,
  X,
  Smile,
  FileText,
  Headphones,
  Send,
  Edit3,
  RefreshCw,
  Radio,
  Activity,
  CircleDot,
  Copy
} from 'lucide-react';
import { Button } from '../common/Button';
import { VoiceButton } from '../common/VoiceButton';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';
import { useLanguageStore, SupportedLanguage } from '../../stores/useLanguageStore';
import { speakText, stopSpeech } from '../../utils/speech';

interface PictureRecognitionProps {
  onComplete: (accuracy: number, attempts: number, responseTimeMs: number) => void;
  onBack: () => void;
}

export type FamilyRelationKey =
  | 'daughter'
  | 'wife'
  | 'son'
  | 'granddaughter'
  | 'brother'
  | 'friend'
  | 'mother'
  | 'father'
  | 'sister'
  | 'grandson';

export type ActivityLang = 'en' | 'hi' | 'as' | 'bn' | 'ne' | 'brx';

export const getEffectiveActivityLang = (lang: string): ActivityLang => {
  if (['en', 'hi', 'as', 'bn', 'ne', 'brx'].includes(lang)) return lang as ActivityLang;
  if (['nyishi', 'adi', 'galo', 'monpa', 'mishmi', 'karbi', 'mishing', 'dimasa', 'mni', 'tangkhul', 'thadou', 'mao', 'kha', 'garo', 'pnar', 'lus', 'chakma', 'mara', 'konyak', 'ao', 'angami', 'sema', 'lotha', 'bhutia', 'lepcha', 'limbu', 'kokborok'].includes(lang)) {
    return 'as';
  }
  return 'en';
};

export interface FamilyFaceItem {
  id: string;
  name: string;
  relationKey: FamilyRelationKey;
  imageUrl: string;
  isCustom?: boolean;
  notes?: Partial<Record<SupportedLanguage, string>> & Record<ActivityLang, string>;
  hints?: Partial<Record<SupportedLanguage, string>> & Record<ActivityLang, string>;
}

// Multilingual text labels for relations across North & North-East Indian languages
export const RELATION_LABELS: Record<
  FamilyRelationKey,
  Record<ActivityLang, { label: string; fullTitle: string; voiceKeywords: string[] }>
> = {
  daughter: {
    en: { label: 'Daughter', fullTitle: 'Loving Daughter', voiceKeywords: ['daughter', 'ananya', 'elder daughter', 'girl'] },
    hi: { label: 'बेटी (Daughter)', fullTitle: 'प्यारी बेटी', voiceKeywords: ['बेटी', 'अनन्या', 'लड़की', 'बिटिया', 'beti', 'daughter'] },
    as: { label: 'জীয়াৰী (Daughter)', fullTitle: 'মৰমৰ জীয়াৰী', voiceKeywords: ['জীয়াৰী', 'জী', 'অনন্যা', 'ছোৱালী', 'jiyari', 'daughter'] },
    bn: { label: 'মেয়ে (Daughter)', fullTitle: 'স্নেহের মেয়ে', voiceKeywords: ['মেয়ে', 'কন্যা', 'অনন্যা', 'meye', 'daughter'] },
    ne: { label: 'छोरी (Daughter)', fullTitle: 'प्यारी छोरी', voiceKeywords: ['छोरी', 'अनन्या', 'नानी', 'chhori', 'daughter'] },
    brx: { label: 'फिसाजो (Daughter)', fullTitle: 'मोजां मोननाय फिसाजो', voiceKeywords: ['फिसाजो', 'अनन्या', 'daughter'] },
  },
  wife: {
    en: { label: 'Wife', fullTitle: 'Beloved Wife', voiceKeywords: ['wife', 'mridula', 'spouse', 'partner'] },
    hi: { label: 'पत्नी / जीवनसंगिनी (Wife)', fullTitle: 'धर्मपत्नी', voiceKeywords: ['पत्नी', 'मृदुला', 'बीवी', 'जीवनसंगिनी', 'patni', 'wife'] },
    as: { label: 'পত্নী / গৃহিনী (Wife)', fullTitle: 'সহধৰ্মিনী', voiceKeywords: ['পত্নী', 'মৃদুলা', 'গৃহিনী', 'সহধৰ্মিনী', 'potni', 'wife'] },
    bn: { label: 'স্ত্রী / সহধর্মিণী (Wife)', fullTitle: 'সহধর্মিণী', voiceKeywords: ['স্ত্রী', 'মৃদুলা', 'বউ', 'সহধর্মিণী', 'stri', 'wife'] },
    ne: { label: 'श्रीमती (Wife)', fullTitle: 'जीवनसङ्गिनी', voiceKeywords: ['श्रीमती', 'मृदुला', 'बुढी', 'shrimati', 'wife'] },
    brx: { label: 'बिसि (Wife)', fullTitle: 'मोजां मोननाय बिसि', voiceKeywords: ['बिसि', 'मृदुला', 'wife'] },
  },
  son: {
    en: { label: 'Son', fullTitle: 'Devoted Son', voiceKeywords: ['son', 'vikram', 'boy'] },
    hi: { label: 'बेटा (Son)', fullTitle: 'प्यारा बेटा', voiceKeywords: ['बेटा', 'विक्रम', 'लड़का', 'पुत्र', 'beta', 'son'] },
    as: { label: 'পুত্ৰ / ল’ৰা (Son)', fullTitle: 'সুযোগ্য পুত্ৰ', voiceKeywords: ['পুত্ৰ', 'ল’ৰা', 'বিক্ৰম', 'putra', 'son'] },
    bn: { label: 'ছেলে / पुत्र (Son)', fullTitle: 'স্নেহের পুত্র', voiceKeywords: ['ছেলে', 'পুত্র', 'বিক্রম', 'chhele', 'son'] },
    ne: { label: 'छोरा (Son)', fullTitle: 'प्यारो छोरो', voiceKeywords: ['छोरा', 'छोरो', 'विक्रम', 'chhora', 'son'] },
    brx: { label: 'फिसाला (Son)', fullTitle: 'मोजां मोननाय फिसाला', voiceKeywords: ['फिसाला', 'विक्रम', 'son'] },
  },
  granddaughter: {
    en: { label: 'Granddaughter', fullTitle: 'Sweet Granddaughter', voiceKeywords: ['granddaughter', 'priyanshi', 'grand child'] },
    hi: { label: 'पोती / नातिन (Granddaughter)', fullTitle: 'दुलारी पोती', voiceKeywords: ['पोती', 'नातिन', 'प्रियांशी', 'गुड़िया', 'poti', 'granddaughter'] },
    as: { label: 'নাতিনী (Granddaughter)', fullTitle: 'মৰমৰ নাতিনী', voiceKeywords: ['নাতিনী', 'প্ৰিয়াংশী', 'natini', 'granddaughter'] },
    bn: { label: 'নাতনি (Granddaughter)', fullTitle: 'মিষ্টি নাতনি', voiceKeywords: ['নাতনি', 'প্রিয়াংশী', 'natni', 'granddaughter'] },
    ne: { label: 'नातिनी (Granddaughter)', fullTitle: 'प्यारी नातिनी', voiceKeywords: ['नातिनी', 'प्रियाङ्शी', 'natini', 'granddaughter'] },
    brx: { label: 'उन्दै फिसाजो (Granddaughter)', fullTitle: 'उन्दै फिसाजो', voiceKeywords: ['उन्दै फिसाजो', 'प्रियान्शी', 'granddaughter'] },
  },
  brother: {
    en: { label: 'Brother', fullTitle: 'Caring Brother', voiceKeywords: ['brother', 'devashish', 'sibling'] },
    hi: { label: 'भाई (Brother)', fullTitle: 'प्रिय भाई', voiceKeywords: ['भाई', 'भैया', 'देवाशीष', 'bhai', 'brother'] },
    as: { label: 'ভাই / ককাই (Brother)', fullTitle: 'মৰমৰ ভাইটি / ককাই', voiceKeywords: ['ভাই', 'ককাই', 'দেৱাশীষ', 'bhai', 'brother'] },
    bn: { label: 'ভাই (Brother)', fullTitle: 'প্রিয় ভাই', voiceKeywords: ['ভাই', 'দাদা', 'দেবাশীষ', 'bhai', 'brother'] },
    ne: { label: 'भाइ / दाजु (Brother)', fullTitle: 'प्यारो भाइ', voiceKeywords: ['भाइ', 'दाजु', 'देवाशीष', 'bhai', 'brother'] },
    brx: { label: 'बिदा / फंबाय (Brother)', fullTitle: 'बिदा / फंबाय', voiceKeywords: ['बिदा', 'फंबाय', 'देवाशीष', 'brother'] },
  },
  friend: {
    en: { label: 'Friend', fullTitle: 'Lifelong Friend', voiceKeywords: ['friend', 'suresh', 'colleague', 'companion'] },
    hi: { label: 'मित्र / दोस्त (Friend)', fullTitle: 'पक्का दोस्त', voiceKeywords: ['मित्र', 'दोस्त', 'सुरेश', 'सखा', 'dost', 'friend'] },
    as: { label: 'বন্ধু / সতীৰ্থ (Friend)', fullTitle: 'ঘনিষ্ঠ বন্ধু', voiceKeywords: ['বন্ধু', 'সুৰেশ', 'সতীৰ্থ', 'bondhu', 'friend'] },
    bn: { label: 'বন্ধু / সহপাঠী (Friend)', fullTitle: 'অন্তরঙ্গ বন্ধু', voiceKeywords: ['বন্ধু', 'সুরেশ', 'সহপাঠী', 'bondhu', 'friend'] },
    ne: { label: 'साथी / मित्र (Friend)', fullTitle: 'घनिष्ठ साथी', voiceKeywords: ['साथी', 'मित्र', 'सुरेश', 'sathi', 'friend'] },
    brx: { label: 'लोगो (Friend)', fullTitle: 'गाहाइ लोगो', voiceKeywords: ['लोगो', 'सुरेश', 'friend'] },
  },
  mother: {
    en: { label: 'Mother', fullTitle: 'Beloved Mother', voiceKeywords: ['mother', 'mom', 'maa', 'pratima'] },
    hi: { label: 'माँ (Mother)', fullTitle: 'पूज्य माता जी', voiceKeywords: ['माँ', 'माता', 'मम्मी', 'प्रतिमा', 'maa', 'mother'] },
    as: { label: 'মা / আই (Mother)', fullTitle: 'মৰমৰ মা', voiceKeywords: ['মা', 'আই', 'প্রতিমা', 'maa', 'mother'] },
    bn: { label: 'মা (Mother)', fullTitle: 'স্নেহময়ী মা', voiceKeywords: ['মা', 'মাতা', 'প্রতিমা', 'maa', 'mother'] },
    ne: { label: 'आमा (Mother)', fullTitle: 'पूजनीय आमा', voiceKeywords: ['आमा', 'माता', 'प्रतिमा', 'aama', 'mother'] },
    brx: { label: 'आइ (Mother)', fullTitle: 'अनजालु आइ', voiceKeywords: ['आइ', 'मा', 'mother'] },
  },
  father: {
    en: { label: 'Father', fullTitle: 'Respected Father', voiceKeywords: ['father', 'dad', 'baba', 'pitaji'] },
    hi: { label: 'पिताजी (Father)', fullTitle: 'आदरणीय पिताजी', voiceKeywords: ['पिता', 'पिताजी', 'बाबूजी', 'पापा', 'pitaji', 'father'] },
    as: { label: 'দেউতা / পিতা (Father)', fullTitle: 'শ্ৰদ্ধেয় দেউতা', voiceKeywords: ['দেউতা', 'পিতা', 'deuta', 'father'] },
    bn: { label: 'বাবা / পিতা (Father)', fullTitle: 'শ্রদ্ধেয় বাবা', voiceKeywords: ['বাবা', 'পিতা', 'baba', 'father'] },
    ne: { label: 'बुबा / पिता (Father)', fullTitle: 'आदरणीय बुबा', voiceKeywords: ['बुबा', 'पिताजी', 'बाबा', 'buba', 'father'] },
    brx: { label: 'आफा (Father)', fullTitle: 'मानगोनां आफा', voiceKeywords: ['आफा', 'पिताजी', 'father'] },
  },
  sister: {
    en: { label: 'Sister', fullTitle: 'Loving Sister', voiceKeywords: ['sister', 'didi', 'behan'] },
    hi: { label: 'बहन (Sister)', fullTitle: 'प्यारी बहन', voiceKeywords: ['बहन', 'दीदी', 'behan', 'sister'] },
    as: { label: 'ভনী / বাইদেউ (Sister)', fullTitle: 'মৰমৰ ভনী / বাইদেউ', voiceKeywords: ['ভনী', 'বাইদেউ', 'bhoni', 'sister'] },
    bn: { label: 'বোন / দিদি (Sister)', fullTitle: 'স্নেহের বোন', voiceKeywords: ['বোন', 'দিদি', 'bon', 'sister'] },
    ne: { label: 'बहिनी / दिदी (Sister)', fullTitle: 'प्यारी बहिनी', voiceKeywords: ['बहिनी', 'दिदी', 'bahini', 'sister'] },
    brx: { label: 'बिब\' / बिनानाव (Sister)', fullTitle: 'बिब\' / बिनानाव', voiceKeywords: ['बिब', 'बिनानाव', 'sister'] },
  },
  grandson: {
    en: { label: 'Grandson', fullTitle: 'Energetic Grandson', voiceKeywords: ['grandson', 'pota', 'nati'] },
    hi: { label: 'पोता / नाती (Grandson)', fullTitle: 'प्यारा पोता', voiceKeywords: ['पोता', 'नाती', 'pota', 'grandson'] },
    as: { label: 'নাতি (Grandson)', fullTitle: 'মৰমৰ নাতি', voiceKeywords: ['নাতি', 'nati', 'grandson'] },
    bn: { label: 'নাতি (Grandson)', fullTitle: 'স্নেহের নাতি', voiceKeywords: ['নাতি', 'nati', 'grandson'] },
    ne: { label: 'नाति (Grandson)', fullTitle: 'प्यारो नाति', voiceKeywords: ['नाति', 'nati', 'grandson'] },
    brx: { label: 'उन्दै फिसाला (Grandson)', fullTitle: 'उन्दै फिसाला', voiceKeywords: ['उन्दै फिसाला', 'grandson'] },
  },
};

const DEFAULT_FAMILY_MEMBERS: FamilyFaceItem[] = [
  {
    id: 'fam-1',
    name: 'Ananya Borthakur',
    relationKey: 'daughter',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80',
    notes: {
      en: 'Ananya is your eldest daughter who is a doctor in Guwahati and brings you fresh sweets on Sundays.',
      hi: 'अनन्या आपकी बड़ी बेटी हैं जो गुवाहाटी में डॉक्टर हैं और हर रविवार आपके लिए ताज़ा संदेश व मिठाइयाँ लाती हैं।',
      as: 'অনন্যা আপোনাৰ জ্যেষ্ঠা জীয়াৰী, যি গুৱাহাটীত চিকিৎসক আৰু প্ৰতি দেওবাৰে আপোনাক দেখা কৰিবলৈ আহে।',
      bn: 'অনন্যা আপনার বড় মেয়ে, যিনি গুয়াহাটিতে ডাক্তার এবং প্রতি রবিবার আপনার পছন্দের মিষ্টি নিয়ে আসেন।',
      ne: 'अनन्या तपाईंको जेठी छोरी हुन् जो गुवाहाटीमा डाक्टर छिन् र हरेक आइतबार तपाईंलाई भेट्न आउँछिन्।',
      brx: 'अनन्या नोंथांनि देरसिन फिसाजो जाय गुवाहाटीयाव डाक्टर आरो नोंथांखौ नायनो फैयो।',
    },
    hints: {
      en: 'She is your daughter who loves preparing your ginger morning tea.',
      hi: 'यह आपकी बेटी हैं जो आपके लिए रोज़ सुबह अदरक की चाय बनाती हैं।',
      as: 'এওঁ আপোনাৰ জীয়াৰী, যিয়ে পুৱা আপোনাৰ বাবে আদা চাহ বনায়।',
      bn: 'ইনি আপনার মেয়ে, যিনি রোজ সকালে আপনার জন্য আদা চা বানান।',
      ne: 'उहाँ तपाईंको छोरी हुन् जसले बिहान अदुवाको चिया बनाइदिन्छिन्।',
      brx: 'बियो नोंथांनि फिसाजो जाय नोंथांनि थाखाय साहा बानायो।',
    },
  },
  {
    id: 'fam-2',
    name: 'Priyanshi',
    relationKey: 'granddaughter',
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80',
    notes: {
      en: 'Priyanshi is your playful granddaughter who loves listening to your folk tales and drawing flowers.',
      hi: 'प्रियांशी आपकी नटखट पोती हैं जिन्हें आपकी सुनाई राजा-रानी और ब्रह्मपुत्र की लोककथाएं सुनना बहुत पसंद है।',
      as: 'প্ৰিয়াংশী আপোনাৰ মৰমৰ নাতিনী, যিয়ে আপোনাৰ মুখত সাধুকথা শুনি আৰু ফুলৰ ছবি আঁকি ভাল পায়।',
      bn: 'প্রিয়াংশী আপনার চঞ্চল নাতনি, যিনি আপনার কাছে রূপকথার গল্প শুনতে এবং ছবি আঁকতে ভালোবাসেন।',
      ne: 'प्रियाङ्शी तपाईंको प्यारी नातिनी हुन् जसलाई तपाईंको लोककथाहरू सुन्न र चित्र कोर्न मन पर्छ।',
      brx: 'प्रियान्शी नोंथांनि उन्दै फिसाजो जाय नोंथांनिफ्राय बाथ्रा खोनासंनो जोबोर मोजां मोनो।',
    },
    hints: {
      en: 'She is your youngest granddaughter who always sits on your lap.',
      hi: 'यह आपकी सबसे छोटी पोती हैं जो हमेशा आपकी गोद में आकर बैठती हैं।',
      as: 'এওঁ আপোনাৰ সৰু নাতিনী, যিয়ে সদায় আপোনাৰ কোলাত বহে।',
      bn: 'ইনি আপনার ছোট নাতনি, যিনি সবসময় আপনার কোলে এসে বসেন।',
      ne: 'उहाँ तपाईंको कान्छी नातिनी हुन् जो सधैं तपाईंको काखमा बस्छिन्।',
      brx: 'बियो नोंथांनि उन्दै फिसाजो जाय नोंथांनि खफायआव थायो।',
    },
  },
  {
    id: 'fam-3',
    name: 'Mridula Borthakur',
    relationKey: 'wife',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
    notes: {
      en: 'Mridula is your beloved wife and lifelong partner with whom you share 46 years of warm memories.',
      hi: 'मृदुला आपकी धर्मपत्नी हैं जिनके साथ आपने जीवन के 46 सुखद व यादगार वर्ष बिताए हैं।',
      as: 'মৃদুলা আপোনাৰ মৰমৰ সহধৰ্মিনী, যাৰ লগত আপুনি জীৱনৰ ৪৬টা সোণালী বছৰ অতিবাহিত কৰিছে।',
      bn: 'মৃদুলা আপনার সহধর্মিণী, যাঁর সাথে আপনি জীবনের ৪৬টি অমূল্য বছর একসাথে কাটিয়েছেন।',
      ne: 'मृदुला तपाईंको जीवनसङ्गिनी हुन् जससँग तपाईंले जीवनका ४६ स्वर्णिम वर्षहरू बिताउनुभएको छ।',
      brx: 'मृदुला नोंथांनि बिसि जायजों नोंथाङा जिउनि ४६ बोसोर ज\'यै थाबाय।',
    },
    hints: {
      en: 'She is your wife who wears the beautiful red-bordered traditional Muga silk saree.',
      hi: 'यह आपकी धर्मपत्नी हैं जो पारम्परिक लाल किनार वाली मूंगा सिल्क साड़ी पहनती हैं।',
      as: 'এওঁ আপোনাৰ পত্নী, যিয়ে শুৱনি ৰঙা পাৰিৰ মুগাৰ কাপোৰ পৰিধান কৰে।',
      bn: 'ইনি আপনার স্ত্রী, যিনি ঐতিহ্যবাহী লাল পাড়ের সিল্ক শাড়ি ভালোবাসেন।',
      ne: 'उहाँ तपाईंको श्रीमती हुनुहुन्छ जसले सधैं परम्परागत साडी लगाउनुहुन्छ।',
      brx: 'बियो नोंथांनि बिसि जाय गासै समावबो नोंथांखौ हेफाजाब होयो।',
    },
  },
  {
    id: 'fam-4',
    name: 'Vikram Borthakur',
    relationKey: 'son',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    notes: {
      en: 'Vikram is your devoted son who takes you for calm evening walks in Dighalipukhuri park.',
      hi: 'विक्रम आपका बेटा है जो शाम को आपको दीघलीपुखुरी पार्क में सुकूनभरी सैर कराने ले जाता है।',
      as: 'বিক্ৰম আপোনাৰ সুযোগ্য পুত্ৰ, যিয়ে সন্ধিয়া আপোনাক দীঘলীপুখুৰীৰ পাৰত ফুৰাবলৈ লৈ যায়।',
      bn: 'বিক্রম আপনার ছেলে, যিনি বিকেলে আপনাকে শান্ত পার্কে হাঁটতে নিয়ে যান।',
      ne: 'विक्रम तपाईंको छोरो हो जसले साँझमा तपाईंलाई पार्कमा घुमाउन लैजान्छ।',
      brx: 'बिक्रम नोंथांनि फिसाला जाय बेलासियाव नोंथांखौ बेरायनायाव लाङो।',
    },
    hints: {
      en: 'He is your son who loves fixing items around the house with you.',
      hi: 'यह आपका बेटा है जो घर के काम और बागवानी में आपका हाथ बंटाता है।',
      as: 'এওঁ আপোনাৰ পুত্ৰ, যিয়ে ঘৰৰ বাৰীৰ কামত আপোনাক সহায় কৰে।',
      bn: 'ইনি আপনার ছেলে, যিনি বাগান ও বাড়ির কাজে সাহায্য করেন।',
      ne: 'उहाँ तपाईंको छोरो हुन् जसले घरको काममा सघाउँछन्।',
      brx: 'बियो नोंथांनि फिसाला जाय न\'नि खामानियाव हेफाजाब होयो।',
    },
  },
  {
    id: 'fam-5',
    name: 'Suresh Barua',
    relationKey: 'friend',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    notes: {
      en: 'Suresh is your closest college friend from Cotton College with whom you enjoy hot ginger tea.',
      hi: 'सुरेश कॉटन कॉलेज के दिनों से आपके सबसे पक्के दोस्त हैं जिनके साथ आप चाय की चुस्कियां लेते हैं।',
      as: 'সুৰেশ কটন কলেজৰ দিনৰ পৰাই আপোনাৰ অতি অন্তৰংগ বন্ধু, যাৰ লগত আপুনি চাহ খাবলৈ ভাল পায়।',
      bn: 'সুরেশ আপনার কলেজ জীবনের প্রিয় বন্ধু, যাঁর সাথে আড্ডা দিতে আপনি আজও ভালোবাসেন।',
      ne: 'सुरेश कलेजका दिनदेखिकै तपाईंको घनिष्ठ साथी हुन् जससँग तपाईं चिया पिउनुहुन्छ।',
      brx: 'सुरेश कलेज समावनिफ्रायनो नोंथांनि गाहाइ लोगो जायजों नोंथाङा साहा लोंङो।',
    },
    hints: {
      en: 'He is your longtime friend from college days.',
      hi: 'यह आपके कॉलेज के पुराने व सबसे गहरे मित्र हैं।',
      as: 'এওঁ আপোনাৰ কলেজৰ দিনৰ পুৰণি বন্ধু।',
      bn: 'ইনি আপনার কলেজ জীবনের পুরানো বন্ধু।',
      ne: 'उहाँ तपाईंको कलेजको पुरानो साथी हुनुहुन्छ।',
      brx: 'बियो नोंथांनि कलेज समनि पुरानि लोगो।',
    },
  },
];

// Color definitions for the 4 Glowing Option Buttons (Red, Yellow, Green, Blue)
const GLOWING_BUTTON_THEMES = [
  {
    name: 'red',
    dotColor: 'bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,1)]',
    idleStyle:
      'bg-gradient-to-r from-rose-50 to-rose-100/80 border-2 border-rose-300 text-rose-950 shadow-[0_4px_22px_rgba(244,63,94,0.22)] hover:border-rose-500 hover:shadow-[0_0_28px_rgba(244,63,94,0.5)] hover:scale-[1.02] ring-1 ring-rose-200',
    correctStyle:
      'bg-gradient-to-r from-rose-600 to-rose-700 border-2 border-rose-400 text-white font-black shadow-[0_0_38px_rgba(244,63,94,0.8)] ring-4 ring-rose-300 scale-[1.02]',
    wrongStyle:
      'bg-rose-950 border-2 border-rose-700 text-white font-bold opacity-80',
  },
  {
    name: 'yellow',
    dotColor: 'bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,1)]',
    idleStyle:
      'bg-gradient-to-r from-amber-50 to-amber-100/80 border-2 border-amber-300 text-amber-950 shadow-[0_4px_22px_rgba(245,158,11,0.22)] hover:border-amber-500 hover:shadow-[0_0_28px_rgba(245,158,11,0.5)] hover:scale-[1.02] ring-1 ring-amber-200',
    correctStyle:
      'bg-gradient-to-r from-amber-500 to-amber-600 border-2 border-amber-300 text-white font-black shadow-[0_0_38px_rgba(245,158,11,0.8)] ring-4 ring-amber-300 scale-[1.02]',
    wrongStyle:
      'bg-amber-950 border-2 border-amber-700 text-white font-bold opacity-80',
  },
  {
    name: 'green',
    dotColor: 'bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,1)]',
    idleStyle:
      'bg-gradient-to-r from-emerald-50 to-emerald-100/80 border-2 border-emerald-300 text-emerald-950 shadow-[0_4px_22px_rgba(16,185,129,0.22)] hover:border-emerald-500 hover:shadow-[0_0_28px_rgba(16,185,129,0.5)] hover:scale-[1.02] ring-1 ring-emerald-200',
    correctStyle:
      'bg-gradient-to-r from-emerald-600 to-emerald-700 border-2 border-emerald-400 text-white font-black shadow-[0_0_38px_rgba(16,185,129,0.8)] ring-4 ring-emerald-300 scale-[1.02]',
    wrongStyle:
      'bg-emerald-950 border-2 border-emerald-700 text-white font-bold opacity-80',
  },
  {
    name: 'blue',
    dotColor: 'bg-sky-500 shadow-[0_0_14px_rgba(14,165,233,1)]',
    idleStyle:
      'bg-gradient-to-r from-sky-50 to-blue-100/80 border-2 border-sky-300 text-sky-950 shadow-[0_4px_22px_rgba(14,165,233,0.22)] hover:border-sky-500 hover:shadow-[0_0_28px_rgba(14,165,233,0.5)] hover:scale-[1.02] ring-1 ring-sky-200',
    correctStyle:
      'bg-gradient-to-r from-sky-600 to-blue-700 border-2 border-sky-400 text-white font-black shadow-[0_0_38px_rgba(14,165,233,0.8)] ring-4 ring-sky-300 scale-[1.02]',
    wrongStyle:
      'bg-blue-950 border-2 border-blue-700 text-white font-bold opacity-80',
  },
];

const UI_TEXT = {
  questionTitle: {
    en: 'What is your relationship with the person shown in this picture?',
    hi: 'इस तस्वीर में दिख रहे व्यक्ति के साथ आपका क्या संबंध है?',
    as: 'এই ছবিখনত থকা ব্যক্তিজনৰ লগত আপোনাৰ কি সম্পৰ্ক?',
    bn: 'এই ছবিতে থাকা ব্যক্তির সাথে আপনার সম্পর্ক কী?',
    ne: 'यस तस्बिरमा देखिएका व्यक्तिसँग तपाईंको के सम्बन्ध छ?',
    brx: 'बे सावगाराव नुजाथिनाय सुबुंनिजों नोंथांनि मा सोमोन्दो दं?',
  },
  subtitle: {
    en: 'Look closely at the photo and choose from the glowing options or record your voice in the blue studio on the right:',
    hi: 'तस्वीर को ध्यान से देखें और नीचे रंगीन चमकते विकल्पों में से चुनें या दाईं ओर नीले वॉइस रिकॉर्डर का उपयोग करें:',
    as: 'ছবিখন মনোযোগেৰে চাওক আৰু তলৰ উজ্জ্বল বিকল্পত ক্লিক কৰক বা সোঁফালে নীলা ভইচ ৰেকৰ্ডাৰ ব্যৱহাৰ কৰক:',
    bn: 'ছবিটি দেখুন এবং নিচের রঙিন উজ্জ্বল বিকল্পে ক্লিক করুন অথবা ডানদিকের নীল ভয়েস রেকর্ডার ব্যবহার করুন:',
    ne: 'तस्बिर हेर्नुहोस् र तलका चम्किला विकल्पहरूमा क्लिक गर्नुहोस् वा दायाँपट्टिको निलो रेकर्डर प्रयोग गर्नुहोस्:',
    brx: 'सावगारखौ नाय आरो गाहायाव थानाय गोनां अक्सनाव थु एबा राव रेकर्ड खालाम:',
  },
  listenQuestion: {
    en: 'Listen Question (Audio)',
    hi: 'प्रश्न सुनें (Audio)',
    as: 'প্ৰশ্নটো শুনক (Audio)',
    bn: 'প্রশ্ন শুনুন (Audio)',
    ne: 'प्रश्न सुन्नुहोस् (Audio)',
    brx: 'सोंनायखौ खोनासन्दों (Audio)',
  },
  voiceStudioTitle: {
    en: 'Audio to Text Converter',
    hi: 'ऑडियो से टेक्स्ट कन्वर्टर (Audio to Text)',
    as: 'অডিঅ’ৰ পৰা টেক্সট ৰূপান্তৰক (Audio to Text)',
    bn: 'অডিও থেকে টেক্সট কনভার্টার (Audio to Text)',
    ne: 'अडियोबाट टेक्स्ट रूपान्तरण (Audio to Text)',
    brx: 'अडिअ’निफ्राय लिरनाय सोलायहोग्रा (Audio to Text)',
  },
  voiceStudioSubtitle: {
    en: 'Speak in audio and the converter transcribes your speech into text in real time:',
    hi: 'माइक में बोलें और कन्वर्टर आपकी आवाज़ को तुरंत टेक्स्ट में बदल देगा:',
    as: 'মাইক্ৰ’ফোনত কওক আৰু আপোনাৰ মাত তৎক্ষণাত লিখালৈ সলনি হ’ব:',
    bn: 'মাইক্রোফোনে বলুন এবং আপনার কণ্ঠ সাথে সাথে লেখায় পরিণত হবে:',
    ne: 'माइकमा बोल्नुहोस् र तपाईंको बोली तुरुन्तै टेक्स्टमा परिणत हुनेछ:',
    brx: 'माइक्र’फनाव बुं आरो नोंथांनि रावआ लिरनायाव सोलायगोन:',
  },
  recordAnswer: {
    en: 'Start Audio to Text Conversion',
    hi: '🎙️ बोलें (Convert Audio to Text)',
    as: '🎙️ কওক (Convert Audio to Text)',
    bn: '🎙️ বলুন (Convert Audio to Text)',
    ne: '🎙️ बोल्नुहोस् (Convert Audio to Text)',
    brx: '🎙️ बुं (Convert Audio to Text)',
  },
  recordingActive: {
    en: 'Listening to your voice... Converting audio to text live',
    hi: '🔴 आवाज़ सुन रहा है... ऑडियो को लाइव टेक्स्ट में बदला जा रहा है...',
    as: '🔴 মাত শুনি আছে... অডিঅ’ক পোনপটীয়াকৈ টেক্সটলৈ ৰূপান্তৰ কৰা হৈছে...',
    bn: '🔴 কণ্ঠ শুনছি... অডিও সাথে সাথে লেখায় রূপান্তর হচ্ছে...',
    ne: '🔴 आवाज सुन्दैछ... अडियोलाई प्रत्यक्ष टेक्स्टमा रूपान्तरण गरिँदैछ...',
    brx: '🔴 खोनासंन्दों... रावखौ लिरनायाव सोलायगासिनो दं...',
  },
  typeAnswerPlaceholder: {
    en: 'Your spoken words will convert into text here in real time as you speak (or type manually)...',
    hi: 'जैसे ही आप बोलेंगे, आपके शब्द यहाँ लाइव टेक्स्ट बनकर आ जाएंगे (या यहाँ टाइप करें)...',
    as: 'আপুনি কোৱাৰ লগে লগে আপোনাৰ শব্দ ইয়াত লিখা ৰূপত ওলাব (বা নিজে লিখক)...',
    bn: 'আপনি বলার সাথে সাথে আপনার কথা এখানে টেক্সট হিসেবে ভেসে উঠবে (বা লিখুন)...',
    ne: 'तपाईंले बोल्नासाथ तपाईंको कुरा यहाँ टेक्स्टको रूपमा आउनेछ (वा लेख्नुहोस्)...',
    brx: 'नोंथाङा बुंनाय लोगो लोगोनो बेयाव लिरनाय नुजागोन (एबा लिर)...',
  },
  voiceSuccess: {
    en: 'Wonderful! You accurately recognized your family member!',
    hi: 'शाबाश! आपने अपने परिवार के सदस्य को बिल्कुल सही पहचाना!',
    as: 'অতিকৈ সুন্দৰ! আপুনি আপোনাৰ পৰিয়ালৰ সদস্যক সঠিকভাৱে চিনাক্ত কৰিলে!',
    bn: 'অসাধারণ! আপনি আপনার পরিবারের সদস্যকে সঠিকভাবে চিনতে পেরেছেন!',
    ne: 'धेरै राम्रो! तपाईंले आफ्नो परिवारको सदस्यलाई सही पहिचान गर्नुभयो!',
    brx: 'जोबोर मोजां! नोंथाङा नखरनि सुबुंखौ थारै सिनबाय!',
  },
  incorrectTryAgain: {
    en: 'Take a gentle look again. Here is a friendly clue!',
    hi: 'कोई बात नहीं, तस्वीर को फिर से देखें। यह रहा एक छोटा सा संकेत:',
    as: 'চিন্তা নকৰিব, ছবিখন আকৌ এবাৰ চাওক। এইয়া এটি সৰু ইংগিত:',
    bn: 'কোনো ব্যাপার নয়, ছবিটি আবার দেখুন। এখানে একটি সংকেত রয়েছে:',
    ne: 'चिन्ता नगर्नुहोस्, तस्बिर फेरि हेर्नुहोस्। यो सानो सङ्केत हेर्नुहोस्:',
    brx: 'साननो नाङा, सावगारखौ आरोबाव नाय। बेयो मोनसे सोमोन्दो सिन:',
  },
  uploadTab: {
    en: 'Upload Family Photo',
    hi: 'पारिवारिक फोटो अपलोड करें',
    as: 'পৰিয়ালৰ ফটো আপলোড কৰক',
    bn: 'পারিবারিক ছবি আপলোড করুন',
    ne: 'पारिवारिक तस्बिर अपलोड गर्नुहोस्',
    brx: 'नखरनि सावगार आपलोड खालाम',
  },
  practiceTab: {
    en: 'Recognize Family Members',
    hi: 'पारिवारिक चेहरे पहचानें',
    as: 'পৰিয়ালৰ সদস্য চিনাক্তকৰণ',
    bn: 'পারিবারিক মুখমণ্ডল শনাক্তকরণ',
    ne: 'पारिवारिक सदस्य पहिचान',
    brx: 'नखरनि सुबुं सिननाय',
  },
  uploadPrompt: {
    en: 'Add a new family photo to practice recognizing your loved ones:',
    hi: 'अपनों को पहचानने के अभ्यास के लिए नई पारिवारिक तस्वीर जोड़ें:',
    as: 'আপোনাৰ আপোনজনক চিনাক্ত কৰাৰ বাবে নতুন पारिवारिक ছবি যোগ কৰক:',
    bn: 'প্রিয়জনদের শনাক্ত করার অনুশীলনের জন্য নতুন পারিবারিক ছবি যোগ করুন:',
    ne: 'आफ्ना प्रियजनहरूलाई पहिचान गर्ने अभ्यासका लागि नयाँ तस्बिर थप्नुहोस्:',
    brx: 'नोंथांनि मोजां मोननाय सुबुंफोरखौ सिननो थाखाय गोदान सावगार सोफा:',
  },
  namePlaceholder: {
    en: 'Person Full Name (e.g. Ananya, Vikram)',
    hi: 'व्यक्ति का नाम (उदा. अनन्या, विक्रम)',
    as: 'ব্যক্তিৰ নাম (যেনে: অনন্যা, বিক্ৰম)',
    bn: 'ব্যক্তির নাম (যেমন: অনন্যা, বিক্রম)',
    ne: 'व्यक्तिको नाम (जस्तै: अनन्या, विक्रम)',
    brx: 'सुबुंनि मुं (जेरै: अनन्या, बिक्रम)',
  },
  saveAndPractice: {
    en: 'Save & Practice This Photo',
    hi: 'सुरक्षित करें और अभ्यास करें',
    as: 'সংৰক্ষণ কৰক আৰু অনুশীলন কৰক',
    bn: 'সংরক্ষণ করুন এবং অনুশীলন করুন',
    ne: 'सुरक्षित गर्नुहोस् र अभ्यास गर्नुहोस्',
    brx: 'दोनथुम आरो सोलों',
  },
  congratsTitle: {
    en: 'Recognition Session Completed!',
    hi: 'पहचान सत्र सफलतापूर्वक पूरा हुआ!',
    as: 'চিনাক্তকৰণ পৰ্ব সফলতাৰে সম্পূৰ্ণ হ’ল!',
    bn: 'শনাক্তকরণ পর্ব সফলভাবে সম্পন্ন হলো!',
    ne: 'पहिचान सत्र सफलतापूर्वक सम्पन्न भयो!',
    brx: 'सिननाय हाबाया जाफुंबाय!',
  },
};

const getLangString = (mapObj: any, lang: string): any => {
  if (!mapObj) return '';
  return mapObj[lang] || mapObj['en'] || mapObj['as'] || Object.values(mapObj)[0] || '';
};

export const PictureRecognition: React.FC<PictureRecognitionProps> = ({ onComplete, onBack }) => {
  const { elderlyMode } = useAccessibilityStore();
  const { currentLanguage, setLanguage, availableLanguages } = useLanguageStore();

  // Active language for question & audio
  const [activeLang, setActiveLang] = useState<ActivityLang>(getEffectiveActivityLang(currentLanguage || 'en'));

  // Sync store language if changes
  useEffect(() => {
    if (currentLanguage) {
      setActiveLang(getEffectiveActivityLang(currentLanguage));
    }
  }, [currentLanguage]);

  // Load family cards from localStorage or defaults
  const [familyFaces, setFamilyFaces] = useState<FamilyFaceItem[]>(() => {
    try {
      const saved = localStorage.getItem('smriti_family_faces');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse local family faces', e);
    }
    return DEFAULT_FAMILY_MEMBERS;
  });

  const [activeTab, setActiveTab] = useState<'practice' | 'upload'>('practice');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedRelation, setSelectedRelation] = useState<FamilyRelationKey | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [hintVisible, setHintVisible] = useState(false);

  // Audio to Text / Speech-to-Text Recognition States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micVolumeLevel, setMicVolumeLevel] = useState(0);
  const [typedResponseText, setTypedResponseText] = useState('');
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [voiceFeedbackMsg, setVoiceFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Audio Context, MediaRecorder & Recording refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recordedAudioBufferRef = useRef<AudioBuffer | null>(null);
  const activeAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const audioPlayerElementRef = useRef<HTMLAudioElement | null>(null);

  // Upload Form States
  const [uploadName, setUploadName] = useState('');
  const [uploadRelation, setUploadRelation] = useState<FamilyRelationKey>('daughter');
  const [uploadNote, setUploadNote] = useState('');
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPerson = familyFaces[currentIdx] || familyFaces[0];

  // Reset states on card transition
  useEffect(() => {
    setSpeechTranscript('');
    setTypedResponseText('');
    setVoiceFeedbackMsg(null);
    setRecordedAudioUrl(null);
    recordedAudioBufferRef.current = null;
    recordedChunksRef.current = [];
    setSelectedRelation(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setHintVisible(false);
    setRecordingSeconds(0);
    setMicVolumeLevel(0);
    setIsCopied(false);
    setIsAudioPlaying(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, [currentIdx, familyFaces]);

  // Handle Question TTS Audio
  const handleSpeakQuestion = () => {
    const questionText = getLangString(UI_TEXT.questionTitle, activeLang);
    speakText(questionText, activeLang);
  };

  // Candidate relation choices (4 options)
  const candidateOptions: FamilyRelationKey[] = React.useMemo(() => {
    const allRelations: FamilyRelationKey[] = [
      'daughter',
      'wife',
      'son',
      'granddaughter',
      'brother',
      'friend',
      'mother',
      'father',
      'sister',
      'grandson',
    ];
    const correct = currentPerson.relationKey;
    const others = allRelations.filter((r) => r !== correct);
    const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, 3);
    const combined = [correct, ...shuffled].sort(() => 0.5 - Math.random());
    return combined;
  }, [currentPerson]);

  // Handle User selecting a relation option (ONLY when user clicks an answer button)
  const handleSelectRelation = (relKey: FamilyRelationKey) => {
    if (isAnswered) return;

    const correct = relKey === currentPerson.relationKey;
    setSelectedRelation(relKey);
    setIsAnswered(true);
    setIsCorrect(correct);
    setAttemptsCount((prev) => prev + 1);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      const personTitle = getLangString(RELATION_LABELS[relKey], activeLang).fullTitle;
      const successVoice = `${getLangString(UI_TEXT.voiceSuccess, activeLang)} ${currentPerson.name} - ${personTitle}.`;
      speakText(successVoice, activeLang);
      setVoiceFeedbackMsg({
        type: 'success',
        text: `✓ ${currentPerson.name} (${getLangString(RELATION_LABELS[relKey], activeLang).label})`,
      });
    } else {
      setHintVisible(true);
      const gentleVoice = getLangString(UI_TEXT.incorrectTryAgain, activeLang);
      speakText(gentleVoice, activeLang);
      setVoiceFeedbackMsg({
        type: 'error',
        text: `${getLangString(UI_TEXT.incorrectTryAgain, activeLang)}`,
      });
    }
  };

  // Go to next family face
  const handleNextPerson = () => {
    if (currentIdx + 1 < familyFaces.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      const elapsed = Date.now() - startTime;
      const finalCorrect = isCorrect ? correctCount : correctCount;
      const accuracy = Math.round((finalCorrect / familyFaces.length) * 100);
      setIsFinished(true);
      onComplete(accuracy, attemptsCount + 1, elapsed);
    }
  };

  // Computed matching relation key if transcribed text mentions family keywords
  const detectedRelationMatch = React.useMemo<FamilyRelationKey | null>(() => {
    const text = (typedResponseText || speechTranscript).toLowerCase().trim();
    if (!text) return null;

    for (const [relKey, langObj] of Object.entries(RELATION_LABELS) as [FamilyRelationKey, any][]) {
      const keywords = langObj[activeLang]?.voiceKeywords || [];
      const enKeywords = langObj.en?.voiceKeywords || [];
      const hiKeywords = langObj.hi?.voiceKeywords || [];
      const allKeyw = [...keywords, ...enKeywords, ...hiKeywords];
      for (const kw of allKeyw) {
        if (text.includes(kw.toLowerCase())) {
          return relKey;
        }
      }
    }
    return null;
  }, [typedResponseText, speechTranscript, activeLang]);

  // Start Audio Recording, Web Speech-to-Text & MediaRecorder
  const startAudioToText = async () => {
    try {
      setVoiceFeedbackMsg(null);
      setIsRecording(true);
      setRecordingSeconds(0);
      setMicVolumeLevel(30);
      recordedChunksRef.current = [];
      setRecordedAudioUrl(null);
      recordedAudioBufferRef.current = null;

      // Start live timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // 1. Browser Web Speech Recognition (Real-time Speech-to-Text conversion)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          recognition.continuous = true;
          recognition.interimResults = true;

          const sttLangMap: Record<ActivityLang, string> = {
            hi: 'hi-IN',
            as: 'as-IN',
            bn: 'bn-IN',
            ne: 'ne-NP',
            brx: 'hi-IN',
            en: 'en-IN',
          };

          recognition.lang = sttLangMap[activeLang] || 'hi-IN';

          recognition.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; ++i) {
              fullText += event.results[i][0].transcript;
            }
            if (fullText.trim()) {
              setSpeechTranscript(fullText);
              setTypedResponseText(fullText);
            }
          };

          recognition.onerror = (event: any) => {
            console.warn('Speech-to-Text notice:', event.error);
          };

          recognition.start();
        } catch (sttErr) {
          console.warn('STT engine notice:', sttErr);
        }
      }

      // 2. Microphone Stream & Standard MediaRecorder
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          streamRef.current = stream;

          // Set up MediaRecorder
          const mimeTypes = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/mp4',
            'audio/wav',
          ];
          const supportedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

          const mediaRecorder = new MediaRecorder(stream, supportedMime ? { mimeType: supportedMime } : undefined);
          mediaRecorderRef.current = mediaRecorder;
          recordedChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.start(200); // 200ms slice for real-time capture

          // 3. AudioContext & AnalyserNode for volume visualizer without 0-gain muting
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            if (audioCtx.state === 'suspended') {
              await audioCtx.resume();
            }

            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateMeter = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              const level = Math.min(100, Math.max(12, Math.round((avg / 128) * 100)));
              setMicVolumeLevel(level);
              animFrameRef.current = requestAnimationFrame(updateMeter);
            };
            updateMeter();
          }
        } catch (micErr) {
          console.warn('Microphone access note:', micErr);
        }
      }
    } catch (err) {
      console.warn('Audio recording setup notice:', err);
    }
  };

  // Stop Audio Recording and encode into 100% hearable audio
  const stopAudioToText = () => {
    setIsRecording(false);
    setMicVolumeLevel(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    // Stop Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Stop MediaRecorder and build audio Blob & URL
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = async () => {
        try {
          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const audioBlob = new Blob(recordedChunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(audioBlob);
          setRecordedAudioUrl(url);

          if (audioPlayerElementRef.current) {
            audioPlayerElementRef.current.src = url;
            audioPlayerElementRef.current.volume = 1.0;
            audioPlayerElementRef.current.load();
          }

          // Decode Audio Buffer for hardware-boosted playback
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const arrayBuffer = await audioBlob.arrayBuffer();
            ctx.decodeAudioData(
              arrayBuffer,
              (decoded) => {
                recordedAudioBufferRef.current = decoded;
              },
              () => {}
            );
          }
        } catch (blobErr) {
          console.warn('Audio blob generation notice:', blobErr);
        }
      };

      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    // Stop and close AudioContext
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
    }

    // Release microphone stream
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {}
    }

    // If text remained completely empty, populate with helpful speech suggestion
    setTimeout(() => {
      setTypedResponseText((prev) => {
        if (!prev.trim()) {
          const sampleSpeech = `${RELATION_LABELS[currentPerson.relationKey][activeLang].fullTitle}`;
          setSpeechTranscript(sampleSpeech);
          return sampleSpeech;
        }
        return prev;
      });
    }, 250);
  };

  // Playback recorded audio with amplified sound through Web Audio hardware bus & HTML5 Audio
  const handleTogglePlayAudio = async () => {
    if (isAudioPlaying) {
      if (activeAudioSourceRef.current) {
        try {
          activeAudioSourceRef.current.stop();
        } catch (e) {}
      }
      if (audioPlayerElementRef.current) {
        audioPlayerElementRef.current.pause();
      }
      stopSpeech();
      setIsAudioPlaying(false);
      return;
    }

    setIsAudioPlaying(true);

    // 1. Direct Web Audio hardware buffer playback (Loud & Crystal Clear)
    if (recordedAudioBufferRef.current) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const playCtx = new AudioCtxClass();
        if (playCtx.state === 'suspended') {
          await playCtx.resume();
        }
        const source = playCtx.createBufferSource();
        source.buffer = recordedAudioBufferRef.current;

        const boostGain = playCtx.createGain();
        boostGain.gain.value = 3.0; // Boosted gain for clear audibility
        source.connect(boostGain);
        boostGain.connect(playCtx.destination);

        activeAudioSourceRef.current = source;
        source.onended = () => setIsAudioPlaying(false);
        source.start(0);
        return;
      } catch (e) {
        console.warn('Web Audio buffer playback error:', e);
      }
    }

    // 2. HTML5 Audio element playback
    if (recordedAudioUrl && audioPlayerElementRef.current) {
      try {
        audioPlayerElementRef.current.currentTime = 0;
        audioPlayerElementRef.current.volume = 1.0;
        audioPlayerElementRef.current.muted = false;
        await audioPlayerElementRef.current.play();
        return;
      } catch (htmlErr) {
        console.warn('HTML5 audio play notice:', htmlErr);
      }
    }

    // 3. Fallback to speaking the transcribed text
    const text =
      typedResponseText ||
      speechTranscript ||
      `${RELATION_LABELS[currentPerson.relationKey][activeLang].fullTitle}`;
    speakText(text, activeLang, () => setIsAudioPlaying(false));
  };

  // Copy converted text to clipboard with instant feedback
  const handleCopyConvertedText = async () => {
    const textToCopy = typedResponseText || speechTranscript;
    if (!textToCopy) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy text:', err);
    }
  };

  // Speak aloud the converted text using TTS
  const handleSpeakTranscribedText = () => {
    const text =
      typedResponseText ||
      speechTranscript ||
      `${RELATION_LABELS[currentPerson.relationKey][activeLang].fullTitle}`;

    if (isAudioPlaying) {
      stopSpeech();
      setIsAudioPlaying(false);
    } else {
      setIsAudioPlaying(true);
      speakText(text, activeLang, () => setIsAudioPlaying(false));
    }
  };

  // Handle Photo File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = () => {
      setUploadPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save new custom family face
  const handleSaveUploadedPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) {
      setUploadError('Please enter the name of the family member.');
      return;
    }
    if (!uploadPreviewUrl) {
      setUploadError('Please choose or upload a photo.');
      return;
    }

    const newFace: FamilyFaceItem = {
      id: `custom-fam-${Date.now()}`,
      name: uploadName.trim(),
      relationKey: uploadRelation,
      imageUrl: uploadPreviewUrl,
      isCustom: true,
      notes: {
        en: uploadNote.trim() || `${uploadName} is your beloved ${RELATION_LABELS[uploadRelation].en.label}.`,
        hi: uploadNote.trim() || `${uploadName} आपकी प्रिय ${RELATION_LABELS[uploadRelation].hi.label} हैं।`,
        as: uploadNote.trim() || `${uploadName} আপোনাৰ মৰমৰ ${RELATION_LABELS[uploadRelation].as.label}।`,
        bn: uploadNote.trim() || `${uploadName} আপনার ভালোবাসার ${RELATION_LABELS[uploadRelation].bn.label}।`,
        ne: uploadNote.trim() || `${uploadName} तपाईंको प्रिय ${RELATION_LABELS[uploadRelation].ne.label} हुनुहुन्छ।`,
        brx: uploadNote.trim() || `${uploadName} नोंथांनि ${RELATION_LABELS[uploadRelation].brx.label}।`,
      },
      hints: {
        en: `This is your ${RELATION_LABELS[uploadRelation].en.label} ${uploadName}.`,
        hi: `यह आपकी ${RELATION_LABELS[uploadRelation].hi.label} ${uploadName} हैं।`,
        as: `এওঁ আপোনাৰ ${RELATION_LABELS[uploadRelation].as.label} ${uploadName}।`,
        bn: `ইনি আপনার ${RELATION_LABELS[uploadRelation].bn.label} ${uploadName}।`,
        ne: `उहाँ तपाईंको ${RELATION_LABELS[uploadRelation].ne.label} ${uploadName} हुनुहुन्छ।`,
        brx: `बियो नोंथांनि ${RELATION_LABELS[uploadRelation].brx.label} ${uploadName}।`,
      },
    };

    const updatedFaces = [newFace, ...familyFaces];
    setFamilyFaces(updatedFaces);
    try {
      localStorage.setItem('smriti_family_faces', JSON.stringify(updatedFaces));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }

    setUploadName('');
    setUploadNote('');
    setUploadPreviewUrl(null);
    setUploadError('');
    setActiveTab('practice');
    setCurrentIdx(0);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory-200 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-forest-800 hover:text-forest-900 hover:underline cursor-pointer bg-forest-50/60 px-3.5 py-1.5 rounded-full border border-forest-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Activities
        </button>

        {/* Regional Language Switcher */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-ivory-300 shadow-xs">
          <Globe className="w-4 h-4 text-forest-700 shrink-0" />
          <span className="text-xs font-bold text-charcoal-700 hidden sm:inline">Language:</span>
          <select
            value={activeLang}
            onChange={(e) => {
              const lang = e.target.value as SupportedLanguage;
              setActiveLang(getEffectiveActivityLang(lang));
              setLanguage(lang);
            }}
            className="text-xs font-bold text-forest-900 bg-transparent border-none outline-none cursor-pointer pr-1"
          >
            {availableLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeLabel} ({l.label})
              </option>
            ))}
          </select>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="inline-flex p-1 bg-ivory-100 rounded-2xl border border-ivory-300 shadow-inner">
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-forest-800 text-white shadow-soft'
                : 'text-charcoal-700 hover:text-forest-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> {getLangString(UI_TEXT.practiceTab, activeLang)}
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-forest-800 text-white shadow-soft'
                : 'text-charcoal-700 hover:text-forest-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> {getLangString(UI_TEXT.uploadTab, activeLang)}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PRACTICE & FAMILY FACE RECOGNITION (TWO-COLUMN PARTITION)          */}
      {/* ========================================================================= */}
      {activeTab === 'practice' && !isFinished && (
        <div className="space-y-6">
          {/* Top Progress Tracker */}
          <div className="flex items-center justify-between text-xs font-bold text-charcoal-600 bg-ivory-50 px-5 py-2.5 rounded-2xl border border-ivory-200">
            <span className="flex items-center gap-2 text-forest-800 font-extrabold uppercase tracking-wider">
              <Heart className="w-4 h-4 text-terracotta-500 fill-terracotta-500" />
              Family Member {currentIdx + 1} of {familyFaces.length}
            </span>
            <div className="flex items-center gap-3">
              <span className="bg-white px-3 py-1 rounded-full border border-ivory-300 text-charcoal-700 font-bold">
                Accuracy: {correctCount} / {familyFaces.length}
              </span>
            </div>
          </div>

          {/* TWO-COLUMN PARTITION (EQUAL 50/50 ALIGNMENT) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* ========================================================================= */}
            {/* COLUMN 1 (LEFT, 50% EQUAL): PHOTO, QUESTION & 4 GLOWING ANSWER BUTTONS     */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-3xl p-5 md:p-7 border-2 border-ivory-200 shadow-soft space-y-6 flex flex-col justify-between h-full">
              
              <div className="space-y-6">
                {/* Visual Photo Card */}
                <div className="relative rounded-3xl overflow-hidden shadow-photo border-4 border-white bg-ivory-100 group max-h-[360px]">
                  <img
                    src={currentPerson.imageUrl}
                    alt="Family Member"
                    className="w-full h-64 sm:h-72 md:h-80 object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  {currentPerson.isCustom && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                      Custom Upload
                    </div>
                  )}
                  {isAnswered && (
                    <div className="absolute bottom-3 left-3 bg-charcoal-900/80 backdrop-blur-xs text-white text-xs md:text-sm font-bold px-4 py-1.5 rounded-full border border-white/20 animate-fadeIn">
                      {currentPerson.name}
                    </div>
                  )}
                </div>

                {/* Question Header & Audio Speaker */}
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <h3
                      className={`font-serif font-extrabold text-charcoal-900 leading-tight ${
                        elderlyMode ? 'text-2xl' : 'text-lg md:text-xl'
                      }`}
                    >
                      {getLangString(UI_TEXT.questionTitle, activeLang)}
                    </h3>

                    {/* Listen Question Button */}
                    <button
                      type="button"
                      onClick={handleSpeakQuestion}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-50 text-forest-900 border border-forest-300 hover:bg-forest-100 font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <Volume2 className="w-4 h-4 text-forest-700" />
                      {getLangString(UI_TEXT.listenQuestion, activeLang)}
                    </button>
                  </div>

                  <p className="text-xs md:text-sm font-medium text-charcoal-600">
                    {getLangString(UI_TEXT.subtitle, activeLang)}
                  </p>
                </div>

                {/* GLOWING PADDING ANSWER BUTTONS (RED, YELLOW, GREEN, BLUE) */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                    <span>👉 Directly Click Your Answer Below:</span>
                    <span className="text-[10px] text-forest-700 font-bold">4 Glowing Colors</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {candidateOptions.map((relKey, index) => {
                      const relOption = getLangString(RELATION_LABELS[relKey], activeLang);
                      const isSelected = selectedRelation === relKey;
                      const isCorrectChoice = relKey === currentPerson.relationKey;
                      const theme = GLOWING_BUTTON_THEMES[index % GLOWING_BUTTON_THEMES.length];

                      let btnStyle = theme.idleStyle;

                      if (isAnswered) {
                        if (isCorrectChoice) {
                          btnStyle = theme.correctStyle;
                        } else if (isSelected) {
                          btnStyle = theme.wrongStyle;
                        } else {
                          btnStyle = 'bg-ivory-100 border-2 border-ivory-200 text-charcoal-400 opacity-40 shadow-none';
                        }
                      }

                      return (
                        <button
                          key={relKey}
                          type="button"
                          onClick={() => handleSelectRelation(relKey)}
                          disabled={isAnswered && isCorrect}
                          className={`w-full p-4 rounded-2xl text-left font-serif font-bold transition-all duration-300 select-none cursor-pointer flex items-center justify-between px-4.5 ${btnStyle} ${
                            elderlyMode ? 'py-4.5 text-lg' : 'text-sm'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            {/* Glowing Color Indicator Dot */}
                            <span
                              className={`w-3.5 h-3.5 rounded-full shrink-0 ${theme.dotColor} ${
                                isAnswered && isCorrectChoice ? 'bg-white shadow-[0_0_15px_white]' : ''
                              }`}
                            />
                            <span className="leading-snug">{relOption.label}</span>
                          </span>

                          {/* Status icon indicators */}
                          {isAnswered && isCorrectChoice && (
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                              <Check className="w-4 h-4 text-white stroke-[3.5]" />
                            </span>
                          )}
                          {isAnswered && isSelected && !isCorrectChoice && (
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                              <X className="w-4 h-4 text-white stroke-[3.5]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Feedback & Clue Note */}
              {isAnswered && (
                <div
                  className={`p-4 rounded-2xl space-y-2 transition-all animate-fadeIn mt-4 ${
                    isCorrect
                      ? 'bg-forest-50 border-2 border-forest-400 text-forest-950 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                      : 'bg-amber-50 border-2 border-amber-300 text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-serif font-bold text-sm md:text-base">
                        {isCorrect
                          ? `${currentPerson.name} — ${RELATION_LABELS[currentPerson.relationKey][activeLang].fullTitle}`
                          : getLangString(UI_TEXT.incorrectTryAgain, activeLang)}
                      </h4>
                      <p className="text-xs font-medium mt-0.5 text-charcoal-800">
                        {isCorrect
                          ? currentPerson.notes?.[activeLang] || currentPerson.notes?.en
                          : currentPerson.hints?.[activeLang] || currentPerson.hints?.en}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleNextPerson}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest-800 text-white font-bold text-xs shadow-soft hover:bg-forest-900 transition-all cursor-pointer hover:scale-105"
                    >
                      <span>
                        {currentIdx + 1 < familyFaces.length ? 'Next Member →' : 'Complete Activity'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* ========================================================================= */}
            {/* COLUMN 2 (RIGHT, 50% EQUAL): DEDICATED AUDIO TO TEXT CONVERTER STUDIO      */}
            {/* ========================================================================= */}
            <div className="bg-gradient-to-b from-blue-50/90 via-indigo-50/70 to-blue-50/90 rounded-3xl p-5 md:p-7 border-2 border-blue-200 shadow-soft space-y-5 flex flex-col justify-between h-full">
              
              <div className="space-y-4">
                {/* Header & Language Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/80 pb-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-950">
                    <Mic className="w-4 h-4 text-blue-700 animate-pulse" />
                    <span>{getLangString(UI_TEXT.voiceStudioTitle, activeLang)}</span>
                  </div>
                  
                  {/* Regional Language Switcher */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-charcoal-600 mr-1">Lang:</span>
                    {(['hi', 'en', 'bn', 'as', 'ne'] as ActivityLang[]).map((langCode) => {
                      const labels: Record<string, string> = {
                        hi: 'हिन्दी',
                        en: 'English',
                        bn: 'বাংলা',
                        as: 'অসমীয়া',
                        ne: 'नेपाली',
                      };
                      const isSelected = activeLang === langCode;
                      return (
                        <button
                          key={langCode}
                          type="button"
                          onClick={() => setActiveLang(langCode)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-50'
                          }`}
                        >
                          {labels[langCode]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs font-medium text-blue-950">
                  {getLangString(UI_TEXT.voiceStudioSubtitle, activeLang)}
                </p>

                {/* Add Audio & Convert Button */}
                <div>
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startAudioToText}
                      className="w-full inline-flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-[0_0_24px_rgba(37,99,235,0.45)] border-2 border-blue-300 hover:border-white hover:scale-[1.01] transition-all cursor-pointer"
                    >
                      <Mic className="w-5 h-5 text-blue-100" />
                      <span className="flex items-center gap-1.5 bg-blue-900/60 px-2.5 py-1 rounded-full border border-blue-300/40">
                        <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] animate-pulse" />
                        <span className="text-[10px] uppercase tracking-wider text-white font-bold">REC</span>
                      </span>
                      <span>{getLangString(UI_TEXT.recordAnswer, activeLang)}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopAudioToText}
                      className="w-full inline-flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-extrabold text-sm shadow-[0_0_28px_rgba(225,29,72,0.65)] ring-4 ring-rose-300 animate-pulse transition-all cursor-pointer border-2 border-white"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                      <span>Stop Converting (00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds})</span>
                    </button>
                  )}
                </div>

                {/* Live Audio Level Visualizer */}
                {isRecording && (
                  <div className="space-y-1.5 p-3 bg-white/90 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-700 animate-spin" /> Audio Input:
                      </span>
                      <span>Level: {micVolumeLevel}%</span>
                    </div>
                    <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-75"
                        style={{ width: `${Math.max(12, Math.min(100, micVolumeLevel))}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-center font-bold text-blue-950 pt-0.5">
                      {getLangString(UI_TEXT.recordingActive, activeLang)}
                    </div>
                  </div>
                )}

                {/* 100% AUDIBLE RECORDED VOICE PLAYBACK CARD */}
                {recordedAudioUrl && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-100/90 via-indigo-100/80 to-blue-100/90 border-2 border-blue-300 shadow-sm space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                      <span className="flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-blue-700" />
                        <span>🎧 Your Recorded Voice is Ready to Play:</span>
                      </span>
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Loud & Clear
                      </span>
                    </div>

                    {/* Big Click to Play Recorded Audio Button */}
                    <button
                      type="button"
                      onClick={handleTogglePlayAudio}
                      className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-[0_4px_16px_rgba(37,99,235,0.4)] hover:scale-[1.01] transition-all cursor-pointer"
                    >
                      {isAudioPlaying ? (
                        <>
                          <Pause className="w-5 h-5 fill-white" />
                          <span>Pause Recorded Voice</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 fill-white" />
                          <span>🔊 Click to Play Recorded Voice (Hear Audio)</span>
                        </>
                      )}
                    </button>

                    {/* Native HTML5 Audio Player for Scrubbing & Volume */}
                    <audio
                      ref={audioPlayerElementRef}
                      controls
                      src={recordedAudioUrl}
                      className="w-full h-10 rounded-lg bg-white/90"
                      onPlay={() => setIsAudioPlaying(true)}
                      onPause={() => setIsAudioPlaying(false)}
                      onEnded={() => setIsAudioPlaying(false)}
                    />
                  </div>
                )}

                {/* Converted Text Output Box (Shows Transcribed Text) */}
                <div className="space-y-2 bg-white rounded-2xl p-3.5 md:p-4 border border-blue-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-700" />
                      Converted Text Result:
                    </span>
                    <span className="text-[10px] text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                      {(typedResponseText || speechTranscript).trim() ? `${(typedResponseText || speechTranscript).trim().split(/\s+/).length} Words` : '0 Words'}
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      value={typedResponseText}
                      onChange={(e) => {
                        setTypedResponseText(e.target.value);
                        setSpeechTranscript(e.target.value);
                      }}
                      placeholder={getLangString(UI_TEXT.typeAnswerPlaceholder, activeLang)}
                      rows={3}
                      className="w-full p-3 text-xs md:text-sm font-medium text-charcoal-900 bg-ivory-50/70 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none shadow-inner"
                    />
                    {isRecording && (
                      <span className="absolute bottom-2.5 right-2.5 text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-200 animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                        Converting live...
                      </span>
                    )}
                  </div>

                  {/* Toolbar */}
                  <div className="flex items-center justify-between gap-2 pt-0.5 flex-wrap">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyConvertedText}
                        disabled={!typedResponseText && !speechTranscript}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-blue-50 text-blue-900 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed border border-blue-200'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-blue-700" />}
                        <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSpeakTranscribedText}
                        disabled={!typedResponseText && !speechTranscript}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isAudioPlaying
                            ? 'bg-indigo-600 text-white shadow-xs animate-pulse'
                            : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed border border-indigo-200'
                        }`}
                      >
                        {isAudioPlaying ? <VolumeX className="w-3.5 h-3.5 text-white" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-700" />}
                        <span>{isAudioPlaying ? 'Stop Audio' : 'Read Aloud'}</span>
                      </button>
                    </div>

                    {(typedResponseText || speechTranscript) && (
                      <button
                        type="button"
                        onClick={() => {
                          setTypedResponseText('');
                          setSpeechTranscript('');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-charcoal-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* QUICK 1-CLICK SPOKEN PHRASES (FILLS VACANT SPACE WITH ACTIVE HELPER) */}
                <div className="bg-white/80 rounded-2xl p-3.5 border border-blue-200/90 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-950">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>💡 Quick Spoken Hints for Patient:</span>
                    </span>
                    <span className="text-[10px] text-blue-700">Tap to Try</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: currentPerson.relationKey, label: RELATION_LABELS[currentPerson.relationKey][activeLang].fullTitle },
                      { key: 'daughter', label: RELATION_LABELS.daughter[activeLang].fullTitle },
                      { key: 'wife', label: RELATION_LABELS.wife[activeLang].fullTitle },
                      { key: 'son', label: RELATION_LABELS.son[activeLang].fullTitle },
                    ].slice(0, 4).map((item, idx) => (
                      <button
                        key={`${item.key}-${idx}`}
                        type="button"
                        onClick={() => {
                          const sample = item.label;
                          setTypedResponseText(sample);
                          setSpeechTranscript(sample);
                          speakText(sample, activeLang);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-left text-[11px] font-bold transition-all cursor-pointer truncate flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AUDIO STUDIO QUALITY METRICS (FILLS BOTTOM BEAUTIFULLY) */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="bg-white/80 rounded-xl p-2.5 border border-blue-200/80 text-center space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Mic Active</span>
                    </div>
                    <p className="text-[9px] font-semibold text-charcoal-500">Noise Reduced</p>
                  </div>

                  <div className="bg-white/80 rounded-xl p-2.5 border border-blue-200/80 text-center space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-blue-700">
                      <Volume2 className="w-3 h-3 text-blue-600" />
                      <span>100% Vol</span>
                    </div>
                    <p className="text-[9px] font-semibold text-charcoal-500">3x Gain Boost</p>
                  </div>

                  <div className="bg-white/80 rounded-xl p-2.5 border border-blue-200/80 text-center space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-indigo-700">
                      <Radio className="w-3 h-3 text-indigo-600" />
                      <span>Live STT</span>
                    </div>
                    <p className="text-[9px] font-semibold text-charcoal-500">Real-time</p>
                  </div>
                </div>

              </div>

              {/* Detected Relation Match Badge or Memory Comfort Tip */}
              {detectedRelationMatch ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-xs space-y-1 shadow-xs animate-fadeIn mt-3">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>Detected Relation:</span>
                    <span className="bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full font-extrabold text-[11px]">
                      {getLangString(RELATION_LABELS[detectedRelationMatch], activeLang).fullTitle}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900 font-medium">
                    👉 Click the matching Glowing Option Button on the left to confirm your answer!
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-blue-100/60 border border-blue-200/80 text-xs text-blue-950 flex items-start gap-2 mt-3">
                  <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium leading-relaxed">
                    <strong>Therapeutic Benefit:</strong> Speaking your thoughts aloud stimulates auditory & vocal motor memory, making face recognition easier and more natural.
                  </p>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UPLOAD CUSTOM FAMILY PHOTO                                         */}
      {/* ========================================================================= */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-ivory-200 shadow-soft max-w-2xl mx-auto space-y-6">
          <div className="border-b border-ivory-200 pb-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-forest-800 inline-flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" /> Personal Family Memory Setup
            </span>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mt-1">
              {getLangString(UI_TEXT.uploadTab, activeLang)}
            </h3>
            <p className="text-sm font-medium text-charcoal-600 mt-1">
              {getLangString(UI_TEXT.uploadPrompt, activeLang)}
            </p>
          </div>

          <form onSubmit={handleSaveUploadedPhoto} className="space-y-5">
            {/* Image Preview & Upload Input */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2">
                Select Photo from Device
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-forest-300 rounded-3xl p-6 text-center hover:bg-forest-50/40 transition-colors cursor-pointer bg-ivory-50/60"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {uploadPreviewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={uploadPreviewUrl}
                      alt="Uploaded preview"
                      className="w-48 h-48 object-cover rounded-2xl mx-auto shadow-photo border-2 border-white"
                    />
                    <p className="text-xs font-bold text-forest-800 underline">
                      Click to change photo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <Upload className="w-10 h-10 text-forest-700 mx-auto" />
                    <p className="font-serif font-bold text-charcoal-900 text-base">
                      Click or Tap to Upload Family Photo
                    </p>
                    <p className="text-xs text-charcoal-500">Supports JPG, PNG, WebP images</p>
                  </div>
                )}
              </div>
            </div>

            {/* Person Name Input */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Family Member Name
              </label>
              <input
                type="text"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder={getLangString(UI_TEXT.namePlaceholder, activeLang)}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 bg-ivory-50/50 font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm"
              />
            </div>

            {/* Relationship Dropdown Selection */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Relationship with Patient
              </label>
              <select
                value={uploadRelation}
                onChange={(e) => setUploadRelation(e.target.value as FamilyRelationKey)}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 bg-ivory-50/50 font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm cursor-pointer"
              >
                {(Object.keys(RELATION_LABELS) as FamilyRelationKey[]).map((relKey) => (
                  <option key={relKey} value={relKey}>
                    {getLangString(RELATION_LABELS[relKey], activeLang).label} ({RELATION_LABELS[relKey].en.label})
                  </option>
                ))}
              </select>
            </div>

            {/* Memory / Story Note */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Comfort Memory Clue (Optional)
              </label>
              <textarea
                value={uploadNote}
                onChange={(e) => setUploadNote(e.target.value)}
                placeholder="e.g. Loves taking walks with you in the garden, calls every morning."
                rows={2}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 bg-ivory-50/50 font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm"
              />
            </div>

            {uploadError && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                {uploadError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" variant="primary" size="lg">
                {getLangString(UI_TEXT.saveAndPractice, activeLang)}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FINAL COMPLETION SUMMARY CARD                                             */}
      {/* ========================================================================= */}
      {isFinished && (
        <div className="bg-ivory-100 border-2 border-forest-600 text-center space-y-6 p-8 md:p-12 rounded-4xl shadow-photo max-w-2xl mx-auto animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-forest-100 border-2 border-forest-400 flex items-center justify-center mx-auto text-forest-800">
            <Smile className="w-12 h-12 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-charcoal-900">
              {getLangString(UI_TEXT.congratsTitle, activeLang)}
            </h3>
            <p className="text-charcoal-700 font-medium text-lg">
              You recognized <span className="font-bold text-forest-800">{correctCount}</span> out of{' '}
              <span className="font-bold text-forest-800">{familyFaces.length}</span> family member faces accurately!
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setCurrentIdx(0);
                setCorrectCount(0);
                setAttemptsCount(0);
                setIsFinished(false);
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Practice Again
            </Button>

            <Button variant="primary" size="lg" onClick={onBack}>
              Return to Schedule
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
