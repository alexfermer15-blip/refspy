// lib/services/serp-api.ts

interface SerpAPIResponse {
  organic_results: Array<{
    position: number;
    title: string;
    link: string;
    snippet: string;
  }>;
}

interface CheckPositionParams {
  keyword: string;
  targetUrl: string;
  searchEngine?: 'google' | 'yandex' | 'bing';
  location?: string;
  language?: string;
  device?: 'desktop' | 'mobile';
}

export async function checkKeywordPosition(params: CheckPositionParams): Promise<{
  position: number | null;
  url: string | null;
  found: boolean;
}> {
  const {
    keyword,
    targetUrl,
    searchEngine = 'google',
    location = 'Russia',
    language = 'ru',
    device = 'desktop'
  } = params;

  try {
    const apiKey = process.env.SERPAPI_KEY;
    
    if (!apiKey) {
      throw new Error('SERPAPI_KEY not configured');
    }

    // Нормализуем целевой URL
    const normalizedTarget = new URL(targetUrl).hostname.replace('www.', '');

    // Формируем запрос к SerpAPI
    const url = new URL('https://serpapi.com/search');
    url.searchParams.append('api_key', apiKey);
    url.searchParams.append('q', keyword);
    url.searchParams.append('engine', searchEngine);
    url.searchParams.append('location', location);
    url.searchParams.append('hl', language);
    url.searchParams.append('gl', language === 'ru' ? 'ru' : 'us');
    url.searchParams.append('num', '100'); // Проверяем до 100 позиций
    
    if (device === 'mobile') {
      url.searchParams.append('device', 'mobile');
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status}`);
    }

    const data: SerpAPIResponse = await response.json();

    // Ищем нашу страницу в результатах
    for (const result of data.organic_results || []) {
      const resultHostname = new URL(result.link).hostname.replace('www.', '');
      
      // Сравниваем домены или полные URL
      if (resultHostname === normalizedTarget || result.link.includes(targetUrl)) {
        return {
          position: result.position,
          url: result.link,
          found: true
        };
      }
    }

    // Не найдено в топ-100
    return {
      position: null,
      url: null,
      found: false
    };
  } catch (error) {
    console.error('Error checking position:', error);
    throw error;
  }
}

// Массовая проверка позиций
export async function checkMultiplePositions(
  keywords: Array<{
    id: string;
    keyword: string;
    target_url: string;
    search_engine: string;
    location: string;
    language: string;
    device: string;
  }>
): Promise<Array<{
  keywordId: string;
  position: number | null;
  url: string | null;
  found: boolean;
  error?: string;
}>> {
  const results = [];

  for (const kw of keywords) {
    try {
      const result = await checkKeywordPosition({
        keyword: kw.keyword,
        targetUrl: kw.target_url,
        searchEngine: kw.search_engine as any,
        location: kw.location,
        language: kw.language,
        device: kw.device as any
      });

      results.push({
        keywordId: kw.id,
        ...result
      });

      // Задержка между запросами (чтобы не превысить лимиты)
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      results.push({
        keywordId: kw.id,
        position: null,
        url: null,
        found: false,
        error: error.message
      });
    }
  }

  return results;
}
