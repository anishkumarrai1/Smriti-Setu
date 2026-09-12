import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  ArrowLeft,
  Clock,
  Sparkles,
  Pill,
  Utensils,
  Coffee,
  Gamepad2,
  Sun,
  Volume2,
  Check,
  Trophy,
  PartyPopper,
  X,
  Plus,
  Play,
  RefreshCw,
  Bell,
  Edit2,
  Trash2,
  AlertCircle,
  Save,
  Clock4,
} from 'lucide-react';
import { speakText, playAcousticChime } from '../../utils/speech';
import { useLanguageStore, SupportedLanguage } from '../../stores/useLanguageStore';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';

interface RoutineRecallProps {
  onComplete?: (accuracy: number, attempts: number, responseTimeMs: number) => void;
  onBack: () => void;
  onLaunchGame?: (gameId: string) => void;
}

export type TimetableCategory = 'all' | 'game' | 'medicine' | 'food' | 'drink' | 'walk';

export interface TimetableItem {
  id: string;
  time: string; // e.g. "07:00 AM" or "08:30 PM"
  category: 'game' | 'medicine' | 'food' | 'drink' | 'walk';
  title: Partial<Record<SupportedLanguage, string>> & { en: string };
  notes: Partial<Record<SupportedLanguage, string>> & { en: string };
  appreciation: Partial<Record<SupportedLanguage, string>> & { en: string };
  icon: string;
  badgeBg: string;
  isCompleted: boolean;
  completedAt?: string;
  gameId?: string;
}

// Convert 12h time string like "08:30 PM" to "20:30" (for <input type="time">)
const convert12to24 = (time12: string): string => {
  try {
    const trimmed = time12.trim();
    const parts = trimmed.split(' ');
    if (parts.length !== 2) return '08:00';
    const [time, modifier] = parts;
    let [hours, minutes] = time.split(':');
    let h = parseInt(hours, 10);
    if (modifier.toUpperCase() === 'PM' && h < 12) h += 12;
    if (modifier.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minutes || '00'}`;
  } catch (e) {
    return '08:00';
  }
};

// Convert 24h time string like "20:30" to 12h "08:30 PM"
const convert24to12 = (time24: string): string => {
  try {
    const [hoursStr, minutesStr] = time24.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr || '00';
    const modifier = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes} ${modifier}`;
  } catch (e) {
    return '08:00 AM';
  }
};

// Format current time into "hh:mm AM/PM"
const formatCurrentTime12 = (date: Date = new Date()): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const modifier = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${modifier}`;
};

const DEFAULT_TIMETABLE: TimetableItem[] = [
  {
    id: 'task-1',
    time: '07:00 AM',
    category: 'drink',
    title: {
      en: 'Morning Ginger & Tulsi Tea (Warm Drink)',
      hi: 'सुबह की अदरक व तुलसी वाली चाय (Warm Drink)',
      as: 'পুৱাৰ আদা আৰু তুলসী চাহ (Warm Drink)',
      bn: 'সকালের আদা ও তুলসী চা (Warm Drink)',
      ne: 'बिहानको अदुवा र तुलसी चिया (Warm Drink)',
      brx: 'फुंनि साहा लोंनाय (Warm Drink)',
    },
    notes: {
      en: 'Start the day gently with warm herbal tea on the veranda.',
      hi: 'बरामदे में बैठकर ताज़ा सुबह और गुनगुनी हर्बल चाय का आनंद लें।',
      as: 'বাৰান্দাত বহি সুন্দৰ পুৱাৰ লগত গৰম চাহ উপভোগ কৰক।',
      bn: 'বারান্দায় বসে সকালের স্নিগ্ধ বাতাসে গরম ভেষজ চা পান করুন।',
      ne: 'बदामदेमा बसेर बिहानको ताजा चिया पिउनुहोस्।',
      brx: 'फुंनि समाव गोजां साहा लोंनायजों सानखौ जागाय।',
    },
    appreciation: {
      en: 'Wonderful job! A warm morning drink refreshes your body and awakens your senses. You are starting the day so well!',
      hi: 'बहुत बढ़िया! सुबह की गर्म चाय ने आपको तरोताज़ा कर दिया है। आपका दिन मंगलमय हो!',
      as: 'অতিকৈ সুন্দৰ! পুৱাৰ গৰম চায়ে আপোনাৰ মন আৰু স্বাস্থ্য সতেজ কৰি তুলিলে।',
      bn: 'চমৎকার! সকালের এই পানীয়টি আপনার মন ও শরীরকে সতেজ করে তুলল।',
      ne: 'धेरै राम्रो! बिहानको चियाले तपाईंलाई नयाँ ऊर्जा दियो।',
      brx: 'जोबोर मोजां! फुंनि साहाया नोंथांखौ गोदान गोहो होबाय।',
    },
    icon: 'coffee',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    isCompleted: false,
  },
  {
    id: 'task-2',
    time: '08:00 AM',
    category: 'medicine',
    title: {
      en: 'Morning Blood Pressure & Memory Medicine',
      hi: 'सुबह की ब्लड प्रेशर व मेमोरी की दवाई (Medicine)',
      as: 'পুৱাৰ ৰক্তচাপ আৰু স্মৃতিবৰ্ধক ঔষধ (Medicine)',
      bn: 'সকালের রক্তচাপ ও স্মৃতিশক্তির ওষুধ (Medicine)',
      ne: 'बिहानको रक्तचाप र स्मरण औषधी (Medicine)',
      brx: 'फुंनि मुलि जानाय (Medicine)',
    },
    notes: {
      en: 'Take your prescribed morning tablet with half a glass of fresh water.',
      hi: 'डॉक्टर द्वारा दी गई सुबह की गोली आधा गिलास पानी के साथ लें।',
      as: 'চিকিৎসকে দিয়া পুৱাৰ বড়ি আধা গিলাচ পানীৰে সেৱন কৰক।',
      bn: 'ডাক্তারের পরামর্শ অনুযায়ী সকালের ট্যাবলেটটি আধ গ্লাস জল দিয়ে খান।',
      ne: 'डाक्टरले दिएको बिहानको औषधी आधा गिलास पानीसँग खानुहोस्।',
      brx: 'डाक्टरनि बिथोन बादियै फुंनि मुलिखौ लों।',
    },
    appreciation: {
      en: 'Fantastic! Taking your morning medication on time protects your heart and memory. We are proud of your health habit!',
      hi: 'शाबाश! समय पर दवाई लेना आपके स्वास्थ्य और याददाश्त को मजबूत बनाए रखता है। बहुत खूब!',
      as: 'সুন্দৰ কথা! সময়মতে ঔষধ খোৱাৰ বাবে আপোনাৰ শৰীৰ আৰু স্মৃতিশক্তি সুস্থ থাকিব।',
      bn: 'দারুণ! সময়মতো ওষুধ নেওয়া আপনার শরীর ও স্মৃতিশক্তি উভয়কেই সুস্থ রাখবে।',
      ne: 'धेरै राम्रो! समयमा औषधी खाँदा मुटु र स्मरण दुवै बलियो रहन्छ।',
      brx: 'मोजां खामानि! मुलि लोंनाया गोनांथार।',
    },
    icon: 'pill',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
    isCompleted: false,
  },
  {
    id: 'task-3',
    time: '09:00 AM',
    category: 'food',
    title: {
      en: 'Nutritious Morning Breakfast (Healthy Food)',
      hi: 'पौष्टिक नाश्ता — इडली / पोहा / दलिया (Food)',
      as: 'পুষ্টিকৰ পুৱাৰ জলপান (Food)',
      bn: 'পুষ্টিকর সকালের নাস্তা (Food)',
      ne: 'पौष्टिक बिहानको खाजा (Food)',
      brx: 'फुंनि जामुं जानाय (Food)',
    },
    notes: {
      en: 'Enjoy freshly prepared warm breakfast with soft fruits.',
      hi: 'ताज़ा व सुपाच्य नाश्ता और फलों का आनंद लें।',
      as: 'সতেজ পুৱাৰ খাদ্য আৰু ফল-মূল তৃপ্তিৰে খাওক।',
      bn: 'তাজা ও সুস্বাদু সকালের খাবার এবং ফল তৃপ্তি সহকারে গ্রহণ করুন।',
      ne: 'ताजा र स्वस्थ बिहानको खाजा खानुहोस्।',
      brx: 'फुंनि गथाव जामुंखौ मोजाङै जा।',
    },
    appreciation: {
      en: 'Superb! A nourishing breakfast gives you sustained energy and vitality for a joyful day ahead.',
      hi: 'बहुत अच्छे! पौष्टिक नाश्ते से शरीर को भरपूर ऊर्जा मिलती है। आपका दिन खुशियों भरा रहे!',
      as: 'বঢ়িয়া কথা! পুষ্টিকৰ জলপানে আপোনাক গোটেই দিনটোৰ বাবে প্ৰাণৱন্ত কৰি ৰাখিব।',
      bn: 'চমৎকার! পুষ্টিকর নাস্তা আপনার সারা দিনের শক্তির উৎস। ভালো থাকুন!',
      ne: 'धेरै राम्रो! स्वस्थ खाजाले दिनभरिको लागि तागत प्रदान गर्छ।',
      brx: 'जोबोर मोजां! बे जामुङा नोंथांखौ गोहो गोनां खालामगोन।',
    },
    icon: 'utensils',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    isCompleted: false,
  },
  {
    id: 'task-4',
    time: '10:30 AM',
    category: 'game',
    title: {
      en: 'Morning Cognitive Game Play Session (5 Mins Game)',
      hi: 'सुबह का माइंड गेम सेशन — फोटो व मेमोरी मैच (Game)',
      as: 'পুৱাৰ বৌদ্ধিক খেলৰ সময় — ফটো আৰু স্মৃতি খেল (Game)',
      bn: 'সকালের ব্রেন গেম সেশন — মেমরি ও ছবি মেলানো (Game)',
      ne: 'बिहानको दिमागी खेल — तस्बिर स्मरण खेल (Game)',
      brx: 'फुंनि गोसो फोसावनाय गेलेनाय (Game)',
    },
    notes: {
      en: 'Play Visual Memory Match or Family Face Recognition to stimulate neurons.',
      hi: 'तस्वीरों को पहचानने और याद रखने का मनोरंजक खेल खेलें।',
      as: 'পৰিয়াল আৰু চিনাকি ছবিবোৰ মনত পেলোৱাৰ খেল খেলক।',
      bn: 'ছবি শনাক্তকরণ ও চাক্ষুষ স্মৃতির আনন্দদায়ক খেলা খেলুন।',
      ne: 'तस्बिर पहिचान गर्ने र स्मरण गर्ने रमाइलो खेल खेल्नुहोस्।',
      brx: 'सावगार सिननाय आरो गोसोआव दोननाय गेलेनाय गेले।',
    },
    appreciation: {
      en: 'Champion Performance! 🏆 Playing brain exercises sharpens mental acuity and sparks joyful memory recall. Brilliant work!',
      hi: 'शाबाश! आपने माइंड गेम खेलकर अपने दिमाग को सक्रिय और तेज़ बनाया है। आप सचमुच बहुत होशियार हैं!',
      as: 'চ্যাম্পিয়ন! খেল খেলি আপুনি আপোনাৰ মগজুক সতেজ আৰু তীক্ষ্ণ কৰি তুলিলে।',
      bn: 'অসাধারণ! গেম খেলে আপনি আপনার স্মৃতিশক্তিকে আরও সচল ও উজ্জ্বল করে তুললেন।',
      ne: 'धेरै धेरै बधाई! खेल खेल्नाले दिमाग सक्रिय र तन्दुरुस्त रहन्छ।',
      brx: 'जोबोर साबसिन! बे गेलेनाया नोंथांनि गोसोखौ गोरा खालामबाय।',
    },
    icon: 'gamepad',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    gameId: 'picture_recognition',
    isCompleted: false,
  },
  {
    id: 'task-5',
    time: '11:45 AM',
    category: 'drink',
    title: {
      en: 'Mid-Day Fresh Hydration & Lemonade (Drink)',
      hi: 'दोपहर का ताज़ा पेय — नींबू पानी या नारियल पानी (Drink)',
      as: 'দুপৰীয়াৰ সতেজ পানী আৰু নেমুৰ ৰস (Drink)',
      bn: 'দুপুরের সতেজ পানীয় — ডাবের জল বা লেবুর শরবত (Drink)',
      ne: 'दिउँसोको कागती पानी वा नरिवल पानी (Drink)',
      brx: 'सानजौफुनि दै लोंनाय (Drink)',
    },
    notes: {
      en: 'Drink fresh water or soothing lemonade to stay hydrated.',
      hi: 'शरीर में जलस्तर बनाए रखने के लिए 1 ग्लास ताज़ा पानी पिएं।',
      as: 'শৰীৰৰ সতেজতাৰ বাবে এক গিলাচ পানী বা চৰবত খাওক।',
      bn: 'শরীর আর্দ্র রাখতে এক গ্লাস তাজা জল বা লেবুর শরবত পান করুন।',
      ne: 'शरीरमा पानीको मात्रा सन्तुलन राख्न एक गिलास पानी पिउनुहोस्।',
      brx: 'गोसो आरो देहा मोजां थाहोनो दै लों।',
    },
    appreciation: {
      en: 'Excellent! Regular hydration keeps your brain energized, prevents tiredness, and keeps you feeling light and fresh.',
      hi: 'बहुत अच्छे! पर्याप्त पानी पीने से दिमाग सक्रिय रहता है और शरीर में फुर्ती बनी रहती है।',
      as: 'সুন্দৰ! পানী খালে শৰীৰ আৰু মগজু সতেজ থাকে।',
      bn: 'খুব ভালো! পরিমিত জলপান আপনার মস্তিষ্ককে কর্মক্ষম ও প্রাণবন্ত রাখবে।',
      ne: 'धेरै राम्रो! समयमा पानी पिउनाले थकान हट्छ र ताजगी मिल्छ।',
      brx: 'मोजां खामानि! दै लोंनाया देहानि थाखाय जोबोर गोनांथार।',
    },
    icon: 'coffee',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    isCompleted: false,
  },
  {
    id: 'task-6',
    time: '01:00 PM',
    category: 'food',
    title: {
      en: 'Wholesome Lunch & Post-Meal Medication (Food & Med)',
      hi: 'दोपहर का भोजन व खाने के बाद की गोली (Food & Medicine)',
      as: 'দুপৰীয়াৰ আহাৰ আৰু ঔষধ (Food & Medicine)',
      bn: 'দুপুরের পুষ্টিকর আহার ও ওষুধ (Food & Medicine)',
      ne: 'दिउँसोको खाना र औषधी (Food & Medicine)',
      brx: 'सानजौफुनि जामुं आरो मुलि जानाय (Food & Medicine)',
    },
    notes: {
      en: 'Warm, soft cooked lunch followed by your post-lunch digestion tablet.',
      hi: 'हल्का व सुपाच्य दोपहर का खाना खाएं और 15 मिनट बाद दवाई लें।',
      as: 'সহজপাচ্য দুপৰীয়াৰ আহাৰ গ্ৰহণ কৰক আৰু পাছত ঔষধ খাওক।',
      bn: 'সহজে হজমযোগ্য খাবার গ্রহণ করুন এবং খাওয়া শেষে ওষুধ খান।',
      ne: 'सजिलै पच्ने खाना खानुहोस् र १५ मिनेटपछि औषधी लिनुहोस्।',
      brx: 'गथाव जामुं जा आरो उनाव मुलिखौ लों।',
    },
    appreciation: {
      en: 'Great job! Having meals on time and taking your medicine protects your wellbeing and digestion.',
      hi: 'शाबाश! समय पर भोजन और दवाई लेने से आपका स्वास्थ्य हमेशा तंदुरुस्त रहेगा।',
      as: 'অতি উত্তম! সময়মতে আহাৰ আৰু ঔষধ খোৱাটো অতি প্ৰশংসনীয়।',
      bn: 'খুব সুন্দর! সঠিক সময়ে খাবার ও ওষুধ খাওয়া আপনাকে সুস্থ রাখবে।',
      ne: 'धेरै राम्रो! समयमा खाना र औषधी लिनाले पाचन प्रणाली स्वस्थ रहन्छ।',
      brx: 'जोबोर मोजां! सानजौफुनि खामानिखौ मोजाङै खालामबाय।',
    },
    icon: 'utensils',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    isCompleted: false,
  },
  {
    id: 'task-7',
    time: '04:00 PM',
    category: 'game',
    title: {
      en: 'Afternoon Nature Sound & Melody Game (Game)',
      hi: 'शाम का सुरीला गेम — प्राकृतिक आवाज़ें पहचानें (Game)',
      as: 'সন্ধিয়াৰ প্ৰকৃতিৰ সুৰ চিনাক্তকৰণ খেল (Game)',
      bn: 'বিকেলের সুরের খেলা — প্রকৃতির শব্দ শনাক্তকরণ (Game)',
      ne: 'साँझको प्राकृतिक ध्वनि पहिचान खेल (Game)',
      brx: 'बेलासियाव मिथिंगानि सोदोब सिननाय गेलेनाय (Game)',
    },
    notes: {
      en: 'Listen and identify peaceful temple bells, rainfall, and bird songs.',
      hi: 'मंदिर की घंटी, बारिश और चिड़ियों की चहचहाहट सुनकर आनंद लें।',
      as: 'মন্দিৰৰ ঘণ্টা, বৰষুণ আৰু চৰাইৰ মাত শুনি খেলৰ আনন্দ লওক।',
      bn: 'মন্দিরের ঘণ্টা, বৃষ্টি ও পাখির মিষ্টি ডাক শুনে মন ভালো রাখুন।',
      ne: 'मन्दिरको घण्टी, पानीको आवाज र चराको चिरबिर आवाज सुन्नुहोस्।',
      brx: 'मन्दिरनि घन्टा आरो अखा हानायनि सोदोब खोनासं।',
    },
    appreciation: {
      en: 'Bravo! Listening to soothing nature sounds calms the nervous system and boosts auditory memory connections!',
      hi: 'अद्भुत! मधुर ध्वनियों को सुनकर आपका मन शांत और प्रसन्न हुआ है। बहुत ही अच्छा काम!',
      as: 'অপূৰ্ব! সুন্দৰ সুৰ শুনি আপোনাৰ মনটো শান্ত আৰু আনন্দিত হ’ল।',
      bn: 'অসাধারণ! সুন্দর ও শান্ত শব্দ শুনে মন শান্ত হলো এবং স্মৃতিশক্তি বৃদ্ধি পেল।',
      ne: 'धेरै राम्रो! मधुर आवाज सुन्दा मन शान्त र खुसी हुन्छ।',
      brx: 'जोबोर साबसिन! बे सोदोबा नोंथांनि गोसोखौ शान्ति होबाय।',
    },
    icon: 'gamepad',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    gameId: 'familiar_sound',
    isCompleted: false,
  },
  {
    id: 'task-8',
    time: '05:30 PM',
    category: 'walk',
    title: {
      en: 'Evening Porch Stroll & Green Tea (Walk & Drink)',
      hi: 'शाम की सुकूनभरी सैर व ग्रीन टी (Walk & Tea)',
      as: 'সন্ধিয়াৰ মুকলি খোজ আৰু চাহ (Walk & Tea)',
      bn: 'বিকেলের মৃদু পদচারণা ও সবুজ চা (Walk & Tea)',
      ne: 'साँझको हल्का हिँडडुल र चिया (Walk & Tea)',
      brx: 'बेलासियाव खारथिं थानाय आरो साहा लोंनाय (Walk)',
    },
    notes: {
      en: '15-minute gentle walk in fresh garden breeze with family.',
      hi: 'बगीचे या बालकनी में 15 मिनट की ताज़ा सैर करें।',
      as: 'বাগান বা বাৰান্দাত ১৫ মিনিট মুকলি বতাহত খোজ কাঢ়ক।',
      bn: 'বাগানের তাজা বাতাসে ১৫ মিনিট পরিবারের সাথে একটু হেঁটে আসুন।',
      ne: 'बगैँचामा १५ मिनेट शान्तसँग हिँड्नुहोस्।',
      brx: 'बागसाव १५ मिनिट मोजाङै बेराय।',
    },
    appreciation: {
      en: 'Splendid! Gentle evening movement supports blood circulation and promotes sound, healthy nighttime sleep!',
      hi: 'बहुत खूब! शाम की खुली हवा में सैर से रक्त संचार अच्छा होता है और रात को गहरी नींद आती है।',
      as: 'অতি সুন্দৰ! সন্ধিয়া খোজ কাঢ়িলে শৰীৰ পাতল লাগে আৰু ৰাতিৰ টোপনি ভাল হয়।',
      bn: 'চমৎকার! সন্ধ্যার মিষ্টি বাতাসে হাঁটাচলা রক্ত চলাচল বাড়ায় এবং রাতের ঘুম ভালো করে।',
      ne: 'धेरै राम्रो! साँझको हिँडाइले स्वास्थ्य राम्रो हुन्छ र मीठो निद्रा लाग्छ।',
      brx: 'जोबोर साबसिन! बेलासियाव बेरायनाया देहाखौ मोजां लाखियो।',
    },
    icon: 'sun',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
    isCompleted: false,
  },
];

export const RoutineRecall: React.FC<RoutineRecallProps> = ({
  onComplete,
  onBack,
  onLaunchGame,
}) => {
  const { currentLanguage: activeLang } = useLanguageStore();
  const { elderlyMode } = useAccessibilityStore();

  const [timetable, setTimetable] = useState<TimetableItem[]>(() => {
    try {
      const saved = localStorage.getItem('smriti_daily_timetable');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load timetable from storage', e);
    }
    return DEFAULT_TIMETABLE;
  });

  const [activeCategory, setActiveCategory] = useState<TimetableCategory>('all');
  const [appreciationModalItem, setAppreciationModalItem] = useState<TimetableItem | null>(null);
  const [timeOccurAlarmItem, setTimeOccurAlarmItem] = useState<TimetableItem | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(formatCurrentTime12());
  const lastTriggeredAlarmMinuteRef = useRef<string>('');

  const totalTasks = timetable.length;
  const completedTasks = timetable.filter((t) => t.isCompleted).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const filteredItems =
    activeCategory === 'all'
      ? timetable
      : timetable.filter((t) => t.category === activeCategory);

  // -------------------------------------------------------------
  // ALL-IN-ONE TIMETABLE MANAGER & ON-PAGE INLINE ADD/EDIT FORM
  // -------------------------------------------------------------
  const [isManagerModalOpen, setIsManagerModalOpen] = useState<boolean>(false);
  const [editingList, setEditingList] = useState<TimetableItem[]>([]);

  // On-page Add / Edit Task Form State (shown directly on page)
  const [onPageTaskForm, setOnPageTaskForm] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    editIndex?: number;
    target: 'main' | 'manager';
    item: TimetableItem;
  } | null>(null);

  // Persist timetable to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smriti_daily_timetable', JSON.stringify(timetable));
    } catch (e) {
      console.error('Failed to persist timetable', e);
    }
  }, [timetable]);

  // Live real-time clock watcher and scheduled alarm detector
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const current12 = formatCurrentTime12(now);
      setCurrentTimeStr(current12);

      const minuteKey = `${now.getHours()}:${now.getMinutes()}`;
      if (lastTriggeredAlarmMinuteRef.current !== minuteKey) {
        const matchingTask = timetable.find((item) => {
          if (item.isCompleted) return false;
          const item24 = convert12to24(item.time);
          const current24 = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          return item24 === current24;
        });

        if (matchingTask) {
          lastTriggeredAlarmMinuteRef.current = minuteKey;
          setTimeOccurAlarmItem(matchingTask);
          playAcousticChime(659.25, 0.4);
          speakText(
            `Reminder for ${matchingTask.title[activeLang] || matchingTask.title.en}. Time: ${matchingTask.time}`,
            activeLang
          );
        }
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 1000);
    return () => clearInterval(interval);
  }, [timetable, activeLang]);

  // Toggle item completion with appreciation chime and modal
  const handleToggleComplete = (itemToToggle: TimetableItem) => {
    let newlyCompletedItem: TimetableItem | null = null;

    setTimetable((prev) =>
      prev.map((item) => {
        if (item.id === itemToToggle.id) {
          const updatedStatus = !item.isCompleted;
          if (updatedStatus) {
            newlyCompletedItem = {
              ...item,
              isCompleted: true,
              completedAt: formatCurrentTime12(),
            };
            return newlyCompletedItem;
          }
          return { ...item, isCompleted: false, completedAt: undefined };
        }
        return item;
      })
    );

    if (newlyCompletedItem) {
      const itemToAppreciate = newlyCompletedItem as TimetableItem;
      setAppreciationModalItem(itemToAppreciate);
      playAcousticChime(880, 0.3);
      speakText(
        itemToAppreciate.appreciation[activeLang] || itemToAppreciate.appreciation.en,
        activeLang
      );

      // Record real routine completion activity to caregiver portal
      if (onComplete) {
        const completedCount = timetable.filter((t) => t.isCompleted || t.id === itemToToggle.id).length;
        const totalCount = Math.max(timetable.length, 1);
        const accuracy = Math.round((completedCount / totalCount) * 100);
        onComplete(accuracy, completedCount, 2200);
      }
    }
  };

  // Test schedule alarm modal trigger
  const triggerAlarmPopup = (item: TimetableItem) => {
    setTimeOccurAlarmItem(item);
    playAcousticChime(659.25, 0.4);
    speakText(
      `Scheduled Routine Alarm for ${item.title[activeLang] || item.title.en}. Scheduled Time: ${item.time}.`,
      activeLang
    );
  };

  // Snooze alarm
  const handleSnoozeAlarm = () => {
    setTimeOccurAlarmItem(null);
    playAcousticChime(440, 0.15);
  };

  // Reset all tasks for today
  const handleResetDay = () => {
    if (window.confirm('Reset all completed tasks for today?')) {
      setTimetable((prev) =>
        prev.map((item) => ({ ...item, isCompleted: false, completedAt: undefined }))
      );
      playAcousticChime(440, 0.15);
    }
  };

  // Open Manager Modal with draft clone
  const handleOpenManager = () => {
    setEditingList(JSON.parse(JSON.stringify(timetable)));
    setIsManagerModalOpen(true);
    setOnPageTaskForm(null);
  };

  // Open On-Page Add Task Form
  const handleOpenAddTaskOnPage = (target: 'main' | 'manager' = 'manager') => {
    const defaultNewTask: TimetableItem = {
      id: `task-${Date.now()}`,
      time: '10:00 AM',
      category: 'medicine',
      title: {
        en: 'New Daily Routine Task',
        hi: 'नया दैनिक कार्य',
        as: 'নতুন দৈনিক কাম',
        bn: 'নতুন দৈনিক কাজ',
        ne: 'नयाँ दैनिक कार्य',
        brx: 'गोदान सानफ्रोमनि खामानि',
      },
      notes: {
        en: 'Care instructions and routine steps for this task.',
        hi: 'इस कार्य के लिए देखभाल निर्देश व आवश्यक बातें।',
        as: 'এই কামৰ বাবে যত্নৰ নিৰ্দেশনা।',
        bn: 'এই কাজের জন্য যত্নের নির্দেশাবলী।',
        ne: 'यस कार्यको लागि हेरचाह निर्देशन।',
        brx: 'बे खामानिनि बिथोन।',
      },
      appreciation: {
        en: 'Splendid achievement! You are doing amazingly well with your daily routine!',
        hi: 'बहुत खूब! आपने यह कार्य सफलतापूर्वक पूरा किया। आप पर गर्व है!',
        as: 'অতিকৈ সুন্দৰ কাম! আপোনাৰ নিয়মীয়া যত্ন অতি প্ৰশংসনীয়।',
        bn: 'চমৎকার! আপনি সফলভাবে এই কাজটি সম্পন্ন করেছেন।',
        ne: 'धेरै राम्रो! तपाईंले आफ्नो दिनचर्या धेरै राम्रोसँग पालना गर्नुभयो।',
        brx: 'जोबोर मोजां! नोंथाङा सानफ्रोमनि खामानिखौ मोजाङै खालामबाय।',
      },
      icon: 'pill',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      isCompleted: false,
    };

    setOnPageTaskForm({
      isOpen: true,
      mode: 'add',
      target,
      item: defaultNewTask,
    });
    playAcousticChime(523.25, 0.2);
  };

  // Open On-Page Edit Task Form
  const handleOpenEditTaskOnPage = (index: number, target: 'main' | 'manager' = 'manager') => {
    const sourceList = target === 'manager' ? editingList : timetable;
    setOnPageTaskForm({
      isOpen: true,
      mode: 'edit',
      editIndex: index,
      target,
      item: JSON.parse(JSON.stringify(sourceList[index])),
    });
    playAcousticChime(587.33, 0.2);
  };

  // Save Task from On-Page Form
  const handleSaveTaskFromOnPageForm = () => {
    if (!onPageTaskForm) return;
    const { mode, editIndex, target, item } = onPageTaskForm;

    if (target === 'manager') {
      if (mode === 'add') {
        setEditingList((prev) => [item, ...prev]);
      } else if (mode === 'edit' && editIndex !== undefined) {
        setEditingList((prev) => {
          const copy = [...prev];
          copy[editIndex] = item;
          return copy;
        });
      }
    } else {
      // Main timetable page
      if (mode === 'add') {
        setTimetable((prev) => [item, ...prev]);
      } else if (mode === 'edit' && editIndex !== undefined) {
        setTimetable((prev) => {
          const copy = [...prev];
          copy[editIndex] = item;
          return copy;
        });
      }
    }

    setOnPageTaskForm(null);
    playAcousticChime(659.25, 0.25);
  };

  // Update a single item in draft editing list directly
  const handleUpdateManagerItem = (index: number, updates: Partial<TimetableItem>) => {
    setEditingList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  // Delete an item in draft editing list
  const handleDeleteManagerItem = (index: number) => {
    setEditingList((prev) => prev.filter((_, i) => i !== index));
  };

  // Save all changes from Manager Modal
  const handleSaveAllManagerChanges = () => {
    setTimetable(editingList);
    setIsManagerModalOpen(false);
    setOnPageTaskForm(null);
    playAcousticChime(587.33, 0.2);
  };

  // Restore factory defaults
  const handleRestoreDefaults = () => {
    if (window.confirm('Reset all routine tasks back to the default schedule?')) {
      setTimetable(DEFAULT_TIMETABLE);
      setEditingList(DEFAULT_TIMETABLE);
      setOnPageTaskForm(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'game':
        return <Gamepad2 className="w-5 h-5 text-blue-600" />;
      case 'medicine':
        return <Pill className="w-5 h-5 text-rose-600" />;
      case 'food':
        return <Utensils className="w-5 h-5 text-amber-600" />;
      case 'drink':
        return <Coffee className="w-5 h-5 text-emerald-600" />;
      case 'walk':
        return <Sun className="w-5 h-5 text-teal-600" />;
      default:
        return <Clock className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'game':
        return '🎮 Game Play';
      case 'medicine':
        return '💊 Medicine';
      case 'food':
        return '🍲 Food & Meals';
      case 'drink':
        return '☕ Drinks & Tea';
      case 'walk':
        return '🌿 Walk & Rest';
      default:
        return '⏰ Routine';
    }
  };

  // Helper component to render the on-page task form
  const renderOnPageTaskForm = () => {
    if (!onPageTaskForm || !onPageTaskForm.isOpen) return null;

    const { mode, item } = onPageTaskForm;

    return (
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-forest-50 p-6 md:p-7 rounded-3xl border-3 border-emerald-400 shadow-xl space-y-5 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              {mode === 'add' ? (
                <Plus className="w-5 h-5 stroke-[3]" />
              ) : (
                <Edit2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg md:text-xl text-forest-950">
                {mode === 'add' ? '📝 Add New Routine Task Form' : '✏️ Edit Routine Task Details'}
              </h3>
              <p className="text-xs text-forest-700 font-medium">
                Fill the details on this page. All changes are saved directly to your schedule.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOnPageTaskForm(null)}
            className="p-2 rounded-full hover:bg-emerald-100 text-forest-800 transition-colors cursor-pointer"
            title="Close Form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields Grid */}
        <div className="space-y-4">
          {/* Row 1: Time & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scheduled Time Section */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-2">
              <label className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-forest-700" />
                <span>Scheduled Time:</span>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-ivory-50 px-3 py-2 rounded-xl border-2 border-forest-300">
                  <input
                    type="time"
                    value={convert12to24(item.time)}
                    onChange={(e) => {
                      const new12 = convert24to12(e.target.value);
                      setOnPageTaskForm({
                        ...onPageTaskForm,
                        item: { ...item, time: new12 },
                      });
                    }}
                    className="font-mono font-bold text-sm text-charcoal-900 focus:outline-none bg-transparent"
                  />
                  <span className="font-mono font-extrabold text-xs text-forest-800 bg-forest-100/80 px-2 py-0.5 rounded-md">
                    {item.time}
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-1 text-[11px] font-bold">
                  {['08:00 AM', '10:30 AM', '01:00 PM', '05:30 PM', '08:30 PM'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setOnPageTaskForm({
                          ...onPageTaskForm,
                          item: { ...item, time: preset },
                        })
                      }
                      className={`px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                        item.time === preset
                          ? 'bg-forest-800 text-white border-forest-800'
                          : 'bg-white text-charcoal-700 hover:bg-forest-50 border-ivory-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Picker */}
            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-2">
              <label className="text-xs font-bold text-forest-900 block">
                Select Routine Category:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { id: 'medicine', label: '💊 Medicine', bg: 'bg-rose-100 text-rose-900 border-rose-300', icon: 'pill' },
                  { id: 'game', label: '🎮 Game', bg: 'bg-blue-100 text-blue-900 border-blue-300', icon: 'gamepad' },
                  { id: 'food', label: '🍲 Food', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: 'utensils' },
                  { id: 'drink', label: '☕ Drink', bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: 'coffee' },
                  { id: 'walk', label: '🌿 Walk', bg: 'bg-teal-100 text-teal-900 border-teal-300', icon: 'sun' },
                ].map((cat) => {
                  const isSelected = item.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setOnPageTaskForm({
                          ...onPageTaskForm,
                          item: {
                            ...item,
                            category: cat.id as any,
                            badgeBg: cat.bg,
                            icon: cat.icon,
                          },
                        })
                      }
                      className={`py-1.5 px-2.5 rounded-xl font-bold text-xs border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? `${cat.bg} border-2 ring-2 ring-emerald-400 font-extrabold scale-[1.02]`
                          : 'bg-white text-charcoal-700 border-ivory-300 hover:bg-ivory-50'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Game Selection if Category is Game */}
          {item.category === 'game' && (
            <div className="bg-blue-50/90 p-4 rounded-2xl border border-blue-200 space-y-1.5">
              <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-blue-700" />
                <span>Associated Brain Game:</span>
              </label>
              <select
                value={item.gameId || 'picture_recognition'}
                onChange={(e) =>
                  setOnPageTaskForm({
                    ...onPageTaskForm,
                    item: { ...item, gameId: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-white border border-blue-300 font-bold text-xs text-charcoal-900 focus:outline-none"
              >
                <option value="picture_recognition">🖼️ Picture & Face Recognition</option>
                <option value="familiar_sound">🎵 Familiar Sound Recall Quiz</option>
                <option value="daily_reflection">📖 Daily Journal & Memory Reflection</option>
              </select>
            </div>
          )}

          {/* Title & Care Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-charcoal-700 block">
                Task Title:
              </label>
              <input
                type="text"
                value={item.title[activeLang] || item.title.en}
                onChange={(e) => {
                  const val = e.target.value;
                  setOnPageTaskForm({
                    ...onPageTaskForm,
                    item: {
                      ...item,
                      title: { ...item.title, [activeLang]: val, en: val },
                    },
                  });
                }}
                placeholder="e.g. Afternoon BP Medicine & Water"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-ivory-300 font-bold text-xs text-charcoal-900 focus:border-forest-600 focus:ring-1 focus:ring-forest-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-charcoal-700 block">
                Care Instructions / Notes:
              </label>
              <input
                type="text"
                value={item.notes[activeLang] || item.notes.en}
                onChange={(e) => {
                  const val = e.target.value;
                  setOnPageTaskForm({
                    ...onPageTaskForm,
                    item: {
                      ...item,
                      notes: { ...item.notes, [activeLang]: val, en: val },
                    },
                  });
                }}
                placeholder="e.g. Take 1 tablet with fresh water after food."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-ivory-300 text-xs text-charcoal-900 focus:border-forest-600 focus:ring-1 focus:ring-forest-200"
              />
            </div>
          </div>

          {/* Appreciation Praise */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Appreciation Praise (Spoken aloud upon completion):</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  speakText(
                    item.appreciation[activeLang] || item.appreciation.en,
                    activeLang
                  )
                }
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" /> Listen Audio
              </button>
            </div>
            <input
              type="text"
              value={item.appreciation[activeLang] || item.appreciation.en}
              onChange={(e) => {
                const val = e.target.value;
                setOnPageTaskForm({
                  ...onPageTaskForm,
                  item: {
                    ...item,
                    appreciation: {
                      ...item.appreciation,
                      [activeLang]: val,
                      en: val,
                    },
                  },
                });
              }}
              placeholder="e.g. Wonderful job! You took such great care of yourself!"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-300 text-xs font-medium text-amber-950 focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-200">
          <button
            type="button"
            onClick={() => setOnPageTaskForm(null)}
            className="px-5 py-2.5 rounded-2xl bg-white hover:bg-ivory-100 text-charcoal-700 font-bold text-xs border border-ivory-300 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveTaskFromOnPageForm}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-forest-700 hover:from-emerald-500 hover:to-forest-600 text-white font-extrabold text-xs shadow-soft transition-all cursor-pointer hover:scale-105 border border-emerald-300"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{mode === 'add' ? '✓ Add Task to Schedule' : '✓ Update Task Details'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 pb-24">
      
      {/* Top Header & Navigation with generous bottom padding */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory-200 pb-6 mb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-forest-800 hover:text-forest-900 hover:underline cursor-pointer bg-forest-50/70 px-4 py-2.5 rounded-full border border-forest-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patient Activities
        </button>

        {/* Real-time Clock Indicator & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-forest-900 text-amber-300 border border-forest-700 shadow-xs text-xs font-mono font-bold">
            <Clock4 className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Live Clock: {currentTimeStr}</span>
          </div>

          {/* Direct On-Page Add Task Button */}
          <button
            type="button"
            onClick={() => handleOpenAddTaskOnPage('main')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 border-2 border-emerald-400/80 shadow-soft transition-all cursor-pointer hover:scale-105"
            title="Add a new task directly on this page"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Task</span>
          </button>

          {/* Centralized Top Edit Routine Button with generous padding */}
          <button
            type="button"
            onClick={handleOpenManager}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-forest-800 to-forest-900 hover:from-forest-700 hover:to-forest-800 border-2 border-amber-400/80 shadow-soft transition-all cursor-pointer hover:scale-105"
            title="Edit all routine timetable tasks"
          >
            <Edit2 className="w-4 h-4 text-amber-300" />
            <span>✏️ Edit Routine Timetable</span>
          </button>

          <button
            type="button"
            onClick={handleResetDay}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-bold text-charcoal-600 hover:text-charcoal-900 bg-white border border-ivory-300 hover:bg-ivory-50 shadow-xs transition-all cursor-pointer"
            title="Reset completed tasks for today"
          >
            <RefreshCw className="w-3.5 h-3.5 text-forest-700" /> Reset Day
          </button>
        </div>
      </div>

      {/* Main Timetable Hero Banner & Progress Bar */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 text-white rounded-3xl p-6 md:p-8 shadow-banner border-2 border-forest-700 relative overflow-hidden space-y-5">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> Daily Care & Routine Timetable
            </span>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight">
              Daily Schedule & Routine
            </h2>
            <p className="text-xs md:text-sm text-forest-100 font-medium leading-relaxed">
              Track games, medicine, meals, drinks, and walks. You can add tasks directly on this page or customize all schedule items. When scheduled time occurs, a reminder alert pop-up will appear!
            </p>
          </div>

          {/* Progress Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/20 text-center shrink-0 min-w-[200px] space-y-2">
            <div className="text-3xl md:text-4xl font-black text-amber-300 drop-shadow-xs">
              {completedTasks} / {totalTasks}
            </div>
            <div className="text-xs font-bold text-forest-100 uppercase tracking-wider">
              Tasks Completed ({completionPercentage}%)
            </div>
            <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden border border-white/20">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Category Tabs (All, Game, Medicine, Food, Drink, Walk) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all' as TimetableCategory, label: '🌟 All Schedule', count: totalTasks },
          { id: 'game' as TimetableCategory, label: '🎮 Game Play', count: timetable.filter((t) => t.category === 'game').length },
          { id: 'medicine' as TimetableCategory, label: '💊 Medicine', count: timetable.filter((t) => t.category === 'medicine').length },
          { id: 'food' as TimetableCategory, label: '🍲 Food & Meals', count: timetable.filter((t) => t.category === 'food').length },
          { id: 'drink' as TimetableCategory, label: '☕ Drinks & Hydration', count: timetable.filter((t) => t.category === 'drink').length },
          { id: 'walk' as TimetableCategory, label: '🌿 Walk & Rest', count: timetable.filter((t) => t.category === 'walk').length },
        ].map((tab) => {
          const isSelected = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-forest-800 text-white shadow-soft scale-105 border-2 border-forest-600'
                  : 'bg-white text-charcoal-700 hover:bg-forest-50 border border-ivory-300'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-ivory-100 text-charcoal-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ON-PAGE INLINE ADD / EDIT TASK FORM (Rendered when target is 'main') */}
      {onPageTaskForm && onPageTaskForm.isOpen && onPageTaskForm.target === 'main' && (
        <div className="mb-6">
          {renderOnPageTaskForm()}
        </div>
      )}

      {/* TIMETABLE LIST CARDS (Clean Patient View with Generous Spacing) */}
      <div className="space-y-4 pb-12">
        {filteredItems.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-3xl border border-ivory-300 p-8 space-y-4">
            <Clock className="w-12 h-12 text-forest-300 mx-auto" />
            <h3 className="text-lg font-bold text-charcoal-800">No Routine Tasks in this Category</h3>
            <p className="text-xs text-charcoal-500">Click below to add tasks directly on this page or edit your schedule.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenAddTaskOnPage('main')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-700 text-white font-bold text-xs shadow-soft hover:bg-emerald-800 cursor-pointer hover:scale-105"
              >
                <Plus className="w-4 h-4" /> Add Task on Page
              </button>
              <button
                type="button"
                onClick={handleOpenManager}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest-800 text-white font-bold text-xs shadow-soft hover:bg-forest-700 cursor-pointer hover:scale-105"
              >
                <Edit2 className="w-4 h-4 text-amber-300" /> Edit Routine Timetable
              </button>
            </div>
          </div>
        ) : (
          filteredItems.map((item) => {
            const title = item.title[activeLang] || item.title.en;
            const notes = item.notes[activeLang] || item.notes.en;

            return (
              <div
                key={item.id}
                className={`p-5 md:p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                  item.isCompleted
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                    : 'bg-white border-ivory-200 hover:border-forest-300 shadow-soft'
                }`}
              >
                {/* Left Side: Time, Category Icon, Title & Notes */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Time & Icon Badge */}
                  <div className="flex flex-col items-center shrink-0 w-24 text-center space-y-1.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs ${
                        item.isCompleted ? 'bg-emerald-100 border-emerald-300' : 'bg-ivory-50 border-ivory-300'
                      }`}
                    >
                      {item.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : (
                        getCategoryIcon(item.category)
                      )}
                    </div>
                    <span className="font-mono font-bold text-xs md:text-sm text-forest-900 bg-ivory-100/90 px-2 py-0.5 rounded-md border border-ivory-200">
                      {item.time}
                    </span>
                  </div>

                  {/* Content Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${item.badgeBg}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                      {item.isCompleted && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" /> Done at {item.completedAt}
                        </span>
                      )}
                    </div>

                    <h3
                      className={`font-serif font-bold text-slate-900 ${
                        elderlyMode ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
                      } ${item.isCompleted ? 'line-through text-charcoal-500' : ''}`}
                    >
                      {title}
                    </h3>

                    <p className="text-xs md:text-sm text-charcoal-600 font-medium leading-relaxed">
                      {notes}
                    </p>
                  </div>
                </div>

                {/* Right Side: Action Buttons, Audio, Test Alarm, Game Launch & Done */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0 pt-2 md:pt-0">
                  {/* Audio Readout */}
                  <button
                    type="button"
                    onClick={() => speakText(`${item.time}. ${title}. ${notes}`, activeLang)}
                    className="p-2.5 rounded-2xl bg-forest-50 text-forest-800 hover:bg-forest-100 border border-forest-200 transition-colors cursor-pointer"
                    title="Listen task audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Test Alarm Pop-up button */}
                  <button
                    type="button"
                    onClick={() => triggerAlarmPopup(item)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-colors cursor-pointer"
                    title="Test scheduled time alarm popup now"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-700" />
                    <span className="hidden sm:inline">Test Alert</span>
                  </button>

                  {/* Launch Game Button if category is game */}
                  {item.category === 'game' && onLaunchGame && (
                    <button
                      type="button"
                      onClick={() => onLaunchGame(item.gameId || 'picture_recognition')}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer hover:scale-105"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play Game</span>
                    </button>
                  )}

                  {/* Big Clickable Done Button (Triggers Pop-up Appreciation Message) */}
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(item)}
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-xs md:text-sm transition-all duration-300 cursor-pointer shadow-soft ${
                      item.isCompleted
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white ring-2 ring-emerald-400'
                        : 'bg-gradient-to-r from-emerald-600 to-forest-700 hover:from-emerald-500 hover:to-forest-600 text-white hover:scale-105 border-2 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    }`}
                  >
                    {item.isCompleted ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>🎉 Done & Appreciated!</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                        <span>✓ Click When Done</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* ⏰ POP-UP MODAL: TIME OCCURRED REAL-TIME ALARM & REMINDER                  */}
      {/* ========================================================================= */}
      {timeOccurAlarmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border-4 border-amber-400 shadow-[0_20px_70px_rgba(245,158,11,0.5)] space-y-6 text-center relative overflow-hidden animate-scaleUp">
            
            <button
              type="button"
              onClick={() => setTimeOccurAlarmItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-ivory-100 text-charcoal-600 hover:bg-ivory-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.7)] border-4 border-white animate-bounce">
                <Bell className="w-10 h-10 text-slate-950 fill-slate-950" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-amber-600 text-white text-[10px] font-black items-center justify-center">⏰</span>
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-950 bg-amber-300 px-4 py-1.5 rounded-full border border-amber-400 shadow-xs inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Scheduled Time Reminder Alert
              </span>
              <h3 className="text-2xl md:text-3xl font-serif font-black text-charcoal-900 mt-2 leading-tight">
                It's Time For: {timeOccurAlarmItem.title[activeLang] || timeOccurAlarmItem.title.en}!
              </h3>
              <div className="inline-block px-3 py-1 rounded-lg bg-forest-900 text-amber-300 font-mono font-extrabold text-sm border border-forest-700">
                Scheduled at {timeOccurAlarmItem.time}
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 p-5 rounded-2xl border-2 border-amber-200 shadow-inner space-y-1.5 text-left">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" /> Instructions:
              </p>
              <p className="font-serif font-bold text-sm md:text-base text-amber-950 leading-relaxed">
                {timeOccurAlarmItem.notes[activeLang] || timeOccurAlarmItem.notes.en}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleToggleComplete(timeOccurAlarmItem)}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-forest-700 hover:from-emerald-500 hover:to-forest-600 text-white font-extrabold text-sm shadow-soft hover:scale-105 transition-all cursor-pointer border-2 border-emerald-300"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Mark as Done & Get Praise 🎉</span>
              </button>

              <button
                type="button"
                onClick={handleSnoozeAlarm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 font-bold text-xs border border-ivory-300 transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4 text-charcoal-600" />
                <span>Snooze 5 Min</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🎉 POP-UP MODAL: CELEBRATION & HEARTFELT APPRECIATION MESSAGE              */}
      {/* ========================================================================= */}
      {appreciationModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border-4 border-amber-300 shadow-[0_10px_50px_rgba(0,0,0,0.3)] space-y-6 text-center relative overflow-hidden animate-scaleUp">
            
            <button
              type="button"
              onClick={() => setAppreciationModalItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-ivory-100 text-charcoal-600 hover:bg-ivory-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.6)] border-4 border-white animate-bounce">
                <Trophy className="w-10 h-10 text-slate-950 fill-slate-950" />
              </div>
              <div className="absolute -top-2 -right-2">
                <PartyPopper className="w-7 h-7 text-amber-600" />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                ✓ Task Successfully Completed!
              </span>
              <h3 className="text-2xl md:text-3xl font-serif font-black text-charcoal-900 mt-2">
                Wonderful Achievement! 🌟
              </h3>
              <p className="text-xs font-bold text-charcoal-500">
                {appreciationModalItem.time} • {appreciationModalItem.title[activeLang] || appreciationModalItem.title.en}
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 p-5 rounded-2xl border-2 border-amber-200 shadow-inner space-y-2">
              <p className="font-serif font-bold text-sm md:text-base text-amber-950 leading-relaxed">
                "{appreciationModalItem.appreciation[activeLang] || appreciationModalItem.appreciation.en}"
              </p>
              <p className="text-[11px] font-semibold text-amber-800">
                ❤️ Your family, caregivers, and doctors are very proud of your routine care!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  speakText(
                    appreciationModalItem.appreciation[activeLang] || appreciationModalItem.appreciation.en,
                    activeLang
                  )
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-amber-800" />
                <span>Listen Appreciation Again 🔊</span>
              </button>

              <button
                type="button"
                onClick={() => setAppreciationModalItem(null)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-forest-800 to-forest-900 hover:from-forest-700 hover:to-forest-800 text-white font-extrabold text-xs shadow-soft hover:scale-105 transition-all cursor-pointer"
              >
                <span>Thank You! Keep Going 🌟</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ✏️ ALL-IN-ONE SCHEDULE EDITOR MODAL (Centralized Top Edit Manager)       */}
      {/* ========================================================================= */}
      {isManagerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 pb-8 border-2 border-forest-300 shadow-2xl space-y-6 relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header with Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory-200 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-forest-100 text-forest-900 flex items-center justify-center shadow-xs">
                  <Edit2 className="w-5 h-5 text-forest-800" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl md:text-2xl text-charcoal-900">
                    Edit All Routine Tasks & Timetable
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Modify times, task names, instructions, and appreciation messages for all items in one place.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAddTaskOnPage('manager')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-soft transition-all cursor-pointer hover:scale-105"
                  title="Add a new task form on this page"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Task Form</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsManagerModalOpen(false)}
                  className="p-2 rounded-full hover:bg-ivory-100 text-charcoal-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Tasks List with generous bottom padding */}
            <div className="space-y-4 overflow-y-auto pr-2 pb-6 flex-1 scrollbar-thin">
              
              {/* ON-PAGE INLINE ADD / EDIT TASK FORM (Inside Manager) */}
              {onPageTaskForm && onPageTaskForm.isOpen && onPageTaskForm.target === 'manager' && (
                <div className="mb-4">
                  {renderOnPageTaskForm()}
                </div>
              )}

              {editingList.map((item, idx) => {
                const titleStr = item.title[activeLang] || item.title.en;
                const notesStr = item.notes[activeLang] || item.notes.en;
                const appreciationStr = item.appreciation[activeLang] || item.appreciation.en;
                const time24 = convert12to24(item.time);

                return (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-2xl bg-ivory-50/80 border-2 border-ivory-300 hover:border-forest-300 transition-all space-y-3"
                  >
                    {/* Top Row: Index, Time, Category, Edit Form, Delete */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-forest-800 text-white font-mono font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>

                        {/* Time Picker */}
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-ivory-300">
                          <Clock className="w-3.5 h-3.5 text-forest-700" />
                          <input
                            type="time"
                            value={time24}
                            onChange={(e) =>
                              handleUpdateManagerItem(idx, { time: convert24to12(e.target.value) })
                            }
                            className="font-mono font-bold text-xs text-charcoal-800 focus:outline-none"
                          />
                          <span className="text-[11px] font-bold text-forest-800">
                            ({item.time})
                          </span>
                        </div>

                        {/* Category Selector */}
                        <select
                          value={item.category}
                          onChange={(e) => {
                            const cat = e.target.value as any;
                            let badgeBg = 'bg-indigo-100 text-indigo-900 border-indigo-300';
                            let iconName = 'clock';
                            if (cat === 'game') {
                              badgeBg = 'bg-blue-100 text-blue-900 border-blue-300';
                              iconName = 'gamepad';
                            } else if (cat === 'medicine') {
                              badgeBg = 'bg-rose-100 text-rose-900 border-rose-300';
                              iconName = 'pill';
                            } else if (cat === 'food') {
                              badgeBg = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                              iconName = 'utensils';
                            } else if (cat === 'drink') {
                              badgeBg = 'bg-amber-100 text-amber-900 border-amber-300';
                              iconName = 'coffee';
                            } else if (cat === 'walk') {
                              badgeBg = 'bg-teal-100 text-teal-900 border-teal-300';
                              iconName = 'sun';
                            }
                            handleUpdateManagerItem(idx, { category: cat, badgeBg, icon: iconName });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white border border-ivory-300 font-bold text-xs text-charcoal-800 focus:outline-none"
                        >
                          <option value="medicine">💊 Medicine</option>
                          <option value="game">🎮 Game Play</option>
                          <option value="food">🍲 Food & Meals</option>
                          <option value="drink">☕ Drinks & Hydration</option>
                          <option value="walk">🌿 Walk & Rest</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Open Form on Page Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditTaskOnPage(idx, 'manager')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-forest-800 bg-forest-100/80 hover:bg-forest-200 border border-forest-300 transition-colors cursor-pointer"
                          title="Open full form on this page"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-forest-700" />
                          <span>Full Form</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteManagerItem(idx)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                          title="Remove task"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Inputs Row: Title, Notes, Appreciation */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                          Task Title:
                        </label>
                        <input
                          type="text"
                          value={titleStr}
                          onChange={(e) =>
                            handleUpdateManagerItem(idx, {
                              title: { ...item.title, [activeLang]: e.target.value, en: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-white border border-ivory-300 font-semibold text-xs focus:border-forest-600 focus:ring-1 focus:ring-forest-200"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">
                          Instructions / Notes:
                        </label>
                        <input
                          type="text"
                          value={notesStr}
                          onChange={(e) =>
                            handleUpdateManagerItem(idx, {
                              notes: { ...item.notes, [activeLang]: e.target.value, en: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-white border border-ivory-300 text-xs focus:border-forest-600 focus:ring-1 focus:ring-forest-200"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                          Appreciation Praise:
                        </label>
                        <input
                          type="text"
                          value={appreciationStr}
                          onChange={(e) =>
                            handleUpdateManagerItem(idx, {
                              appreciation: {
                                ...item.appreciation,
                                [activeLang]: e.target.value,
                                en: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-amber-50/60 border border-amber-300 text-xs font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                        />
                      </div>
                    </div>

                  </div>
                );
              })}

              {/* Add Another Task Button (Opens on-page form with generous padding and bottom spacing) */}
              <div className="pt-2 pb-6">
                <button
                  type="button"
                  onClick={() => handleOpenAddTaskOnPage('manager')}
                  className="w-full py-4 px-6 rounded-2xl border-2 border-dashed border-emerald-400 hover:border-emerald-600 text-emerald-900 font-extrabold text-sm bg-emerald-50/80 hover:bg-emerald-100 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <Plus className="w-5 h-5 text-emerald-700 stroke-[3]" />
                  <span>+ Add New Routine Task (Open Form On Page)</span>
                </button>
              </div>
            </div>

            {/* Modal Bottom Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-ivory-200 shrink-0">
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="text-xs font-bold text-charcoal-600 hover:text-charcoal-900 underline cursor-pointer"
              >
                Restore Factory Defaults
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsManagerModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveAllManagerChanges}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-forest-800 to-forest-900 hover:from-forest-700 hover:to-forest-800 text-white font-extrabold text-xs shadow-soft transition-all cursor-pointer hover:scale-105"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Save & Apply All Changes</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default RoutineRecall;
