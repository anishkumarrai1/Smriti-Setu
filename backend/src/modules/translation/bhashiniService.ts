/**
 * backend/src/modules/translation/bhashiniService.ts
 * ----------------------------------------------------
 * Official Bhashini (Government of India NLTM) Translation Engine Integration.
 * Connects with Dhruva ULCA Pipeline Inference API for Indian and Northeast languages.
 */

export interface BhashiniTranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  source: 'bhashini_dhruva_api' | 'local_ner_dictionary' | 'fallback_baseline';
  pipelineId?: string;
}

// Bhashini Dhruva Pipeline Endpoint (Govt. of India Official NMT Endpoint)
const BHASHINI_DHRUVA_ENDPOINT =
  process.env.BHASHINI_DHRUVA_ENDPOINT || 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';

const BHASHINI_USER_ID = process.env.BHASHINI_USER_ID || 'smriti_setu_ner_gov';
const BHASHINI_API_KEY = process.env.BHASHINI_API_KEY || 'bhashini_ner_pipeline_token_2026';
const BHASHINI_PIPELINE_ID = process.env.BHASHINI_PIPELINE_ID || '64392f08daac500b55c5436d';

// Language code mapping for Bhashini ULCA standards
const BHASHINI_LANG_CODES: Record<string, string> = {
  en: 'en',
  hi: 'hi',
  as: 'as', // Assamese
  bn: 'bn', // Bengali
  brx: 'brx', // Bodo
  mni: 'mni', // Manipuri
  ne: 'ne', // Nepali
  lus: 'en', // Mizo (fallback to English or Assamese if Bhashini model unavailable)
  trp: 'bn', // Kokborok (fallback to Bengali script in Bhashini pipeline)
};

/**
 * Calls Govt. of India Bhashini Dhruva Pipeline NMT API to translate text.
 */
export async function translateTextWithBhashini(
  text: string,
  targetLang: string,
  sourceLang: string = 'en'
): Promise<BhashiniTranslationResult> {
  const trimmed = text ? text.trim() : '';
  if (!trimmed || targetLang === sourceLang) {
    return {
      originalText: text,
      translatedText: text,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      source: 'fallback_baseline',
    };
  }

  const bhashiniTargetCode = BHASHINI_LANG_CODES[targetLang] || targetLang;
  const bhashiniSourceCode = BHASHINI_LANG_CODES[sourceLang] || sourceLang;

  // Construct official Bhashini ULCA Dhruva Pipeline Payload
  const payload = {
    pipelineTasks: [
      {
        taskType: 'translation',
        config: {
          language: {
            sourceLanguage: bhashiniSourceCode,
            targetLanguage: bhashiniTargetCode,
          },
          serviceId: `ai4bharat/indictrans-v2-all-${bhashiniSourceCode}-${bhashiniTargetCode}`,
        },
      },
    ],
    inputData: {
      input: [
        {
          source: trimmed,
        },
      ],
    },
  };

  try {
    const response = await fetch(BHASHINI_DHRUVA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        userID: BHASHINI_USER_ID,
        ulcaApiKey: BHASHINI_API_KEY,
        Authorization: `Bearer ${BHASHINI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = (await response.json()) as any;
      const translated =
        data?.pipelineResponse?.[0]?.output?.[0]?.target ||
        data?.translatedText ||
        data?.output?.[0]?.target;

      if (translated && typeof translated === 'string') {
        return {
          originalText: text,
          translatedText: translated,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          source: 'bhashini_dhruva_api',
          pipelineId: BHASHINI_PIPELINE_ID,
        };
      }
    }
  } catch (err) {
    console.warn(`[BHASHINI API NOTICE] API call offline or credentials in demo mode: ${err}`);
  }

  return {
    originalText: text,
    translatedText: text,
    sourceLanguage: sourceLang,
    targetLanguage: targetLang,
    source: 'fallback_baseline',
  };
}

/**
 * Calls Govt. of India Bhashini Dhruva Pipeline for batch array of strings.
 */
export async function translateBatchWithBhashini(
  texts: string[],
  targetLang: string,
  sourceLang: string = 'en'
): Promise<Array<BhashiniTranslationResult>> {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const promises = texts.map((t) => translateTextWithBhashini(t, targetLang, sourceLang));
  return Promise.all(promises);
}
