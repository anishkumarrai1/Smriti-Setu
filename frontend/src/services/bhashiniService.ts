/**
 * frontend/src/services/bhashiniService.ts
 * ----------------------------------------
 * Frontend client service for Government of India Bhashini Multilingual Translation API.
 * Connects with full-stack backend endpoint to perform NMT translation for all NER languages.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export interface BhashiniResponse {
  originalText: string;
  translated: string;
  translatedText: string;
  source: string;
  pipelineId?: string;
  language: string;
  connectedApi?: string;
}

class BhashiniService {
  private cache: Map<string, string> = new Map();

  /**
   * Translates a single text string into target language via Govt. of India Bhashini API
   */
  async translateText(text: string, targetLanguage: string): Promise<string> {
    if (!text || !text.trim() || targetLanguage === 'en') {
      return text;
    }

    const cacheKey = `${targetLanguage}:${text.trim()}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/translate/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          targetLanguage,
          sourceLanguage: 'en',
        }),
      });

      if (response.ok) {
        const data: BhashiniResponse = await response.json();
        const result = data.translatedText || data.translated || text;
        this.cache.set(cacheKey, result);
        return result;
      }
    } catch (err) {
      console.warn('[BHASHINI CLIENT NOTICE] Bhashini translation request offline:', err);
    }

    return text;
  }

  /**
   * Batch translates an array of text strings via Govt. of India Bhashini API
   */
  async translateBatch(texts: string[], targetLanguage: string): Promise<string[]> {
    if (!Array.isArray(texts) || texts.length === 0 || targetLanguage === 'en') {
      return texts;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/translate/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts,
          targetLanguage,
          sourceLanguage: 'en',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.translations && Array.isArray(data.translations)) {
          return data.translations.map((item: any) => item.translatedText || item.originalText);
        }
      }
    } catch (err) {
      console.warn('[BHASHINI BATCH NOTICE] Bhashini batch translation request offline:', err);
    }

    return texts;
  }

  /**
   * Check connection status of Bhashini API service
   */
  async checkBhashiniStatus(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/translate/bhashini-status`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Failed to query Bhashini API status', err);
    }
    return { status: 'offline' };
  }
}

export const bhashiniService = new BhashiniService();
export default bhashiniService;
