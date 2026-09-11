/**
 * backend/src/modules/assistant/assistantRoutes.ts
 * ----------------------------------------------------
 * Full Automated Voice & Navigation Action Engine for Patient Experience
 * Directs patient to ANY specific game, tab, feature, or accessibility control
 * via Voice or Text commands in Hindi ('hi') or English ('en').
 */

import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

interface ActionPayload {
  type: 'OPEN_ACTIVITY' | 'OPEN_TAB' | 'TOGGLE_ELDERLY' | 'CHANGE_LANGUAGE' | 'OPEN_PORTAL' | 'EXIT_ACTIVITY' | 'NONE';
  payload?: string;
}

interface ChatResponse {
  reply: string;
  spokenText: string;
  detectedLanguage: string;
  action: ActionPayload;
  quickSuggestions: string[];
  source: 'gemini' | 'live_knowledge' | 'action_engine';
}

let customGeminiApiKey = process.env.GEMINI_API_KEY || '';

function getGeminiClient(providedKey?: string): GoogleGenerativeAI | null {
  const key = providedKey || customGeminiApiKey || process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '') return null;
  try {
    return new GoogleGenerativeAI(key.trim());
  } catch (err) {
    console.error('Failed to initialize GoogleGenerativeAI client:', err);
    return null;
  }
}

function normalize(text: string): string {
  return (text || '').toLowerCase().trim();
}

/**
 * Detect whether query is in Hindi or English
 */
function detectLanguage(text: string, defaultLang: string = 'hi'): 'hi' | 'en' {
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  
  const lower = text.toLowerCase();
  const hindiWords = [
    'kya', 'kaise', 'kaha', 'kahan', 'kyu', 'kyun', 'kaun', 'kab', 'kis', 'kitna',
    'namaste', 'pranam', 'batao', 'sunao', 'karo', 'kijiye', 'kholo', 'khelo', 'dikhao',
    'hai', 'hain', 'ho', 'mera', 'meri', 'mere', 'aap', 'tum', 'mujhe', 'hum',
    'khel', 'dawai', 'dawa', 'neend', 'khana', 'pani', 'kahani', 'suraj', 'chand'
  ];
  
  const words = lower.split(/[^a-z0-9]+/);
  const matched = words.filter((w) => hindiWords.includes(w));
  if (matched.length >= 1) return 'hi';

  return defaultLang === 'en' ? 'en' : 'hi';
}

/**
 * Clean up text for natural Text-To-Speech playback
 */
function cleanForSpeech(text: string): string {
  return text
    .replace(/[*_~`#\[\]()]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detect Specific Patient Action & Destination
 */
function detectPatientAction(norm: string, isHindi: boolean): { action: ActionPayload; reply: string; spokenText: string; quickSuggestions?: string[] } | null {
  // 1. SPECIFIC COGNITIVE GAMES (Check all 5 specific games with full synonyms, aliases & ordinals)

  // 1A. Game 4: Familiar Sound / Audio Recall
  if (
    norm.includes('familiar sound') ||
    norm.includes('sound quiz') ||
    norm.includes('audio quiz') ||
    norm.includes('sound game') ||
    norm.includes('audio game') ||
    norm.includes('voice quiz') ||
    norm.includes('voice game') ||
    norm.includes('listen game') ||
    norm.includes('sound recall') ||
    norm.includes('audio recall') ||
    norm.includes('voice recall') ||
    norm.includes('hear voice') ||
    norm.includes('sound') ||
    norm.includes('audio') ||
    norm.includes('voice') ||
    norm.includes('game 4') ||
    norm.includes('fourth game') ||
    norm.includes('4th game') ||
    norm.includes('option 4') ||
    norm === '4' ||
    norm.includes('पहचानी आवाज') ||
    norm.includes('पहचानी आवाज़') ||
    norm.includes('आवाज क्विज') ||
    norm.includes('आवाज़ क्विज') ||
    norm.includes('ध्वनि क्विज') ||
    norm.includes('आवाज वाला खेल') ||
    norm.includes('आवाज़ वाला खेल') ||
    norm.includes('ध्वनि खेल') ||
    norm.includes('आवाज खेल') ||
    norm.includes('आवाज़ खेल') ||
    norm.includes('आवाज पहचान') ||
    norm.includes('आवाज़ पहचान') ||
    norm.includes('आवाज सुनो') ||
    norm.includes('आवाज़ सुनो') ||
    norm.includes('सुनने वाला') ||
    norm.includes('चौथा खेल') ||
    norm.includes('चौथा गेम') ||
    norm.includes('गेम 4') ||
    norm.includes('आवाज') ||
    norm.includes('आवाज़') ||
    norm.includes('ध्वनि') ||
    norm.includes('awaaz') ||
    norm.includes('dhwani') ||
    norm.includes('aawaz')
  ) {
    return {
      action: { type: 'OPEN_ACTIVITY', payload: 'familiar_sound' },
      reply: isHindi
        ? 'मैं आपके लिए "पहचानी आवाज और ध्वनि क्विज" (Familiar Sound Quiz) शुरू कर रही हूँ। ध्यान से सुनिए! 🔊'
        : 'Opening "Familiar Sound & Audio Quiz" for you. Listen carefully to the voices! 🔊',
      spokenText: isHindi
        ? 'पहचानी आवाज खेल खोला जा रहा है।'
        : 'Opening Familiar Sound and Audio Quiz for you.',
    };
  }

  // 1B. Game 5: Personalized Photo Puzzle / Jigsaw
  if (
    norm.includes('photo puzzle') ||
    norm.includes('jigsaw') ||
    norm.includes('photo jigsaw') ||
    norm.includes('jigsaw puzzle') ||
    norm.includes('puzzle game') ||
    norm.includes('picture puzzle') ||
    norm.includes('puzzle') ||
    norm.includes('tiles puzzle') ||
    norm.includes('reconstruct photo') ||
    norm.includes('game 5') ||
    norm.includes('fifth game') ||
    norm.includes('5th game') ||
    norm.includes('option 5') ||
    norm === '5' ||
    norm.includes('फोटो पहेली') ||
    norm.includes('पहेली') ||
    norm.includes('पज़ल') ||
    norm.includes('जिगसॉ') ||
    norm.includes('टुकड़े जोड़ो') ||
    norm.includes('तस्वीर पहेली') ||
    norm.includes('पांचवा खेल') ||
    norm.includes('पांचवा गेम') ||
    norm.includes('गेम 5') ||
    norm.includes('paheli')
  ) {
    return {
      action: { type: 'OPEN_ACTIVITY', payload: 'photo_puzzle' },
      reply: isHindi
        ? 'मैं आपके लिए "पारिवारिक फोटो पहेली" (Personalized Photo Puzzle) खोल रही हूँ। टुकड़ों को जोड़कर फोटो बनाएं! 🧩'
        : 'Opening "Personalized Photo Puzzle" for you. Reconstruct your family photograph! 🧩',
      spokenText: isHindi
        ? 'फोटो पहेली खेल शुरू किया जा रहा है।'
        : 'Opening Photo Puzzle game for you.',
    };
  }

  // 1C. Game 3: Find Same Images / Sequence Recall
  if (
    norm.includes('same images') ||
    norm.includes('find same') ||
    norm.includes('sequence recall') ||
    norm.includes('same pictures') ||
    norm.includes('same photo') ||
    norm.includes('find the same') ||
    norm.includes('matching pictures') ||
    norm.includes('identical images') ||
    norm.includes('identical pictures') ||
    norm.includes('pattern game') ||
    norm.includes('flower match') ||
    norm.includes('game 3') ||
    norm.includes('third game') ||
    norm.includes('3rd game') ||
    norm.includes('option 3') ||
    norm === '3' ||
    norm.includes('समान चित्र') ||
    norm.includes('चित्र मिलाओ') ||
    norm.includes('समान फोटो') ||
    norm.includes('तस्वीर मिलाओ') ||
    norm.includes('एक जैसे चित्र') ||
    norm.includes('समान तस्वीर') ||
    norm.includes('पैटर्न खेल') ||
    norm.includes('तीसरा खेल') ||
    norm.includes('तीसरा गेम') ||
    norm.includes('गेम 3') ||
    norm.includes('चित्र पहचान') ||
    norm.includes('समान चित्र ढूंढो')
  ) {
    return {
      action: { type: 'OPEN_ACTIVITY', payload: 'sequence_recall' },
      reply: isHindi
        ? 'मैं आपके लिए "समान चित्र ढूंढो" (Find Same Images) गतिविधि शुरू कर रही हूँ। 🖼️'
        : 'Opening "Find Same Images" pattern game for you. 🖼️',
      spokenText: isHindi
        ? 'समान चित्र ढूंढने का खेल खोला जा रहा है।'
        : 'Opening Find Same Images game for you.',
    };
  }

  // 1D. Game 2: Family & Face Recognition
  if (
    norm.includes('picture recognition') ||
    norm.includes('face recognition') ||
    norm.includes('family photo') ||
    norm.includes('family face') ||
    norm.includes('family game') ||
    norm.includes('face game') ||
    norm.includes('identify face') ||
    norm.includes('recognize face') ||
    norm.includes('family member') ||
    norm.includes('photo recognition') ||
    norm.includes('people game') ||
    norm.includes('face') ||
    norm.includes('faces') ||
    norm.includes('game 2') ||
    norm.includes('second game') ||
    norm.includes('2nd game') ||
    norm.includes('option 2') ||
    norm === '2' ||
    norm.includes('चेहरा पहचान') ||
    norm.includes('फोटो पहचान') ||
    norm.includes('तस्वीर पहचान') ||
    norm.includes('परिवार पहचान') ||
    norm.includes('परिवार की तस्वीर') ||
    norm.includes('परिवार वाला खेल') ||
    norm.includes('अपनों की पहचान') ||
    norm.includes('रिश्तेदार') ||
    norm.includes('दूसरा खेल') ||
    norm.includes('दूसरा गेम') ||
    norm.includes('गेम 2') ||
    norm.includes('चेहरा') ||
    norm.includes('चेहरे') ||
    norm.includes('chehra')
  ) {
    return {
      action: { type: 'OPEN_ACTIVITY', payload: 'picture_recognition' },
      reply: isHindi
        ? 'मैं आपके लिए "परिवार व चेहरा पहचान खेल" (Family & Face Recognition) खोल रही हूँ। चलिए अपनों को पहचानते हैं! 👨‍👩‍👧‍👦'
        : 'Opening "Family & Face Recognition" game for you. Let\'s recognize your cherished family members! 👨‍👩‍👧‍👦',
      spokenText: isHindi
        ? 'परिवार और चेहरा पहचान खेल शुरू हो रहा है।'
        : 'Opening Family and Face Recognition game for you right now.',
    };
  }

  // 1E. Game 1: Visual Memory Match (Explicit Card / Memory Match / Game 1)
  if (
    norm.includes('memory match') ||
    norm.includes('card match') ||
    norm.includes('match cards') ||
    norm.includes('matching cards') ||
    norm.includes('card memory') ||
    norm.includes('card pair') ||
    norm.includes('visual memory') ||
    norm.includes('cards') ||
    norm.includes('card game') ||
    norm.includes('playing cards') ||
    norm.includes('game 1') ||
    norm.includes('first game') ||
    norm.includes('1st game') ||
    norm.includes('option 1') ||
    norm === '1' ||
    norm.includes('मेमोरी मैच') ||
    norm.includes('कार्ड मिलान') ||
    norm.includes('कार्ड खेल') ||
    norm.includes('ताश') ||
    norm.includes('पत्ते') ||
    norm.includes('स्मृति मिलान') ||
    norm.includes('जोड़ी मिलाओ') ||
    norm.includes('पहला खेल') ||
    norm.includes('पहला गेम') ||
    norm.includes('गेम 1') ||
    norm.includes('कार्ड')
  ) {
    return {
      action: { type: 'OPEN_ACTIVITY', payload: 'memory_match' },
      reply: isHindi
        ? 'मैं आपके लिए "विजुअल मेमोरी कार्ड मिलान" (Visual Memory Match) गेम शुरू कर रही हूँ। चलिए खेलते हैं! 🃏🎮'
        : 'Opening "Visual Memory Match" card game for you. Let\'s play! 🃏🎮',
      spokenText: isHindi
        ? 'मेमोरी मैच खेल शुरू हो रहा है।'
        : 'Opening Visual Memory Match game for you right now.',
    };
  }

  // 1F. Routine Recall
  if (
    norm.includes('routine recall') ||
    norm.includes('routine quiz') ||
    norm.includes('दिनचर्या') ||
    norm.includes('नाश्ता') ||
    norm.includes('routine')
  ) {
    return {
      action: { type: 'OPEN_ACTIVITY', payload: 'routine_recall' },
      reply: isHindi
        ? 'मैं आपके लिए "दिनचर्या स्मरण क्विज" (Routine Recall Quiz) खोल रही हूँ। 📋'
        : 'Opening "Daily Routine Recall Quiz" for you. 📋',
      spokenText: isHindi
        ? 'दिनचर्या स्मरण क्विज खोला जा रहा है।'
        : 'Opening Daily Routine Recall Quiz for you.',
    };
  }

  // 1G. General Game Inquiries ("I want to play a game", "games", "khel", "khelo")
  // Instead of blindly opening Memory Match, prompt patient with the 5 available games!
  if (
    norm.includes('game') ||
    norm.includes('games') ||
    norm.includes('play') ||
    norm.includes('खेल') ||
    norm.includes('गेम') ||
    norm.includes('khel') ||
    norm.includes('khelo') ||
    norm.includes('khelna')
  ) {
    return {
      action: { type: 'NONE' },
      reply: isHindi
        ? 'हमारे पास 5 मजेदार स्मृति खेल उपलब्ध हैं:\n1. 🃏 विजुअल मेमोरी कार्ड मिलान\n2. 👨‍👩‍👧 परिवार व चेहरा पहचान\n3. 🖼️ समान चित्र ढूंढो\n4. 🔊 पहचानी आवाज क्विज\n5. 🧩 पारिवारिक फोटो पहेली\n\nआप कौन सा खेलना चाहते हैं? (नीचे बटन दबाएं या नंबर/नाम बोलें)'
        : 'We have 5 wonderful cognitive memory games:\n1. 🃏 Visual Memory Match\n2. 👨‍👩‍👧 Family & Face Recognition\n3. 🖼️ Find Same Images\n4. 🔊 Familiar Sound Quiz\n5. 🧩 Personalized Photo Puzzle\n\nWhich one would you like to play? (Click below or say 1 to 5)',
      spokenText: isHindi
        ? 'हमारे पास 5 खेल हैं: मेमोरी मैच, चेहरा पहचान, समान चित्र, आवाज क्विज, और फोटो पहेली। आप कौन सा खेलना चाहते हैं?'
        : 'We have 5 games: Memory match, Face recognition, Same images, Sound quiz, and Photo puzzle. Which one would you like to play?',
      quickSuggestions: isHindi
        ? ['1. कार्ड मेमोरी 🃏', '2. चेहरा पहचान 👨‍👩‍👧', '3. समान चित्र 🖼️', '4. आवाज क्विज 🔊', '5. फोटो पहेली 🧩']
        : ['1. Memory Match 🃏', '2. Face Recognition 👨‍👩‍👧', '3. Same Images 🖼️', '4. Sound Quiz 🔊', '5. Photo Puzzle 🧩'],
    };
  }

  // 2. DASHBOARD TABS & SECTIONS

  // 2A. Reminders & Medicines
  if (
    norm.includes('reminder') ||
    norm.includes('medicine') ||
    norm.includes('दवाई') ||
    norm.includes('दवा') ||
    norm.includes('गोली') ||
    norm.includes('रिमाइंडर') ||
    norm.includes('दवाइयां') ||
    norm.includes('dawai')
  ) {
    return {
      action: { type: 'OPEN_TAB', payload: 'reminders' },
      reply: isHindi
        ? 'यहाँ आपके आज के दैनिक स्मरण और दवाइयों का सेक्शन खोला गया है। समय पर दवा लें! ⏰'
        : 'Opening your Daily Reminders and Medication Schedule! ⏰',
      spokenText: isHindi
        ? 'दैनिक स्मरण और दवाई सेक्शन खोला गया है।'
        : 'Opening your daily reminders and medicines schedule.',
    };
  }

  // 2B. Memory Garden
  if (
    norm.includes('memory garden') ||
    norm.includes('memories') ||
    norm.includes('यादें') ||
    norm.includes('स्मृति उद्यान') ||
    norm.includes('याद') ||
    norm.includes('पारिवारिक यादें') ||
    norm.includes('फोटो एल्बम') ||
    norm.includes('yaad')
  ) {
    return {
      action: { type: 'OPEN_TAB', payload: 'memories' },
      reply: isHindi
        ? 'स्मृति उद्यान (Memory Garden) खोला गया है! यहाँ आपकी सुखद पारिवारिक यादें और तस्वीरें हैं। 🌸'
        : 'Opening your Memory Garden! Here are your cherished family stories and photographs. 🌸',
      spokenText: isHindi
        ? 'स्मृति उद्यान खोला गया है।'
        : 'Opening your Memory Garden and family stories.',
    };
  }

  // 2C. Home / Dashboard
  if (
    norm.includes('home') ||
    norm.includes('dashboard') ||
    norm.includes('डैशबोर्ड') ||
    norm.includes('होम') ||
    norm.includes('मुख्य पृष्ठ') ||
    norm.includes('main page') ||
    norm.includes('mukhya')
  ) {
    return {
      action: { type: 'OPEN_TAB', payload: 'home' },
      reply: isHindi
        ? 'आपको मुख्य पेशेंट डैशबोर्ड (Home) पर ले जाया जा रहा है। 🏠'
        : 'Navigating to your Main Patient Dashboard. 🏠',
      spokenText: isHindi
        ? 'मुख्य पेशेंट डैशबोर्ड खोला जा रहा है।'
        : 'Navigating to your Main Patient Dashboard.',
    };
  }

  // 3. ACCESSIBILITY & CONTROLS

  // 3A. Elderly Mode (Large font / high contrast)
  if (
    norm.includes('elderly') ||
    norm.includes('senior') ||
    norm.includes('बुजुर्ग') ||
    norm.includes('बड़ा टेक्स्ट') ||
    norm.includes('बड़ा फॉन्ट') ||
    norm.includes('आसान मोड') ||
    norm.includes('large text') ||
    norm.includes('font bada')
  ) {
    return {
      action: { type: 'TOGGLE_ELDERLY' },
      reply: isHindi
        ? 'बुजुर्ग मोड (Elderly Mode) को टॉगल किया गया है। बड़े टेक्स्ट और स्पष्ट दृश्य सक्रिय हैं। 👓'
        : 'Elderly Accessibility Mode toggled! Large text and high contrast active. 👓',
      spokenText: isHindi
        ? 'बुजुर्ग मोड टॉगल किया गया है।'
        : 'Elderly Accessibility mode toggled.',
    };
  }

  // 3B. Exit Activity / Back
  if (
    norm.includes('exit') ||
    norm.includes('quit') ||
    norm.includes('close game') ||
    norm.includes('खेल बंद') ||
    norm.includes('वापस जाओ') ||
    norm.includes('वापस आओ') ||
    norm.includes('बंद करो') ||
    norm.includes('back to home')
  ) {
    return {
      action: { type: 'EXIT_ACTIVITY' },
      reply: isHindi
        ? 'खेल से बाहर आकर आपको मुख्य स्क्रीन पर लाया जा रहा है। 🔙'
        : 'Exiting activity and returning to the main dashboard. 🔙',
      spokenText: isHindi
        ? 'खेल बंद करके मुख्य पृष्ठ पर आ गए हैं।'
        : 'Exiting activity and returning to dashboard.',
    };
  }

  // 3C. Public Healthcare Portal
  if (
    norm.includes('portal') ||
    norm.includes('hospital') ||
    norm.includes('clinic') ||
    norm.includes('सरकारी') ||
    norm.includes('अस्पताल') ||
    norm.includes('health portal')
  ) {
    return {
      action: { type: 'OPEN_PORTAL' },
      reply: isHindi
        ? 'नॉर्थ ईस्टर्न रीजन आधिकारिक स्वास्थ्य व अस्पताल पोर्टल खोला जा रहा है। 🏛️'
        : 'Opening the Official Public Health & Hospital Search Portal. 🏛️',
      spokenText: isHindi
        ? 'सरकारी स्वास्थ्य पोर्टल खोला जा रहा है।'
        : 'Opening Public Healthcare Portal.',
    };
  }

  return null;
}

/**
 * Fetch live factual summary from Wikipedia API
 */
async function fetchWikipediaSummary(query: string, isHindi: boolean): Promise<string | null> {
  try {
    const cleanQuery = query
      .replace(/^(who is|what is|where is|tell me about|explain|about|सूरज क्या है|क्या है|कहाँ है|के बारे में बताओ)\s*/i, '')
      .replace(/[?।!.,]/g, '')
      .trim();

    if (!cleanQuery || cleanQuery.length < 2) return null;

    const langCode = isHindi ? 'hi' : 'en';
    const encoded = encodeURIComponent(cleanQuery);
    const url = `https://${langCode}.wikipedia.org/api/rest_v1/page/summary/${encoded}`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'SmritiSetuAI/1.0' },
    });

    if (res.ok) {
      const data: any = await res.json();
      if (data && data.extract && data.extract.trim().length > 15) {
        const sentences = data.extract.split(/(?<=[.।])\s+/);
        return sentences.slice(0, 3).join(' ');
      }
    }
  } catch (err) {
    console.warn('Wikipedia API fetch error:', err);
  }
  return null;
}

/**
 * Main Autonomous Processor
 */
async function processAssistantRequest(input: string, userLang: 'hi' | 'en' = 'hi', patientName: string = 'मित्र', apiKey?: string): Promise<ChatResponse> {
  const norm = normalize(input);
  const isHindi = userLang === 'hi';

  // 1. FIRST: Check for Patient Navigation and Automation Commands
  const detectedAction = detectPatientAction(norm, isHindi);
  if (detectedAction) {
    return {
      reply: detectedAction.reply,
      spokenText: detectedAction.spokenText,
      detectedLanguage: isHindi ? 'hi' : 'en',
      action: detectedAction.action,
      quickSuggestions: detectedAction.quickSuggestions || (isHindi
        ? ['मेमोरी मैच खेलो 🎮', 'दवाई रिमाइंडर ⏰', 'स्मृति उद्यान 🌸', 'होम पेज 🏠']
        : ['Play Memory Match 🎮', 'Show Reminders ⏰', 'Memory Garden 🌸', 'Home Dashboard 🏠']),
      source: 'action_engine',
    };
  }

  // 2. SECOND: Gemini API if key is present
  const genAI = getGeminiClient(apiKey);
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { temperature: 0.7, maxOutputTokens: 350 },
      });

      const systemPrompt = `You are "Smriti-Setu AI", an intelligent, gentle, respectful companion for senior dementia patients.
Patient Name: "${patientName}".
Target Language: "${isHindi ? 'Hindi (हिन्दी)' : 'English'}".
Instructions:
1. Answer the question directly and factually in 2-3 gentle sentences in ${isHindi ? 'pure Hindi' : 'English'}.
2. If patient asked to open any game or feature, output action line: [ACTION:{"type":"OPEN_ACTIVITY"|"OPEN_TAB"|"TOGGLE_ELDERLY"|"OPEN_PORTAL"|"EXIT_ACTIVITY","payload":"value"}]
Otherwise: [ACTION:{"type":"NONE"}].`;

      const result = await model.generateContent(`${systemPrompt}\nUser: ${input}\nSmriti-Setu AI:`);
      const rawOutput = result.response.text().trim();

      let action: ActionPayload = { type: 'NONE' };
      const actionMatch = rawOutput.match(/\[ACTION:(.*?)\]/s);
      let cleanReply = rawOutput;
      if (actionMatch && actionMatch[1]) {
        try {
          action = JSON.parse(actionMatch[1]);
        } catch (e) {
          // fallback
        }
        cleanReply = cleanReply.replace(actionMatch[0], '').trim();
      }

      return {
        reply: cleanReply,
        spokenText: cleanForSpeech(cleanReply),
        detectedLanguage: isHindi ? 'hi' : 'en',
        action,
        quickSuggestions: isHindi ? ['गेम खेलें 🎮', 'दवाई रिमाइंडर ⏰'] : ['Play Game 🎮', 'Reminders ⏰'],
        source: 'gemini',
      };
    } catch (e) {
      console.warn('Gemini error, fallback to real-time knowledge:', e);
    }
  }

  // 3. THIRD: Live Knowledge Lookup
  const liveSummary = await fetchWikipediaSummary(input, isHindi);
  if (liveSummary) {
    return {
      reply: `${liveSummary} 📖`,
      spokenText: cleanForSpeech(liveSummary),
      detectedLanguage: isHindi ? 'hi' : 'en',
      action: { type: 'NONE' },
      quickSuggestions: isHindi ? ['गेम खेलें 🎮', 'दवाई रिमाइंडर ⏰'] : ['Play Game 🎮', 'Show Reminders ⏰'],
      source: 'live_knowledge',
    };
  }

  // 4. FOURTH: High quality conversational fallback
  if (isHindi) {
    return {
      reply: `मैंने आपकी बात सुन ली: "${input}". आप सीधे "मेमोरी मैच खोलो", "चेहरा पहचान खेल", "दवाई रिमाइंडर", या "यादें दिखाओ" बोल सकते हैं! 🌟`,
      spokenText: 'मैंने आपकी बात सुन ली। आप गेम खेलने या दवाई देखने के लिए कह सकते हैं।',
      detectedLanguage: 'hi',
      action: { type: 'NONE' },
      quickSuggestions: ['मेमोरी मैच खेलो 🎮', 'चेहरा पहचान 👨‍👩‍👧', 'दवाई रिमाइंडर ⏰', 'स्मृति उद्यान 🌸'],
      source: 'action_engine',
    };
  }

  return {
    reply: `I received your command: "${input}". You can directly say "Open memory match", "Family face game", "Show reminders", or "Open memory garden"! 🌟`,
    spokenText: 'I understand. You can say open game or show reminders.',
    detectedLanguage: 'en',
    action: { type: 'NONE' },
    quickSuggestions: ['Play Memory Match 🎮', 'Face Recognition 👨‍👩‍👧', 'Show Reminders ⏰', 'Memory Garden 🌸'],
    source: 'action_engine',
  };
}

/**
 * GET /api/assistant/status
 */
router.get('/status', (req: Request, res: Response) => {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  const hasCustomKey = Boolean(customGeminiApiKey && customGeminiApiKey.trim());

  res.json({
    geminiActive: hasEnvKey || hasCustomKey,
    model: 'gemini-1.5-flash',
    automationEnabled: true,
    supportedActions: [
      'Visual Memory Match',
      'Family & Face Recognition',
      'Find Same Images / Sequence Recall',
      'Familiar Sound Quiz',
      'Personalized Photo Puzzle',
      'Daily Reminders & Medications',
      'Memory Garden & Family Stories',
      'Elderly High-Contrast Accessibility Mode',
      'Public Healthcare Portal Search',
    ],
  });
});

/**
 * POST /api/assistant/set-key
 */
router.post('/set-key', (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'Valid apiKey string is required' });
  }

  customGeminiApiKey = apiKey.trim();
  res.json({
    success: true,
    message: 'Gemini API Key updated successfully!',
    geminiActive: true,
  });
});

/**
 * POST /api/assistant/chat
 */
router.post('/chat', async (req: Request, res: Response) => {
  const { message, language, patientName, apiKey } = req.body;
  const headerKey = (req.headers['x-gemini-api-key'] as string) || undefined;

  if (!message) {
    return res.status(400).json({ error: 'Missing message parameter' });
  }

  const effectiveKey = apiKey || headerKey || undefined;
  const userLang: 'hi' | 'en' = language === 'en' ? 'en' : (language === 'hi' ? 'hi' : detectLanguage(message, 'hi'));

  const result = await processAssistantRequest(
    message,
    userLang,
    patientName || (userLang === 'hi' ? 'मित्र' : 'Friend'),
    effectiveKey
  );

  return res.json(result);
});

export default router;
