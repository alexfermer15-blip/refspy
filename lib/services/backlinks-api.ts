// lib/services/backlinks-api.ts

interface BacklinkData {
  source_domain: string
  source_url: string
  target_url: string
  anchor_text: string
  dr: number
  link_type: 'dofollow' | 'nofollow'
}

/**
 * Получить бэклинки для доменов конкурентов через SerpApi
 */
export async function getBacklinksForDomains(domains: string[]): Promise<BacklinkData[]> {
  const SERPAPI_KEY = process.env.SERPAPI_KEY
  
  if (!SERPAPI_KEY) {
    throw new Error('SERPAPI_KEY is not configured')
  }

  const allBacklinks: BacklinkData[] = []

  for (const domain of domains) {
    try {
      // Используем SerpApi для поиска упоминаний домена
      const response = await fetch(
        `https://serpapi.com/search.json?` +
        `engine=google&` +
        `q=link:${domain}&` +
        `api_key=${SERPAPI_KEY}&` +
        `num=10`
      )

      const data = await response.json()

      if (data.organic_results) {
        for (const result of data.organic_results) {
          // Получаем DR через OpenPageRank
          const dr = await getDomainRating(result.link || result.displayed_link)

          allBacklinks.push({
            source_domain: extractDomain(result.link || result.displayed_link),
            source_url: result.link || result.displayed_link,
            target_url: `https://${domain}`,
            anchor_text: result.title || 'Unknown anchor',
            dr: dr || 0,
            link_type: 'dofollow' // По умолчанию, требуется парсинг для точного определения
          })
        }
      }

      console.log(`Found ${allBacklinks.length} backlinks for ${domain}`)
    } catch (error) {
      console.error(`Error fetching backlinks for ${domain}:`, error)
    }
  }

  return allBacklinks
}

/**
 * Получить Domain Rating через OpenPageRank API
 */
async function getDomainRating(url: string): Promise<number> {
  const OPENPAGERANK_API_KEY = process.env.OPENPAGERANK_API_KEY

  if (!OPENPAGERANK_API_KEY) {
    return 0
  }

  try {
    const domain = extractDomain(url)
    const response = await fetch(
      `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${domain}`,
      {
        headers: {
          'API-OPR': OPENPAGERANK_API_KEY
        }
      }
    )

    const data = await response.json()

    if (data.response && data.response.length > 0) {
      // OpenPageRank возвращает значение от 0 до 10, конвертируем в DR (0-100)
      return Math.round(data.response[0].page_rank_decimal * 10)
    }

    return 0
  } catch (error) {
    console.error('Error fetching domain rating:', error)
    return 0
  }
}

/**
 * Извлечь домен из URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}
