import React, { useState } from 'react';
import { 
  ImageIcon, 
  Plus, 
  Calendar, 
  MapPin, 
  User, 
  Sparkles,
  Heart,
  Volume2,
  Camera,
  Upload,
  Languages,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMemoryStore } from '../../stores/useMemoryStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../common/Button';
import { VoiceButton } from '../common/VoiceButton';
import { Modal } from '../common/Modal';
import { MemoryEntry, MemoryCategory } from '../../types';

export type StoryLanguage = 'en' | 'hi' | 'as' | 'bn' | 'ne' | 'brx';

export const MemoryGardenView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { memories, selectedCategory, setCategory, addMemory } = useMemoryStore();
  const { selectedPatient } = useAuthStore();
  
  // 6-Language State for Memory Stories (synced with global i18n language)
  const initialLang = (i18n.language || 'en') as StoryLanguage;
  const [storyLang, setStoryLang] = useState<StoryLanguage>(
    ['en', 'hi', 'as', 'bn', 'ne', 'brx'].includes(initialLang) ? initialLang : 'en'
  );

  React.useEffect(() => {
    const lang = (i18n.language || 'en') as StoryLanguage;
    if (['en', 'hi', 'as', 'bn', 'ne', 'brx'].includes(lang)) {
      setStoryLang(lang);
    }
  }, [i18n.language]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeSelectedMemory, setActiveSelectedMemory] = useState<MemoryEntry | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('1980');
  const [category, setCategoryForm] = useState<MemoryCategory>('Family');
  const [person, setPerson] = useState('');
  const [location, setLocation] = useState('');
  const [story, setStory] = useState('');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const languageOptions: Array<{ code: StoryLanguage; label: string; flag: string }> = [
    { code: 'en', label: 'English (English)', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    { code: 'as', label: 'অসমীয়া (Assamese)', flag: '🌾' },
    { code: 'bn', label: 'বাংলা (Bengali)', flag: '🇧🇩' },
    { code: 'ne', label: 'नेपाली (Nepali)', flag: '🇳🇵' },
    { code: 'brx', label: 'बड़ो (Bodo)', flag: '🏹' },
  ];

  const categories: Array<MemoryCategory | 'All'> = [
    'All',
    'Family',
    'Childhood',
    'School',
    'Career',
    'Marriage',
    'Grandchildren',
    'Important Events',
  ];

  const categoryLabels: Record<string, Record<StoryLanguage, string>> = {
    All: { en: 'All Memories', hi: 'सभी यादें', as: 'সকলো স্মৃতি', bn: 'সকল স্মৃতি', ne: 'सबै सम्झनाहरू', brx: 'गासै गोसोखांथि' },
    Family: { en: 'Family', hi: 'परिवार', as: 'পৰিয়াল', bn: 'পরিবার', ne: 'परिवार', brx: 'नखर' },
    Childhood: { en: 'Childhood', hi: 'बचपन', as: 'শৈশৱ', bn: 'শৈশব', ne: 'बाल्यकाल', brx: 'उन्दै सम' },
    School: { en: 'School', hi: 'विद्यालय', as: 'বিদ্যালয়', bn: 'বিদ্যালয়', ne: 'विद्यालय', brx: 'फरायसालि' },
    Career: { en: 'Career', hi: 'कर्मक्षेत्र', as: 'কৰ্মজীৱন', bn: 'কর্মজীবন', ne: 'जागिर/पेशा', brx: 'हाबा-हुखा' },
    Marriage: { en: 'Marriage', hi: 'विवाह', as: 'বিবাহ', bn: 'বিবাহ', ne: 'विवाह', brx: 'हाबा' },
    Grandchildren: { en: 'Grandchildren', hi: 'पोते-पोतियाँ', as: 'নাতিনী', bn: 'নাতি-নাতনি', ne: 'नाति-नातिना', brx: 'फिसाजो-फिसाज्ला' },
    'Important Events': { en: 'Important Events', hi: 'महत्वपूर्ण घटनाएँ', as: 'গুৰুত্বপূৰ্ণ ঘটনা', bn: 'গুরুত্বপূর্ণ ঘটনা', ne: 'महत्वपूर्ण घटनाहरू', brx: 'गोनांथार जाथाय' },
  };

  const getMemoryTitle = (mem: MemoryEntry) => {
    switch (storyLang) {
      case 'as': return mem.titleAs || mem.title;
      case 'bn': return mem.titleBn || mem.title;
      case 'ne': return mem.titleNe || mem.title;
      case 'brx': return mem.titleBrx || mem.title;
      case 'hi': return mem.titleHi || mem.title;
      default: return mem.titleEn || mem.title;
    }
  };

  const getMemoryStory = (mem: MemoryEntry) => {
    switch (storyLang) {
      case 'as': return mem.storyAs || mem.story;
      case 'bn': return mem.storyBn || mem.story;
      case 'ne': return mem.storyNe || mem.story;
      case 'brx': return mem.storyBrx || mem.story;
      case 'hi': return mem.storyHi || mem.story;
      default: return mem.storyEn || mem.story;
    }
  };

  const voiceBtnLabels: Record<StoryLanguage, string> = {
    en: 'Listen to Story',
    hi: 'कहानी सुनें',
    as: 'কাহিনী শুনক',
    bn: 'গল্প শুনুন',
    ne: 'कथा सुन्नुहोस्',
    brx: "सल' खोनासं",
  };

  const viewDetailsLabels: Record<StoryLanguage, string> = {
    en: 'View Details →',
    hi: 'विवरण देखें →',
    as: 'বিৱৰণ চাওক →',
    bn: 'বিবরণ দেখুন →',
    ne: 'विवरण हेर्नुहोस् →',
    brx: 'गुवारै नाय →',
  };

  const viewFullLabels: Record<StoryLanguage, string> = {
    en: 'View Full Memory & Photo →',
    hi: 'पूरी कहानी और तस्वीर देखें →',
    as: 'সম্পূৰ্ণ কাহিনী আৰু ছবি চাওক →',
    bn: 'সম্পূর্ণ গল্প ও ছবি দেখুন →',
    ne: 'पूरा कथा र तस्बिर हेर्नुहोस् →',
    brx: "गासै सल' आरो सावगारि नाय →",
  };

  const closeLabels: Record<StoryLanguage, string> = {
    en: 'Close',
    hi: 'बंद करें',
    as: 'বন্ধ কৰক',
    bn: 'বন্ধ করুন',
    ne: 'बन्द गर्नुहोस्',
    brx: 'बन्द खालाम',
  };

  const filteredMemories = selectedCategory === 'All'
    ? memories
    : memories.filter((m) => m.category === selectedCategory);

  const featuredMemory = filteredMemories.find((m) => m.featured) || filteredMemories[0];
  const secondaryMemories = filteredMemories.filter((m) => m.id !== featuredMemory?.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !story) return;

    addMemory({
      patientId: selectedPatient.id,
      title,
      titleHi: title,
      titleEn: title,
      titleAs: title,
      titleBn: title,
      titleNe: title,
      titleBrx: title,
      year: parseInt(year) || 1980,
      category,
      story,
      storyHi: story,
      storyEn: story,
      storyAs: story,
      storyBn: story,
      storyNe: story,
      storyBrx: story,
      person,
      location,
      imageUrl:
        uploadPreview ||
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    });

    setTitle('');
    setStory('');
    setPerson('');
    setLocation('');
    setUploadPreview(null);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-10 md:space-y-12 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-ivory-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-800 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-gold-500 stroke-forest-800" /> {
              storyLang === 'as' 
                ? 'স্মৃতি উদ্যান (Personalized Family Timeline)' 
                : storyLang === 'bn'
                  ? 'স্মৃতি উদ্যান (Personalized Family Timeline)'
                  : storyLang === 'ne'
                    ? 'स्मृति वाटिका (Personalized Family Timeline)'
                    : storyLang === 'brx'
                      ? 'गोसोखांथि बारि (Personalized Family Timeline)'
                      : storyLang === 'hi' 
                        ? 'स्मृति उद्यान (Personalized Family Timeline)' 
                        : 'Memory Garden & Family Timeline'
            }
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-charcoal-900 mt-1">
            {
              storyLang === 'as'
                ? 'জীৱনৰ অমূল্য স্মৃতি আৰু মনপৰশা কাহিনী'
                : storyLang === 'bn'
                  ? 'জীবনের অমূল্য স্মৃতি ও হৃদস্পর্শী গল্প'
                  : storyLang === 'ne'
                    ? 'जीवनका अमूल्य सम्झना र कथाहरू'
                    : storyLang === 'brx'
                      ? "जिउनि गोसोखांथाव जाथाय आरो सल'फोर"
                      : storyLang === 'hi' 
                        ? 'जीवन की अनमोल यादें और कहानियाँ' 
                        : 'Cherished Memories & Lifelong Stories'
            }
          </h2>
          <p className="text-charcoal-600 text-base mt-2 max-w-2xl font-medium">
            {storyLang === 'as'
              ? `${selectedPatient.name}ৰ পৰিয়াল আৰু জীৱনৰ ৭টা মূল অধ্যায়ৰ প্ৰকৃত স্মৃতি আৰু কাহিনী।`
              : storyLang === 'bn'
                ? `${selectedPatient.name}-এর পরিবার ও জীবনের ৭টি প্রধান অধ্যায়ের বাস্তব স্মৃতি ও গল্প।`
                : storyLang === 'ne'
                  ? `${selectedPatient.name}को परिवार र जीवनका ७ मुख्य अध्यायहरूको यथार्थ सम्झना।`
                  : storyLang === 'brx'
                    ? `${selectedPatient.name}नि नखर आरो जिउनि ७ गाहाइ खोलोबफोरनि सैथो गोसोखांथि।`
                    : storyLang === 'hi'
                      ? `${selectedPatient.name} के परिवार और जीवन के 7 प्रमुख अध्यायों की वास्तविक स्मृतियाँ।`
                      : `A realistic visual memory album across 7 life chapters for ${selectedPatient.name}.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 6-Language Dropdown & Quick Selector */}
          <div className="flex items-center gap-2 bg-white p-1.5 px-3 rounded-2xl border-2 border-slate-300 shadow-sm">
            <Languages className="w-5 h-5 text-[#004085] flex-shrink-0" />
            <select
              value={storyLang}
              onChange={(e) => setStoryLang(e.target.value as StoryLanguage)}
              aria-label="Select Story Language"
              className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer pr-2 py-1"
            >
              {languageOptions.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.flag} {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            icon={<Camera className="w-5 h-5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            {storyLang === 'as' ? 'নতুন স্মৃতি যোগ কৰক' : storyLang === 'bn' ? 'নতুন স্মৃতি যোগ করুন' : storyLang === 'ne' ? 'नयाँ सम्झना थप्नुहोस्' : storyLang === 'brx' ? 'गोदान गोसोखांथि सोदेर' : storyLang === 'hi' ? 'नई याद जोड़ें' : 'Add Photo Memory'}
          </Button>
        </div>
      </div>

      {/* 6-Language Quick Toggle Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100/80 p-2 rounded-2xl border border-slate-200">
        <span className="text-xs font-black text-slate-600 px-2 flex items-center gap-1">
          <Languages className="w-4 h-4 text-[#004085]" /> Language:
        </span>
        {languageOptions.map((opt) => {
          const isSelected = storyLang === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setStoryLang(opt.code)}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#004085] text-amber-300 shadow-md ring-2 ring-blue-300'
                  : 'bg-white text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <span>{opt.flag}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category Filter Pills (All 7 Categories + All Memories) */}
      <div className="flex flex-wrap items-center gap-2 pb-1 overflow-x-auto">
        {categories.map((cat) => {
          const labelMap = categoryLabels[cat] || { en: cat, hi: cat, as: cat, bn: cat, ne: cat, brx: cat };
          const isSelected = selectedCategory === cat;
          const displayLabel = labelMap[storyLang] || labelMap.en || cat;
          const secondaryLabel = storyLang === 'en' ? labelMap.hi : labelMap.en;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#004085] text-amber-300 shadow-md ring-2 ring-blue-300'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              <span>{displayLabel}</span>
              <span className="text-[10px] opacity-70">
                ({secondaryLabel})
              </span>
            </button>
          );
        })}
      </div>

      {/* FEATURED HERO MEMORY (Immersive Balanced Cultural Spotlight) */}
      {featuredMemory && (
        <section
          onClick={() => setActiveSelectedMemory(featuredMemory)}
          className="rounded-3xl overflow-hidden shadow-2xl cursor-pointer group bg-gradient-to-br from-[#061833] via-[#002855] to-slate-950 border-2 border-slate-300/40 p-5 md:p-8 text-white transition-all hover:border-amber-400"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Full Family Photo Container with Perfect Alignment & Uncropped Visibility */}
            <div className="lg:col-span-7 xl:col-span-7 relative rounded-2xl overflow-hidden bg-slate-950/90 border border-slate-700/60 shadow-xl flex items-center justify-center min-h-[280px] md:min-h-[380px] max-h-[460px]">
              <img
                src={featuredMemory.imageUrl}
                alt={getMemoryTitle(featuredMemory)}
                className="w-full h-full max-h-[460px] object-contain md:object-cover object-top group-hover:scale-102 transition-transform duration-500 rounded-2xl"
              />
              <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                ⭐ {
                  storyLang === 'as' ? 'মুখ্য স্মৃতি (Featured)' :
                  storyLang === 'bn' ? 'প্রধান স্মৃতি (Featured)' :
                  storyLang === 'ne' ? 'मुख्य सम्झना (Featured)' :
                  storyLang === 'brx' ? 'गाहाइ गोसोखांथि (Featured)' :
                  storyLang === 'hi' ? 'प्रमुख स्मृति (Featured)' : 'Featured Memory'
                }
              </div>
              <div className="absolute top-3 right-3 bg-[#004085]/90 text-amber-300 font-extrabold text-xs px-3 py-1 rounded-full shadow-md backdrop-blur-xs">
                {categoryLabels[featuredMemory.category]?.[storyLang] || featuredMemory.category} · {featuredMemory.year}
              </div>
            </div>

            {/* Narrative & Details Column */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {featuredMemory.location && (
                  <span className="inline-flex text-xs font-semibold text-amber-300 bg-white/10 px-3 py-1 rounded-full items-center gap-1 backdrop-blur-xs border border-white/15">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" /> {featuredMemory.location}
                  </span>
                )}
                {featuredMemory.person && (
                  <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" /> {featuredMemory.person}
                  </div>
                )}
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-white leading-snug tracking-tight">
                  {getMemoryTitle(featuredMemory)}
                </h3>
                <p className="text-slate-200 text-sm md:text-base leading-relaxed line-clamp-4 font-normal">
                  {getMemoryStory(featuredMemory)}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/60">
                <VoiceButton
                  textToSpeak={`${getMemoryTitle(featuredMemory)}। ${getMemoryStory(featuredMemory)}`}
                  lang={storyLang}
                  label={voiceBtnLabels[storyLang]}
                  size="md"
                />
                <span className="text-xs md:text-sm font-bold text-amber-300 group-hover:underline flex items-center gap-1">
                  {viewFullLabels[storyLang]}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ALL MEMORIES SECTION HEADER */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div>
          <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <span>
              {storyLang === 'as'
                ? 'সকলো স্মৃতিকথা আৰু আলোকচিত্ৰ'
                : storyLang === 'bn'
                  ? 'সকল স্মৃতি ও আলোকচিত্র'
                  : storyLang === 'ne'
                    ? 'सबै सम्झना र तस्बिरहरू'
                    : storyLang === 'brx'
                      ? 'गासै गोसोखांथि आरो सावगारिफोर'
                      : storyLang === 'hi'
                        ? 'सभी स्मृतियाँ एवं पारिवारिक क्षण'
                        : 'All Memories & Family Photographs'}
            </span>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-[#004085]">
              {filteredMemories.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {storyLang === 'as'
              ? 'নিৰ্বাচিত ভাগ অনুসৰি পৰিয়ালৰ প্ৰতিটো অমূল্য স্মৃতি তলত চাওক'
              : storyLang === 'bn'
                ? 'নির্বাচিত বিভাগ অনুযায়ী পরিবারের প্রতিটি অমূল্য স্মৃতি নিচে দেখুন'
                : storyLang === 'ne'
                  ? 'छनोट गरिएको वर्ग अनुसार परिवारको हरेक अनमोल सम्झना तल हेर्नुहोस्'
                  : storyLang === 'brx'
                    ? 'सायखनाय बाहागो बादियै नखरनि मोनফ্রোমবো अनसायथाव गोसोखांथिखौ गाहायाव नाय'
                    : storyLang === 'hi'
                      ? 'चुनी गई श्रेणी के अनुसार परिवार की प्रत्येक अनमोल स्मृति नीचे देखें'
                      : 'Browse all cherished moments and family stories below'}
          </p>
        </div>
      </div>

      {/* ALL MEMORY GALLERY GRID (Including Family and All Categories) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMemories.map((mem) => (
          <div
            key={mem.id}
            onClick={() => setActiveSelectedMemory(mem)}
            className="rounded-3xl bg-white border-2 border-slate-200 shadow-soft hover:shadow-xl hover:border-amber-400 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between group"
          >
            {/* Memory Photograph */}
            {mem.imageUrl && (
              <div className="relative h-64 overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src={mem.imageUrl}
                  alt={getMemoryTitle(mem)}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#004085]/90 backdrop-blur-md text-amber-300 text-xs font-black px-3 py-1 rounded-full shadow-sm">
                  {categoryLabels[mem.category]?.[storyLang] || mem.category}
                </div>
                <div className="absolute top-3 right-3 bg-amber-400 text-slate-900 text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                  {mem.year}
                </div>
              </div>
            )}

            {/* Memory Details */}
            <div className="p-5 md:p-6 space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-lg text-slate-900 group-hover:text-[#004085] transition-colors leading-snug">
                  {getMemoryTitle(mem)}
                </h4>
                <p className="text-slate-700 text-sm line-clamp-3 leading-relaxed font-normal">
                  {getMemoryStory(mem)}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                {(mem.person || mem.location) && (
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    {mem.person && (
                      <span className="flex items-center gap-1 text-[#004085] truncate max-w-[55%]">
                        <User className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{mem.person}</span>
                      </span>
                    )}
                    {mem.location && (
                      <span className="flex items-center gap-1 text-slate-500 truncate max-w-[45%]">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{mem.location}</span>
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between">
                  <VoiceButton
                    textToSpeak={`${getMemoryTitle(mem)}। ${getMemoryStory(mem)}`}
                    lang={storyLang}
                    label={voiceBtnLabels[storyLang]}
                    size="sm"
                  />
                  <span className="text-xs font-extrabold text-blue-800 group-hover:underline">
                    {viewDetailsLabels[storyLang]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FULL MEMORY READER MODAL */}
      {activeSelectedMemory && (
        <Modal
          isOpen={!!activeSelectedMemory}
          onClose={() => setActiveSelectedMemory(null)}
          title={getMemoryTitle(activeSelectedMemory)}
        >
          <div className="space-y-6">
            {activeSelectedMemory.imageUrl && (
              <div className="w-full bg-slate-950 rounded-3xl overflow-hidden shadow-photo border-2 border-ivory-200 flex items-center justify-center max-h-[520px]">
                <img
                  src={activeSelectedMemory.imageUrl}
                  alt={getMemoryTitle(activeSelectedMemory)}
                  className="w-full max-h-[520px] object-contain rounded-2xl"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ivory-200 pb-3">
              <span className="px-3.5 py-1 rounded-full bg-forest-800 text-ivory-50 text-xs font-bold">
                {categoryLabels[activeSelectedMemory.category]?.[storyLang] || activeSelectedMemory.category} · {activeSelectedMemory.year}
              </span>

              {activeSelectedMemory.person && (
                <span className="text-sm font-bold text-forest-800 flex items-center gap-1">
                  <User className="w-4 h-4" /> {activeSelectedMemory.person} ({activeSelectedMemory.location})
                </span>
              )}
            </div>

            <p className="text-charcoal-800 text-lg leading-relaxed font-sans">
              {getMemoryStory(activeSelectedMemory)}
            </p>

            <div className="pt-2 flex justify-between items-center">
              <VoiceButton
                textToSpeak={`${getMemoryTitle(activeSelectedMemory)}। ${getMemoryStory(activeSelectedMemory)}`}
                lang={storyLang}
                label={voiceBtnLabels[storyLang]}
                size="md"
              />
              <Button variant="outline" size="sm" onClick={() => setActiveSelectedMemory(null)}>
                {closeLabels[storyLang]}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD MEMORY MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Memory Entry">
        <form onSubmit={handleCreate} className="space-y-4">
          {/* Photo Upload Zone */}
          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-1 flex items-center justify-between">
              <span>Memory Photograph</span>
              <span className="text-xs text-purple-600 font-bold">Upload Custom Image</span>
            </label>

            {uploadPreview ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500 max-h-48 bg-black/5 flex items-center justify-center group">
                <img src={uploadPreview} alt="Upload preview" className="w-full h-44 object-cover" />
                <button
                  type="button"
                  onClick={() => setUploadPreview(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-all"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50 rounded-2xl p-4 cursor-pointer flex flex-col items-center justify-center transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm mb-1.5">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  Click or Drag & Drop Family Photo
                </span>
                <span className="text-[11px] text-slate-500">
                  Supports JPEG, PNG, WebP
                </span>
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-1">Memory Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rongali Bihu Courtyard Gathering"
              className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:ring-4 focus:ring-forest-500/20 focus:outline-none bg-ivory-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:ring-4 focus:ring-forest-500/20 focus:outline-none bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategoryForm(e.target.value as MemoryCategory)}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:ring-4 focus:ring-forest-500/20 focus:outline-none bg-white"
              >
                {['Childhood', 'School', 'Career', 'Marriage', 'Family', 'Grandchildren', 'Important Events'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Familiar Person</label>
              <input
                type="text"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="e.g. Ananya Borthakur"
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:ring-4 focus:ring-forest-500/20 focus:outline-none bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Guwahati, Assam"
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:ring-4 focus:ring-forest-500/20 focus:outline-none bg-ivory-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-1">Story & Reflection</label>
            <textarea
              required
              rows={3}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Describe this cherished family memory..."
              className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:ring-4 focus:ring-forest-500/20 focus:outline-none bg-ivory-50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Memory Entry</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
