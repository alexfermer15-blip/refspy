// Интеграция с DataForSEO SERP API
// https://dataforseo.com/apis/serp-api

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD

export async function getSERPResults(
  keyword: string,
  locationCode: number = 2643 // Russia
) {
  const auth = Buffer.from(
    `${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`
  ).toString('base64')

  const response = await fetch(
    'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        {
          keyword,
          location_code: locationCode,
          language_code: 'ru',
          device: 'desktop',
          os: 'windows',
          depth: 100
        }
      ])
    }
  )

  if (!response.ok) {
    throw new Error('SERP API request failed')
  }

  const data = await response.json()
  return data.tasks[0].result[0].items || []
}

// Получение backlinks через DataForSEO
export async function getBacklinks(domain: string) {
  const auth = Buffer.from(
    `${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`
  ).toString('base64')

  const response = await fetch(
    'https://api.dataforseo.com/v3/backlinks/backlinks/live',
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        {
          target: domain,
          mode: 'as_is',
          filters: ['dofollow', '=', true],
          limit: 1000
        }
      ])
    }
  )

  if (!response.ok) {
    throw new Error('Backlinks API request failed')
  }

  const data = await response.json()
  return data.tasks[0].result[0].items || []
}
