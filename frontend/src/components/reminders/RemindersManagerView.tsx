import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Pill,
  Droplet,
  Calendar,
  CheckCircle2,
  Volume2,
  Sparkles,
  Utensils,
  Coffee,
  Gamepad2,
  Heart,
  Trophy,
  PartyPopper,
  X,
  RotateCcw,
  Trash2,
  Bell,
  AlertCircle,
  Check,
  Activity,
  Flame,
  UserCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useReminderStore } from '../../stores/useReminderStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLanguageStore, SupportedLanguage } from '../../stores/useLanguageStore';
import { speakText, playAcousticChime } from '../../utils/speech';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { VoiceButton } from '../common/VoiceButton';
import { Modal } from '../common/Modal';

export type UnifiedCategory = 'all' | 'medicine' | 'food_drink' | 'game' | 'walk' | 'appointment';

export interface UnifiedCareItem {
  id: string;
  time: string; // e.g. "07:00 AM"
  category: 'medicine' | 'food_drink' | 'game' | 'walk' | 'appointment';
  title: (Partial<Record<SupportedLanguage, string>> & { en?: string }) | string;
  notes: (Partial<Record<SupportedLanguage, string>> & { en?: string }) | string;
  appreciation?: (Partial<Record<SupportedLanguage, string>> & { en?: string }) | string;
  iconType: 'tea' | 'pill' | 'food' | 'water' | 'game' | 'walk' | 'doctor' | 'bell';
  badgeBg: string;
  isCompleted: boolean;
  completedAt?: string;
  isCustom?: boolean;
}

const DEFAULT_CARE_ROUTINE: UnifiedCareItem[] = [
  {
    id: 'care-1',
    time: '07:00 AM',
    category: 'food_drink',
    title: {
      en: 'Morning Ginger & Tulsi Tea (Warm Drink)',
      hi: 'सुबह की अदरक व तुलसी वाली चाय (Warm Drink)',
      as: 'পুৱাৰ আদা আৰু তুলসীৰ চাহ (উমাল পানীয়)',
      bn: 'সকালের আদা ও তুলসী চা (গরম পানীয়)',
      ne: 'बिहानी अदुवा र तुलसी चिया (न्यानो पेय)',
      brx: 'फुंनि हादै आरो थुलसि साहा (गुदुं लोंनाय)',
    },
    notes: {
      en: 'Warm herbal tea on the veranda to awaken senses and hydrate gently.',
      hi: 'बरामदे में बैठकर ताज़ी सुगंध के साथ गरम चाय पिएं और शरीर को ऊर्जा दें।',
      as: 'বাৰান্দাত বহি সুগন্ধি চাহ উপভোগ কৰক আৰু শৰীৰ সতেজ কৰক।',
      bn: 'বারান্দায় বসে তাজা চায়ের মিষ্টি সুবাস উপভোগ করুন।',
      ne: 'वरान्डामा बसेर न्यानो हर्बल चियाको मज्जा लिनुहोस्।',
      brx: 'फुंनि साहा लोंनानै देहाखौ मोजां खालाम।',
    },
    appreciation: {
      en: 'Wonderful! A warm morning drink refreshes your body and awakens your senses. You are starting the day so well!',
      hi: 'बहुत सुंदर! सुबह की गरमा-गरम चाय आपके शरीर और मन को तरोताज़ा करती है। आपका दिन बहुत शुभ हो!',
      as: 'বৰ ধুনীয়া! পুৱাৰ উমাল চাহে আপোনাৰ দেহ আৰু মন প্ৰশান্ত কৰে। আপোনাৰ দিনটো শুভ হওক!',
      bn: 'চমৎকার! ভোরের মিষ্টি চা আপনার শরীর ও মনকে সতেজ করে তোলে। আপনার দিনটি আনন্দময় হোক!',
      ne: 'अति राम्रो! बिहानको तातो चियाले तपाईंको शरीर र मनलाई ताजा बनाउँछ। दिन शुभ रहोस्!',
      brx: 'जोबोर मोजां! फुंनि साहा लोंनानै नोंथांनि गोसोआ गोजोन जाबाय।',
    },
    iconType: 'tea',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    isCompleted: false,
  },
  {
    id: 'care-2',
    time: '08:00 AM',
    category: 'medicine',
    title: {
      en: 'Morning Blood Pressure & Memory Medicine',
      hi: 'सुबह की बीपी व स्मरण शक्ति की दवाई',
      as: 'পুৱাৰ ৰক্তচাপ আৰু স্মৃতিবৰ্ধক ঔষধ',
      bn: 'সকালের রক্তচাপ ও স্মৃতিশক্তির ওষুধ',
      ne: 'बिहानी रक्तचाप र स्मरण औषधी',
      brx: 'फुंनि थैनि नारथाय आरो मुलि लोंनाय',
    },
    notes: {
      en: 'Prescribed medication with 1 full glass of fresh water after waking up.',
      hi: 'डॉक्टर द्वारा दी गई गोली एक पूरे गिलास ताज़े पानी के साथ लें।',
      as: 'এগিলাচ পৰিষ্কাৰ পানীৰে সৈতে চিকিৎসকে নিৰ্ধাৰণ কৰা ঔষধ গ্ৰহণ কৰক।',
      bn: 'এক গ্লাস পরিষ্কার জলের সাথে সকালের ওষুধ সেবন করুন।',
      ne: 'एक गिलास ताजा पानीसँग बिहानको औषधी खानुहोस्।',
      brx: 'एसे दैजों मुलि लोंना ला।',
    },
    appreciation: {
      en: 'Fantastic! Taking your morning medication on time protects your heart and memory vitality. We are so proud of you!',
      hi: 'बहुत खूब! समय पर दवाई लेना आपके स्वास्थ्य और याददाश्त को मजबूत बनाए रखता है। शाबाश!',
      as: 'অপূৰ্ব! সময়মতে ঔষধ খোৱাটোৱে আপোনাৰ স্বাস্থ্য আৰু স্মৃতি সবল ৰাখে। বৰ ভাল লাগিল!',
      bn: 'অসাধারণ! সঠিক সময়ে ওষুধ গ্রহণ আপনার স্বাস্থ্য ও স্মৃতিকে সুরক্ষিত রাখে। সাবাশ!',
      ne: 'उत्कृष्ट! समयमा औषधी खाँदा स्वास्थ्य राम्रो रहन्छ। धेरै धेरै धन्यवाद!',
      brx: 'मोजां खामानि! समाव मुलि लोंनानै देहाखौ मोजां लाखिबाय।',
    },
    iconType: 'pill',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
    isCompleted: false,
  },
  {
    id: 'care-3',
    time: '08:45 AM',
    category: 'food_drink',
    title: {
      en: 'Nutritious Breakfast (Warm Poha / Idli & Fruits)',
      hi: 'पौष्टिक नाश्ता (गर्म पोहा / इडली व ताज़े फल)',
      as: 'পুষ্টিকৰ পুৱাৰ আহাৰ (উমাল চিৰা-দৈ / ফল-মূল)',
      bn: 'পুষ্টিকর সকালের নাস্তা (গরম খাবার ও তাজা ফল)',
      ne: 'पौष्टिक बिहानी खाजा (न्यानो खाना र ताजा फलफूल)',
      brx: 'फुंनि जामुं (गोथां जामुं आरो फल-मुल)',
    },
    notes: {
      en: 'Fresh, easily digestible breakfast rich in fiber, vitamins, and protein.',
      hi: 'सुपाच्य व पौष्टिक नाश्ता करें जिससे दिन भर ऊर्जा बनी रहे।',
      as: 'সহজে হজম হোৱা সুস্বাদু পুষ্টিকৰ আহাৰ গ্ৰহণ কৰক।',
      bn: 'হালকা অথচ পুষ্টিকর খাবার আপনার শরীরে শক্তি যোগাবে।',
      ne: 'सजिलै पच्ने स्वस्थकर नास्ता खानुहोस्।',
      brx: 'देहानि थाखाय मोजां जामुं जा।',
    },
    appreciation: {
      en: 'Superb! A wholesome breakfast provides physical strength and lasting vitality for your cheerful day ahead!',
      hi: 'लाजवाब! पौष्टिक नाश्ता आपके शरीर को दिनभर के लिए ऊर्जा और शक्ति प्रदान करता है!',
      as: 'চমৎকাৰ! পুষ্টিকৰ আহাৰে আপোনাক দিনটোৰ বাবে শক্তি আৰু সজীৱতা প্ৰদান কৰিব!',
      bn: 'খুব ভালো! পুষ্টিকর নাস্তা সারা দিনের জন্য আপনাকে শক্তি ও প্রাণবন্ত রাখবে!',
      ne: 'उत्कृष्ट! पौष्टिक नास्ताले तपाईंलाई दिनभरि उर्जा र स्फूर्ति दिन्छ!',
      brx: 'जोबोर मोजां! जामुं जानानै गोसोआ गोजोन जाबाय।',
    },
    iconType: 'food',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    isCompleted: false,
  },
  {
    id: 'care-4',
    time: '10:30 AM',
    category: 'game',
    title: {
      en: 'Daily Brain & Face Recognition Practice',
      hi: 'दैनिक मस्तिष्क व चेहरा पहचान अभ्यास',
      as: 'দৈনন্দিন স্মৃতি আৰু পৰিয়াল চিনাক্তকৰণ খেল',
      bn: 'দৈনিক ব্রেন ও পরিবার চেনার খেলা',
      ne: 'दैनिक मस्तिष्क र अनुहार पहिचान अभ्यास',
      brx: 'गोसोखांथि आरो महर सिनायनाय गेलेनाय',
    },
    notes: {
      en: '10-minute visual memory and family photo identification practice.',
      hi: '10 मिनट तक परिवार के सदस्यों की तस्वीरें देखें और यादों को ताज़ा करें।',
      as: '১০ মিনিট পৰিয়ালৰ ছবি আৰু স্মৃতি ৰোমন্থন কৰক।',
      bn: '১০ মিনিট পরিবারের প্রিয়জনদের ছবি ও স্মৃতি চর্চা করুন।',
      ne: '१० मिनेट परिवारका तस्बिरहरू हेरेर सम्झना ताजा गर्नुहोस्।',
      brx: '१० मिनिट नख’रनि महर सिनायनाय गेले।',
    },
    appreciation: {
      en: 'Champion Performance! 🏆 Playing brain games stimulates neurons and keeps cherished memories active and bright!',
      hi: 'शानदार प्रदर्शन! 🏆 दिमाग की कसरत यादों को सुरक्षित और उज्ज्वल बनाए रखती है!',
      as: 'অসাধাৰণ প্ৰদৰ্শন! 🏆 মগজুৰ অনুশীলনে আপোনাৰ স্মৃতিশক্তি চিৰসেউজ কৰি ৰাখে!',
      bn: 'চ্যাম্পিয়ন পারফরম্যান্স! 🏆 মস্তিষ্কের ব্যায়াম স্মৃতিশক্তিকে সতেজ ও প্রাণবন্ত রাখে!',
      ne: 'उत्कृष्ट नतिजा! 🏆 मस्तिष्कको अभ्यासले सम्झनाहरू सधैं ताजा राख्छ!',
      brx: 'जोबोर मोजां गेलेबाय! 🏆 गोसोखांथिया मोजां जाबाय।',
    },
    iconType: 'game',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    isCompleted: false,
  },
  {
    id: 'care-5',
    time: '11:45 AM',
    category: 'food_drink',
    title: {
      en: 'Fresh Coconut Water & Hydration Check',
      hi: 'ताज़ा नारियल पानी व जलपान (Hydration Check)',
      as: 'নাৰিকলৰ পানী আৰু পৰ্যাপ্ত পানী গ্ৰহণ',
      bn: 'তাজা ডাবের জল ও জলপান',
      ne: 'ताजा नरिवल पानी र जलपान',
      brx: 'नारिखल दै आरो दै लोंनाय',
    },
    notes: {
      en: '1 glass of fresh coconut water or lemonade to stay hydrated.',
      hi: 'एक गिलास ताज़ा नारियल पानी या नींबू पानी पिएं ताकि शरीर में नमी बनी रहे।',
      as: 'এগিলাচ ডাবৰ পানী বা নেমু পানী খাই শৰীৰ হাইড্ৰেট ৰাখক।',
      bn: 'এক গ্লাস ডাবের জল পান করে শরীরকে সতেজ রাখুন।',
      ne: 'एक गिलास नरिवल पानी वा ताजा पानी पिउनुहोस्।',
      brx: 'एसे गोथां दै लोंनानै देहाखौ सिबि।',
    },
    appreciation: {
      en: 'Excellent! Regular hydration keeps brain cells energized, prevents fatigue, and keeps you feeling light and fresh!',
      hi: 'बहुत बढ़िया! पर्याप्त पानी पीने से दिमाग सक्रिय रहता है और शरीर हल्का महसूस करता है!',
      as: 'অতি উত্তম! পৰ্যাপ্ত পানী সেৱনে মগজু সক্ৰিয় ৰাখে আৰু ক্লান্তি দূৰ কৰে!',
      bn: 'চমৎকার! নিয়মিত জলপান মস্তিষ্ককে সতেজ রাখে এবং ক্লান্তি দূর করে!',
      ne: 'अति उत्तम! प्रशस्त पानी पिउनाले शरीर स्फूर्त रहन्छ!',
      brx: 'मोजां खामानि! दै लोंनानै देहाखौ गोहो गोनां खालामबाय।',
    },
    iconType: 'water',
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
    isCompleted: false,
  },
  {
    id: 'care-6',
    time: '01:15 PM',
    category: 'food_drink',
    title: {
      en: 'Warm Wholesome Lunch (Khichdi / Rice & Dal)',
      hi: 'दोपहर का पौष्टिक भोजन (खिचड़ी / दाल-भात व हरी सब्ज़ी)',
      as: 'দুপৰীয়াৰ তৃপ্তিদায়ক আহাৰ (ভাত, দাইল আৰু শাক-পাচলি)',
      bn: 'দুপুরের স্বাস্থ্যকর আহার (ভাত, ডাল ও টাটকা তরকারি)',
      ne: 'दिउँसोको पौष्टिक खाना (दाल, भात र हरियो सागपात)',
      brx: 'सानजौफुनि जामुं (माइख्रं आरो गोथां एंगख्रै)',
    },
    notes: {
      en: 'Comforting afternoon meal followed by a calm 20-minute resting break.',
      hi: 'गरमा-गरम सुपाच्य भोजन करें और इसके बाद शांति से विश्राम करें।',
      as: 'সুস্বাদু দুপৰীয়াৰ আহাৰ খাই কিছু সময় জিৰণি লওক।',
      bn: 'দুপুরের পুষ্টিকর খাবার খেয়ে কিছুক্ষণ শান্ত হয়ে বিশ্রাম নিন।',
      ne: 'मिठो खाना खाएर केही बेर आराम गर्नुहोस्।',
      brx: 'दुपोरनि जामुं जानानै एसे जिराय।',
    },
    appreciation: {
      en: 'Great job! A wholesome lunch restores your physical energy. Now enjoy a peaceful and restful afternoon break!',
      hi: 'शाबाश! पौष्टिक भोजन ने आपके शरीर को भरपूर पोषण दिया है। अब शांति से विश्राम करें!',
      as: 'বৰ ভাল কাম! দুপৰীয়াৰ আহাৰে আপোনাক পৰিপুষ্টি দিলে। এতিয়া শান্তভাৱে বিশ্ৰাম লওক!',
      bn: 'সাবাশ! দুপুরের খাবার আপনার শরীরে বল এনে দেবে। এবার আরাম করুন!',
      ne: 'धेरै राम्रो! खानाले तपाईंलाई नयाँ ऊर्जा दिएको छ। अब आराम गर्नुहोस्!',
      brx: 'जोबोर मोजां! जामुं जानानै गोसोआ गोजोन जाबाय।',
    },
    iconType: 'food',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    isCompleted: false,
  },
  {
    id: 'care-7',
    time: '04:30 PM',
    category: 'walk',
    title: {
      en: 'Gentle Veranda / Garden Walk & Fresh Air',
      hi: 'शाम की हल्की सैर व ताज़ी हवा (Garden Walk)',
      as: 'বিয়লিৰ সুন্দৰ পদভ্ৰমণ আৰু মুকলি বতাহ',
      bn: 'বিকেলের শান্ত পদচারণা ও মুক্ত বাতাস',
      ne: 'साँझको हल्का हिँडडुल र ताजा हावा',
      brx: 'बेलासिनि एसे थाबायनाय आरो बार लानाय',
    },
    notes: {
      en: '15-minute gentle stroll on soft grass, feeling the evening breeze and hearing birds.',
      hi: 'बगीचे में टहलें, पक्षियों की चहचहाहट सुनें और प्रकृति का आनंद लें।',
      as: 'বাগানত খোজ কাঢ়ক, গছ-গছনিৰ সেউজীয়া উপভোগ কৰক।',
      bn: 'বাগানে মৃদু হেঁটে পাখির ডাক ও মুক্ত বাতাস উপভোগ করুন।',
      ne: 'बगैंचामा हिँडेर प्रकृतिको रमाइलो हावा लिनुहोस्।',
      brx: 'बारियाव एसे थाबायनानै गोसोखौ मोजां खालाम।',
    },
    appreciation: {
      en: 'Remarkable! Walking in nature calms the nerves, improves balance, and brings joy to the heart!',
      hi: 'अद्भुत! प्रकृति के बीच टहलने से मन शांत होता है और हृदय प्रसन्न रहता है!',
      as: 'অপৰূপ! প্ৰকৃতিৰ মাজত খোজ কঢ়াটোৱে মন শান্ত কৰে আৰু শৰীৰ সুস্থ ৰাখে!',
      bn: 'অপূর্ব! মুক্ত বাতাসে হাঁটলে মন শান্ত হয় এবং শরীর হালকা লাগে!',
      ne: 'अति राम्रो! प्रकृतिको काखमा हिँड्दा मन शान्त हुन्छ!',
      brx: 'जोबोर मोजां! थाबायनानै देहाया गोहो गोनां जाबाय।',
    },
    iconType: 'walk',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    isCompleted: false,
  },
  {
    id: 'care-8',
    time: '08:30 PM',
    category: 'medicine',
    title: {
      en: 'Night Care Medication & Warm Saffron Milk',
      hi: 'रात की दवाई व गरम हल्दी/केसर वाला दूध',
      as: 'নিশাৰ নিয়মীয়া ঔষধ আৰু উমাল গাখীৰ',
      bn: 'রাতের ওষুধ ও হালকা গরম দুধ',
      ne: 'रातिको औषधी र न्यानो दूध',
      brx: 'हरनि मुलि आरो गुदुं गाइखेर लोंनाय',
    },
    notes: {
      en: 'Take evening prescribed pills with a warm cup of comforting turmeric/saffron milk for restful sleep.',
      hi: 'सोने से पहले की दवाई लें और गरम दूध पीकर शांतिपूर्ण नींद के लिए तैयार हों।',
      as: 'ৰাতিৰ ঔষধ খাই একাপ উমাল গাখীৰৰ সৈতে গভীৰ টোপনিৰ বাবে প্ৰস্তুত হওক।',
      bn: 'রাতের ওষুধ খেয়ে হালকা গরম দুধ পান করে নিশ্চিন্তে ঘুমাতে যান।',
      ne: 'औषधी खाएर न्यानो दूध पिई मिठो निद्रा लिनुहोस्।',
      brx: 'हरनि मुलि लोंनानै उन्दुनायनि थाखाय थियारि जा।',
    },
    appreciation: {
      en: 'Blessings & Peace! 🌙 You completed your daily care routine beautifully today. Have a restful, sound sleep!',
      hi: 'शुभ रात्रि! 🌙 आज आपने अपनी दैनिक दिनचर्या बहुत अच्छे से पूरी की। मीठी और सुखद नींद लें!',
      as: 'শুভ ৰাত্ৰি! 🌙 আজি আপুনি অতি নিষ্ঠাৰে দিনটোৰ সকলো যত্ন সম্পূৰ্ণ কৰিলে। সুখৰ টোপনি হওক!',
      bn: 'শুভ রাত্রি! 🌙 আপনি আজকের সমস্ত যত্ন সুন্দরভাবে সম্পন্ন করেছেন। শান্তিতে ঘুমান!',
      ne: 'शुभ रात्री! 🌙 आजको दिनचर्या सफलतापूर्वक पूरा भयो। मिठो निद्रा लागोस्!',
      brx: 'गोजोन हर! 🌙 दिनैनि गासै खामानिया मोजाङै जोबबाय। मोजाङै उन्दु।',
    },
    iconType: 'pill',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    isCompleted: false,
  },
];

const LOCAL_STORAGE_CARE_ROUTINE = 'smriti_setu_unified_care_routine';

export const RemindersManagerView: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageStore();
  const { reminders, addReminder, updateReminderState, deleteReminder } = useReminderStore();
  const { selectedPatient } = useAuthStore();

  const [routineItems, setRoutineItems] = useState<UnifiedCareItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CARE_ROUTINE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_CARE_ROUTINE;
  });

  const [activeCategory, setActiveCategory] = useState<UnifiedCategory>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [celebrationToast, setCelebrationToast] = useState<{ title: string; message: string } | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState('09:00 AM');
  const [formCategory, setFormCategory] = useState<UnifiedCareItem['category']>('medicine');
  const [formNotes, setFormNotes] = useState('');
  const [formAppreciation, setFormAppreciation] = useState('');

  // Persist routine items
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CARE_ROUTINE, JSON.stringify(routineItems));
    } catch (e) {
      console.warn('Could not save routine items', e);
    }
  }, [routineItems]);

  const getText = (field: any): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[currentLanguage] || field['en'] || Object.values(field)[0] || '';
  };

  // Toggle item completion with chime and celebratory speech
  const handleToggleTask = (item: UnifiedCareItem) => {
    const nextCompleted = !item.isCompleted;

    setRoutineItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              isCompleted: nextCompleted,
              completedAt: nextCompleted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            }
          : i
      )
    );

    if (nextCompleted) {
      playAcousticChime(659.25, 0.25);

      const apprecText = getText(item.appreciation) || `Great job! You completed ${getText(item.title)}.`;
      const toastTitle = getText(item.title);

      setCelebrationToast({
        title: toastTitle,
        message: apprecText,
      });

      speakText(apprecText, currentLanguage);

      // Auto dismiss celebration toast
      setTimeout(() => {
        setCelebrationToast(null);
      }, 5500);
    }
  };

  // Handle creating a new routine or reminder
  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    let iconType: UnifiedCareItem['iconType'] = 'pill';
    let badgeBg = 'bg-rose-100 text-rose-900 border-rose-300';

    if (formCategory === 'food_drink') {
      iconType = 'food';
      badgeBg = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    } else if (formCategory === 'game') {
      iconType = 'game';
      badgeBg = 'bg-blue-100 text-blue-900 border-blue-300';
    } else if (formCategory === 'walk') {
      iconType = 'walk';
      badgeBg = 'bg-teal-100 text-teal-900 border-teal-300';
    } else if (formCategory === 'appointment') {
      iconType = 'doctor';
      badgeBg = 'bg-amber-100 text-amber-900 border-amber-300';
    }

    const newItem: UnifiedCareItem = {
      id: `custom-${Date.now()}`,
      time: formTime,
      category: formCategory,
      title: formTitle.trim(),
      notes: formNotes.trim() || 'Custom care routine task scheduled with love.',
      appreciation: formAppreciation.trim() || 'Wonderful! Task completed with great care and dedication!',
      iconType,
      badgeBg,
      isCompleted: false,
      isCustom: true,
    };

    setRoutineItems((prev) => [newItem, ...prev]);

    // Also sync to persistent reminder store if medicine / appointment
    addReminder({
      patientId: selectedPatient?.id || 'pat-ner-001',
      title: formTitle.trim(),
      type: formCategory === 'appointment' ? 'appointment' : formCategory === 'food_drink' ? 'hydration' : 'medicine',
      scheduledTime: formTime,
      state: 'upcoming',
      notes: formNotes.trim(),
      voicePromptText: `Reminder for ${selectedPatient?.name?.split(' ')[0] || 'Patient'}: ${formTitle}`,
    });

    setFormTitle('');
    setFormNotes('');
    setFormAppreciation('');
    setIsAddModalOpen(false);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRoutineItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleResetSchedule = () => {
    setRoutineItems(DEFAULT_CARE_ROUTINE);
    localStorage.removeItem(LOCAL_STORAGE_CARE_ROUTINE);
  };

  // Filter items
  const filteredItems = routineItems.filter((item) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'medicine') return item.category === 'medicine';
    if (activeCategory === 'food_drink') return item.category === 'food_drink';
    if (activeCategory === 'game') return item.category === 'game';
    if (activeCategory === 'walk') return item.category === 'walk';
    if (activeCategory === 'appointment') return item.category === 'appointment';
    return true;
  });

  const totalCount = routineItems.length;
  const completedCount = routineItems.filter((i) => i.isCompleted).length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const medicineCompleted = routineItems.filter((i) => i.category === 'medicine' && i.isCompleted).length;
  const medicineTotal = routineItems.filter((i) => i.category === 'medicine').length;

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn max-w-5xl mx-auto pb-12">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Unified Daily Health & Reminders Hub
            </span>
            <span className="text-xs text-slate-300 font-bold hidden md:inline">
              Patient: <strong className="text-white">{selectedPatient?.name || 'Ranjit Borthakur'}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Clock className="w-8 h-8 text-amber-400" />
            <span>Daily Care Routine & Reminders Timetable</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Integrated schedule for daily medicines, nourishing meals, hydration checks, brain games, and health walks with supportive voice prompts.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <VoiceButton
            textToSpeak={`Welcome to your daily health routine and reminders timetable for ${selectedPatient?.name || 'today'}. You have ${totalCount} scheduled activities, with ${completedCount} completed so far.`}
            label="Listen Schedule Overview"
            size="sm"
          />

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-2xl font-black bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center gap-1.5 shadow-lg shadow-amber-400/20"
          >
            <Plus className="w-4 h-4" /> Add Routine / Reminder
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetSchedule}
            title="Reset to recommended routine"
            className="rounded-2xl text-slate-300 border-slate-700 hover:bg-slate-800"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 2. Health & Wellness Adherence Progress Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Progress</span>
            <div className="text-2xl font-black text-slate-900">{progressPct}%</div>
            <span className="text-xs font-semibold text-emerald-600">{completedCount} of {totalCount} completed</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medicine Adherence</span>
            <div className="text-2xl font-black text-slate-900">{medicineCompleted} / {medicineTotal}</div>
            <span className="text-xs font-semibold text-rose-600">Prescribed Doses</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hydration & Meals</span>
            <div className="text-2xl font-black text-slate-900">
              {routineItems.filter((i) => i.category === 'food_drink' && i.isCompleted).length} / {routineItems.filter((i) => i.category === 'food_drink').length}
            </div>
            <span className="text-xs font-semibold text-sky-600">Nourishment Checks</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Droplet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Care & Exercises</span>
            <div className="text-2xl font-black text-slate-900">
              {routineItems.filter((i) => (i.category === 'game' || i.category === 'walk') && i.isCompleted).length} Tasks
            </div>
            <span className="text-xs font-semibold text-purple-600">Cognitive & Physical</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-white text-slate-900 shadow-md border border-slate-200 scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          🌟 All Care Items ({routineItems.length})
        </button>

        <button
          onClick={() => setActiveCategory('medicine')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
            activeCategory === 'medicine'
              ? 'bg-white text-rose-700 shadow-md border border-rose-200 scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Pill className="w-4 h-4 text-rose-500" />
          <span>💊 Medicines ({routineItems.filter((i) => i.category === 'medicine').length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('food_drink')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
            activeCategory === 'food_drink'
              ? 'bg-white text-emerald-800 shadow-md border border-emerald-200 scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Utensils className="w-4 h-4 text-emerald-600" />
          <span>🍲 Meals & Drinks ({routineItems.filter((i) => i.category === 'food_drink').length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('game')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
            activeCategory === 'game'
              ? 'bg-white text-blue-800 shadow-md border border-blue-200 scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Gamepad2 className="w-4 h-4 text-blue-600" />
          <span>🧠 Brain Games ({routineItems.filter((i) => i.category === 'game').length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('walk')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
            activeCategory === 'walk'
              ? 'bg-white text-teal-800 shadow-md border border-teal-200 scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Heart className="w-4 h-4 text-teal-600" />
          <span>🚶 Walks & Care ({routineItems.filter((i) => i.category === 'walk').length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('appointment')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer ${
            activeCategory === 'appointment'
              ? 'bg-white text-amber-800 shadow-md border border-amber-200 scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-600" />
          <span>📅 Appointments ({routineItems.filter((i) => i.category === 'appointment').length})</span>
        </button>
      </div>

      {/* 4. Celebratory Appreciation Toast Banner */}
      {celebrationToast && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 rounded-2xl shadow-xl flex items-start justify-between gap-4 animate-scaleIn border border-emerald-400">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-bounce">
              <PartyPopper className="w-6 h-6 text-amber-300" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-base sm:text-lg flex items-center gap-2">
                <span>Task Completed: {celebrationToast.title}</span>
                <CheckCircle2 className="w-5 h-5 text-amber-300" />
              </h4>
              <p className="text-xs sm:text-sm text-emerald-100 font-semibold leading-relaxed">
                {celebrationToast.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => setCelebrationToast(null)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 5. Timetable Cards List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const itemTitle = getText(item.title);
          const itemNotes = getText(item.notes);
          const speechPrompt = `${item.time}. ${itemTitle}. ${itemNotes}`;

          return (
            <div
              key={item.id}
              onClick={() => handleToggleTask(item)}
              className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden group ${
                item.isCompleted
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-sm opacity-95'
                  : 'bg-white border-slate-200 shadow-md hover:shadow-lg hover:border-blue-400'
              }`}
            >
              {/* Left Content Area */}
              <div className="flex items-start gap-4 flex-1">
                {/* Checkbox Button */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200 mt-0.5 ${
                    item.isCompleted
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                      : 'border-2 border-slate-300 bg-slate-50 text-transparent group-hover:border-emerald-500 group-hover:text-emerald-500/30'
                  }`}
                >
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full text-xs font-black bg-slate-900 text-amber-300 flex items-center gap-1 shadow-xs">
                      <Clock className="w-3.5 h-3.5" /> {item.time}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${item.badgeBg}`}>
                      {item.category === 'medicine'
                        ? '💊 Medicine'
                        : item.category === 'food_drink'
                        ? '🍲 Meal & Drink'
                        : item.category === 'game'
                        ? '🧠 Brain Activity'
                        : item.category === 'walk'
                        ? '🚶 Health Walk'
                        : '📅 Medical Appointment'}
                    </span>

                    {item.isCustom && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800">
                        Custom Added ✨
                      </span>
                    )}

                    {item.completedAt && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Done at {item.completedAt}
                      </span>
                    )}
                  </div>

                  <h3
                    className={`font-black text-lg sm:text-xl transition-colors ${
                      item.isCompleted ? 'line-through text-slate-500' : 'text-slate-900 group-hover:text-blue-900'
                    }`}
                  >
                    {itemTitle}
                  </h3>

                  {itemNotes && (
                    <p className={`text-xs sm:text-sm font-medium leading-relaxed ${item.isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                      {itemNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Action Bar */}
              <div
                className="flex items-center gap-3 justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <VoiceButton textToSpeak={speechPrompt} label="Listen Voice Reminder" size="sm" />

                <button
                  onClick={() => handleToggleTask(item)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    item.isCompleted
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-md'
                  }`}
                >
                  {item.isCompleted ? '✓ Completed' : 'Mark Done'}
                </button>

                {item.isCustom && (
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete custom task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">No items found in this category</h3>
            <p className="text-xs text-slate-500">Tap "+ Add Routine / Reminder" to schedule a customized care entry.</p>
          </div>
        )}
      </div>

      {/* 6. Add Custom Care Routine / Reminder Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Daily Routine / Reminder">
        <form onSubmit={handleCreateNew} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Task / Reminder Title *
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Afternoon Blood Sugar Check & Warm Drink"
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:ring-4 focus:ring-amber-400/20 focus:outline-none text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:ring-4 focus:ring-amber-400/20 focus:outline-none bg-white text-sm font-semibold"
              >
                <option value="medicine">💊 Medicine & Health</option>
                <option value="food_drink">🍲 Meal & Drink</option>
                <option value="game">🧠 Brain Game & Exercise</option>
                <option value="walk">🚶 Walk & Well-being</option>
                <option value="appointment">📅 Medical Appointment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Scheduled Time *
              </label>
              <input
                type="text"
                required
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                placeholder="03:30 PM"
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:ring-4 focus:ring-amber-400/20 focus:outline-none text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Care Instructions / Notes
            </label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Take 1 tablet with fresh water after food"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 focus:ring-4 focus:ring-amber-400/20 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Celebratory Voice Praise (Spoken upon completion)
            </label>
            <input
              type="text"
              value={formAppreciation}
              onChange={(e) => setFormAppreciation(e.target.value)}
              placeholder="e.g. Wonderful job! Staying disciplined keeps you healthy and full of energy!"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 focus:ring-4 focus:ring-amber-400/20 focus:outline-none text-sm"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="rounded-xl font-bold bg-amber-400 text-slate-950 hover:bg-amber-300">
              Save to Daily Timetable
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
