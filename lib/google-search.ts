// lib/google-search.ts

/**
 * Проверяет позицию сайта в Google по ключевому слову
 * @param keyword - Ключевое слово для поиска
 * @param domain - Домен для поиска позиции
 * @param region - Регион поиска (по умолчанию 'us')
 * @returns Позицию сайта (1-100) или null если не найден
 */
export async function checkPosition(
  keyword: string,
  domain: string,
  region: string = 'us'
): Promise<number | null> {
  try {
    // Вариант 1: Использование Google Custom Search API
    if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX_ID) {
      return await checkPositionWithGoogleAPI(keyword, domain, region)
    }

    // Вариант 2: Использование DataForSEO (рекомендуется)
    if (process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD) {
      return await checkPositionWithDataForSEO(keyword, domain, region)
    }

    console.error('No API credentials configured for position tracking')
    return null
  } catch (error) {
    console.error('Error checking position:', error)
    return null
  }
}

/**
 * Проверка позиции через Google Custom Search API
 */
async function checkPositionWithGoogleAPI(
  keyword: string,
  domain: string,
  region: string
): Promise<number | null> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY
    const cx = process.env.GOOGLE_CX_ID

    // Google Custom Search API поддерживает только 10 результатов за запрос
    // Делаем 10 запросов для проверки TOP-100
    for (let start = 1; start <= 91; start += 10) {
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(keyword)}&start=${start}&gl=${region}`

      const response = await fetch(url)
      const data = await response.json()

      if (!data.items) continue

      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i]
        const resultDomain = new URL(item.link).hostname.replace('www.', '')
        const targetDomain = domain.replace('www.', '')

        if (resultDomain === targetDomain) {
          return start + i
        }
      }

      // Задержка между запросами (чтобы не превысить лимит API)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return null // Не найдено в TOP-100
  } catch (error) {
    console.error('Google API error:', error)
    throw error
  }
}

/**
 * Проверка позиции через DataForSEO (РЕКОМЕНДУЕТСЯ)
 */
async function checkPositionWithDataForSEO(
  keyword: string,
  domain: string,
  region: string
): Promise<number | null> {
  try {
    const login = process.env.DATAFORSEO_LOGIN!
    const password = process.env.DATAFORSEO_PASSWORD!

    const auth = Buffer.from(`${login}:${password}`).toString('base64')

    // 1. Создаём задачу на проверку позиции
    const taskResponse = await fetch('https://api.dataforseo.com/v3/serp/google/organic/task_post', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        keyword,
        location_code: getLocationCode(region),
        language_code: 'en',
        depth: 100
      }])
    })

    const taskData = await taskResponse.json()

    if (taskData.status_code !== 20000) {
      throw new Error(`DataForSEO task error: ${taskData.status_message}`)
    }

    const taskId = taskData.tasks[0].id

    // 2. Ждём выполнения задачи и получаем результаты
    await new Promise(resolve => setTimeout(resolve, 5000)) // Ждём 5 секунд

    const resultsResponse = await fetch(
      `https://api.dataforseo.com/v3/serp/google/organic/task_get/${taskId}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }
    )

    const resultsData = await resultsResponse.json()

    if (resultsData.status_code !== 20000) {
      throw new Error(`DataForSEO results error: ${resultsData.status_message}`)
    }

    const items = resultsData.tasks[0].result[0].items || []
    const targetDomain = domain.replace('www.', '')

    for (const item of items) {
      if (item.type === 'organic') {
        const resultDomain = new URL(item.url).hostname.replace('www.', '')
        
        if (resultDomain === targetDomain) {
          return item.rank_absolute
        }
      }
    }

    return null // Не найдено в TOP-100
  } catch (error) {
    console.error('DataForSEO error:', error)
    throw error
  }
}

/**
 * Получает location_code для DataForSEO API
 */
function getLocationCode(region: string): number {
  const locationCodes: Record<string, number> = {
    'us': 2840,      // United States
    'uk': 2826,      // United Kingdom
    'ca': 2124,      // Canada
    'au': 2036,      // Australia
    'de': 2276,      // Germany
    'fr': 2250,      // France
    'es': 2724,      // Spain
    'it': 2380,      // Italy
    'br': 2076,      // Brazil
    'in': 2356,      // India
    'ru': 2643,      // Russia
  }

  return locationCodes[region] || locationCodes['us']
}

/**
 * Массовая проверка позиций (для cron job)
 */
export async function checkMultiplePositions(
  queries: Array<{
    keyword: string
    domain: string
    region: string
  }>
): Promise<Array<{ keyword: string; domain: string; position: number | null }>> {
  const results = []

  for (const query of queries) {
    const position = await checkPosition(query.keyword, query.domain, query.region)
    
    results.push({
      keyword: query.keyword,
      domain: query.domain,
      position
    })

    // Задержка между запросами (чтобы не перегрузить API)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return results
}
