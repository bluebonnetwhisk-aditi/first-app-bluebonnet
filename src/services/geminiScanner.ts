/**
 * Google Gemini Multimodal OCR & Menu Extractor Service
 * Specifically designed to parse Indian Homestyle Tiffin flyers (like Desi Dabba)
 * and auto-populate the weekly catering schedule, 16 oz sides, and pricing.
 */

import { supabase } from './supabase';
import type { 
  WeekdayMenuEntry, 
  ContainerAddonItem, 
  DabbaPricing, 
  TiffinSpecialDish 
} from '../types/catering';

export interface ScannedTiffinData {
  weekTitle?: string;
  startDate?: string;
  endDate?: string;
  dabbaPricing?: DabbaPricing;
  weekdayMenus?: Record<string, WeekdayMenuEntry>;
  containerAddons?: ContainerAddonItem[];
  specialDishes?: TiffinSpecialDish[];
}

const LOCAL_STORAGE_GEMINI_KEY = 'bbw_gemini_api_key';

/**
 * Retrieves the stored Gemini API key from environment, localStorage, or Supabase
 */
export async function getGeminiApiKey(): Promise<string> {
  // 1. Check environment variable first
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 10) {
    return envKey.trim();
  }

  // 2. Check localStorage
  try {
    const localKey = localStorage.getItem(LOCAL_STORAGE_GEMINI_KEY);
    if (localKey && localKey.trim().length > 10) {
      return localKey.trim();
    }
  } catch {}

  // 3. Check Supabase app_settings
  if (supabase) {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'gemini_api_key')
        .maybeSingle();

      if (data && data.value) {
        const key = typeof data.value === 'string' ? data.value : data.value.key;
        if (key && key.trim().length > 10) {
          localStorage.setItem(LOCAL_STORAGE_GEMINI_KEY, key.trim());
          return key.trim();
        }
      }
    } catch (err) {
      console.warn('Failed to retrieve Gemini key from Supabase', err);
    }
  }

  return '';
}

/**
 * Saves Gemini API key to localStorage and Supabase app_settings
 */
export async function saveGeminiApiKey(key: string): Promise<boolean> {
  const cleanKey = key.trim();
  try {
    localStorage.setItem(LOCAL_STORAGE_GEMINI_KEY, cleanKey);
  } catch {}

  if (supabase) {
    try {
      await supabase
        .from('app_settings')
        .upsert({
          key: 'gemini_api_key',
          value: { key: cleanKey },
          updated_at: new Date().toISOString()
        });
    } catch (err) {
      console.warn('Failed to persist Gemini API key to Supabase', err);
    }
  }

  return true;
}

/**
 * Converts a URL (base64 Data URL, relative path, or remote URL) to base64 & MIME type
 */
export async function urlToBase64(url: string): Promise<{ mimeType: string; base64: string }> {
  if (url.startsWith('data:')) {
    const [header, base64] = url.split(',');
    const mimeMatch = header.match(/data:(.*?);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    return { mimeType, base64 };
  }

  // Relative or absolute URL: fetch and convert to base64
  const response = await fetch(url);
  const blob = await response.blob();
  const mimeType = blob.type || 'image/jpeg';

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ mimeType, base64 });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

const SCAN_PROMPT = `
You are an expert OCR and menu extraction AI for an Indian homestyle tiffin catering service called "Desi Dabba" by BlueBonnet Whisk.
Analyze the provided weekly tiffin flyer image carefully and extract all menu details, dates, pricing, 16 oz container sides, and specials into the exact JSON format specified below.

Return JSON in this EXACT structure:
{
  "weekTitle": "string (e.g. 'September 21 - 26')",
  "dabbaPricing": {
    "singlePrice": number (e.g. 11.99),
    "familyPrice": number (e.g. 34.99),
    "weeklyPrice": number (e.g. 54.99)
  },
  "weekdayMenus": {
    "Monday": {
      "dal": "string (name of dal/curry/kadhi/chana, e.g. 'Palak Dal')",
      "sabzi": "string (name of dry or semi-dry vegetable dish, e.g. 'Cabbage Sabzi')",
      "description": "string (components like '1 cup rice, 1 cup Palak Dal, 1/2 cup Cabbage Sabzi, 2 Tawa Rotis')"
    },
    "Tuesday": {
      "dal": "string",
      "sabzi": "string",
      "description": "string"
    },
    "Wednesday": {
      "dal": "string",
      "sabzi": "string",
      "description": "string"
    },
    "Thursday": {
      "dal": "string",
      "sabzi": "string",
      "description": "string"
    },
    "Friday": {
      "dal": "string",
      "sabzi": "string",
      "description": "string"
    },
    "Saturday": {
      "dal": "string",
      "sabzi": "string",
      "description": "string"
    }
  },
  "containerAddons": [
    {
      "name": "string (e.g. 'Dal / Curry (Regular)', 'Paneer', 'Dry Sabzi', 'Rice', 'Raita')",
      "price": number (e.g. 9.99, 11.49, 14.99, 10.99, 4.99),
      "description": "string"
    }
  ],
  "specialDishes": [
    {
      "title": "string (e.g. 'Chef’s Special Pav Bhaji Feast')",
      "price": number (e.g. 13.99),
      "description": "string"
    }
  ]
}

Instructions:
- Read all day names accurately: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday.
- If Saturday mentions 'You decide!', DM requests, or custom specials, extract dal as 'Chef's Choice / Customer Request', sabzi as 'Customized Homestyle Sabzi', and description as 'Fresh Saturday tiffin prepared to order or your requested dish'.
- In dabbaPricing, extract Single Dabba price, Family Dabba price, and Weekly Dabba price as clean positive numbers.
- In containerAddons, extract all 16 oz items listed under '16 oz Containers Also Available' or similar section, with their exact numerical prices.
- In specialDishes, if there are weekend specials or chef specials, extract their title, price, and description.
- Return ONLY valid raw JSON with NO markdown code blocks, backticks, or other text.
`;

/**
 * Scans a tiffin flyer image using Google Gemini API and returns parsed structured data
 */
export async function scanTiffinFlyerWithGemini(
  imageUrlOrData: string,
  providedKey?: string
): Promise<ScannedTiffinData> {
  const apiKey = providedKey || await getGeminiApiKey();

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('Google Gemini API Key is missing. Please provide an API key to scan the flyer.');
  }

  const { mimeType, base64 } = await urlToBase64(imageUrlOrData);

  let lastError: Error | null = null;

  // Try available Gemini models in priority order
  for (const model of GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

      const requestBody = {
        contents: [
          {
            parts: [
              { text: SCAN_PROMPT },
              {
                inlineData: {
                  mimeType: mimeType.includes('png') ? 'image/png' : 'image/jpeg',
                  data: base64
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || `HTTP ${response.status} from ${model}`;
        // If 404 or model not found, try the next model
        if (response.status === 404 || response.status === 400 && msg.includes('models/')) {
          lastError = new Error(msg);
          continue;
        }
        throw new Error(`Gemini API Error (${model}): ${msg}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('No text generated by Google Gemini model.');
      }

      // Clean markdown code fence if returned
      const cleanJson = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed: ScannedTiffinData = JSON.parse(cleanJson);
      return sanitizeParsedTiffinData(parsed);

    } catch (err: any) {
      lastError = err;
      // If error is about API key invalid, stop trying other models
      if (err.message && (err.message.includes('API_KEY_INVALID') || err.message.includes('expired'))) {
        throw new Error('Invalid Gemini API Key. Please verify your key at https://aistudio.google.com/app/apikey');
      }
    }
  }

  throw lastError || new Error('Failed to scan flyer with Google Gemini. Please try again.');
}

/**
 * Sanitizes and validates the parsed Gemini output to ensure safe state mapping
 */
function sanitizeParsedTiffinData(data: any): ScannedTiffinData {
  const result: ScannedTiffinData = {};

  if (typeof data.weekTitle === 'string' && data.weekTitle.trim()) {
    result.weekTitle = data.weekTitle.trim();
  }

  if (data.dabbaPricing && typeof data.dabbaPricing === 'object') {
    result.dabbaPricing = {
      singlePrice: Number(data.dabbaPricing.singlePrice) || 11.99,
      familyPrice: Number(data.dabbaPricing.familyPrice) || 34.99,
      weeklyPrice: Number(data.dabbaPricing.weeklyPrice) || 54.99
    };
  }

  if (data.weekdayMenus && typeof data.weekdayMenus === 'object') {
    const sanitizedMenus: Record<string, WeekdayMenuEntry> = {};
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const day of validDays) {
      const entry = data.weekdayMenus[day] || data.weekdayMenus[day.toLowerCase()];
      if (entry) {
        sanitizedMenus[day] = {
          dal: (entry.dal || '').trim(),
          sabzi: (entry.sabzi || '').trim(),
          description: (entry.description || '').trim()
        };
      }
    }
    result.weekdayMenus = sanitizedMenus;
  }

  if (Array.isArray(data.containerAddons) && data.containerAddons.length > 0) {
    result.containerAddons = data.containerAddons.map((item: any, idx: number) => ({
      id: `gemini-addon-${idx}-${Date.now().toString(36)}`,
      name: (item.name || `Specialty Side ${idx + 1}`).trim(),
      price: Number(item.price) || 9.99,
      description: (item.description || '16 oz freshly prepared homestyle portion').trim()
    }));
  }

  if (Array.isArray(data.specialDishes) && data.specialDishes.length > 0) {
    result.specialDishes = data.specialDishes.map((item: any, idx: number) => ({
      id: `gemini-spec-${idx}-${Date.now().toString(36)}`,
      title: (item.title || 'Chef’s Weekend Special').trim(),
      price: Number(item.price) || 13.99,
      description: (item.description || 'Handcrafted weekend delicacy').trim(),
      imageUrl: ''
    }));
  }

  return result;
}

/**
 * Returns pre-extracted data from the bundled default flyer for instant demo / fallback
 */
export function getBundledFlyerParsedData(): ScannedTiffinData {
  return {
    weekTitle: 'September 21 - 26',
    dabbaPricing: {
      singlePrice: 11.99,
      familyPrice: 34.99,
      weeklyPrice: 54.99
    },
    weekdayMenus: {
      Monday: {
        dal: 'Palak Dal',
        sabzi: 'Cabbage Sabzi',
        description: '1 cup rice, 1 cup Palak Dal, 1/2 cup Cabbage Sabzi, 2 Tawa Rotis'
      },
      Tuesday: {
        dal: 'Lauki Kofta Curry',
        sabzi: 'Shimla Mirch Sabzi',
        description: '1 cup rice, 1 cup Lauki Kofta Curry, 1/2 cup Shimla Mirch Sabzi, 2 Tawa Rotis'
      },
      Wednesday: {
        dal: 'Rajma (with Chawal)',
        sabzi: 'Aloo Sabzi',
        description: 'Steamed basmati rice, 1 cup rich Punjabi Rajma, 1/2 cup Aloo Sabzi, 2 Tawa Rotis'
      },
      Thursday: {
        dal: 'Dal Tadka',
        sabzi: 'Bhindi Sabzi',
        description: '1 cup rice, 1 cup aromatic Dal Tadka, 1/2 cup crispy spiced Bhindi Sabzi, 2 Tawa Rotis'
      },
      Friday: {
        dal: 'Kala Chana Curry',
        sabzi: 'Beans Sabzi',
        description: '1 cup rice, 1 cup hearty Kala Chana Curry, 1/2 cup fresh French Beans Sabzi, 2 Tawa Rotis'
      },
      Saturday: {
        dal: 'Chef’s Choice / Customer Request',
        sabzi: 'Customized Weekend Sabzi',
        description: 'You decide! DM your weekend requests for fresh homestyle feast'
      }
    },
    containerAddons: [
      {
        id: 'addon-dal-reg',
        name: 'Dal / Curry (Regular)',
        price: 9.99,
        description: '16 oz tub of homestyle slow-simmered dal or daily curry'
      },
      {
        id: 'addon-dal-prem',
        name: 'Dal / Curry (Premium)',
        price: 11.49,
        description: '16 oz specialty curry (e.g. kofta, rajma, chana, or rich gravy)'
      },
      {
        id: 'addon-paneer',
        name: 'Paneer Dish',
        price: 14.99,
        description: '16 oz fresh cottage cheese curry in rich Mughlai or Kadai gravy'
      },
      {
        id: 'addon-sabzi',
        name: 'Dry Sabzi',
        price: 10.99,
        description: '16 oz seasonal dry spiced vegetable preparation'
      },
      {
        id: 'addon-rice',
        name: 'Steamed Rice',
        price: 4.99,
        description: '16 oz aromatic long-grain steamed Basmati rice'
      },
      {
        id: 'addon-raita',
        name: 'Cooling Raita',
        price: 4.99,
        description: '16 oz chilled spiced yogurt with roasted cumin and fresh cucumber or boondi'
      }
    ],
    specialDishes: [
      {
        id: 'spec-pavbhaji',
        title: 'Chef’s Special Pav Bhaji Feast',
        price: 13.99,
        description: 'Slow-simmered spiced vegetable bhaji with extra butter, 2 toasted ladi pavs, onion salad & masala chili.',
        imageUrl: ''
      }
    ]
  };
}
