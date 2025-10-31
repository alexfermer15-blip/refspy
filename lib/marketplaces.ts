// lib/marketplaces.ts

interface MarketplaceOffer {
  domain: string
  marketplace: string
  price: number
  currency: string
  dr: number
  link_type: string
  url?: string
}

/**
 * Поиск предложений на биржах ссылок
 */
export async function searchMarketplaces(domains: string[]): Promise<MarketplaceOffer[]> {
  const allOffers: MarketplaceOffer[] = []

  for (const domain of domains) {
    try {
      // Параллельный поиск на всех биржах
      const [miralinks, getgoodlinks, sape, prchecker] = await Promise.all([
        searchMiralinks(domain),
        searchGetGoodLinks(domain),
        searchSape(domain),
        searchPRChecker(domain)
      ])

      allOffers.push(...miralinks, ...getgoodlinks, ...sape, ...prchecker)
    } catch (error) {
      console.error(`Error searching for ${domain}:`, error)
    }
  }

  // Сортировка по цене (от дешевых к дорогим)
  return allOffers.sort((a, b) => {
    const priceA = a.currency === 'RUB' ? a.price / 100 : a.price
    const priceB = b.currency === 'RUB' ? b.price / 100 : b.price
    return priceA - priceB
  })
}

/**
 * Miralinks API
 */
async function searchMiralinks(domain: string): Promise<MarketplaceOffer[]> {
  try {
    // TODO: Интегрировать с реальным API Miralinks
    // const response = await fetch('https://api.miralinks.ru/...')
    
    // Моковые данные для теста
    return [
      {
        domain,
        marketplace: 'Miralinks',
        price: Math.floor(Math.random() * 200) + 100,
        currency: 'USD',
        dr: Math.floor(Math.random() * 30) + 60,
        link_type: 'guest_post',
        url: `https://miralinks.ru/domain/${domain}`
      }
    ]
  } catch (error) {
    console.error('Miralinks API error:', error)
    return []
  }
}

/**
 * GetGoodLinks API
 */
async function searchGetGoodLinks(domain: string): Promise<MarketplaceOffer[]> {
  try {
    // TODO: Интегрировать с GetGoodLinks API
    
    return [
      {
        domain,
        marketplace: 'GetGoodLinks',
        price: Math.floor(Math.random() * 180) + 80,
        currency: 'USD',
        dr: Math.floor(Math.random() * 30) + 60,
        link_type: 'article',
        url: `https://getgoodlinks.com/site/${domain}`
      }
    ]
  } catch (error) {
    console.error('GetGoodLinks API error:', error)
    return []
  }
}

/**
 * Sape API (для РУ/BY рынка)
 */
async function searchSape(domain: string): Promise<MarketplaceOffer[]> {
  try {
    // TODO: Интегрировать с Sape API
    
    return [
      {
        domain,
        marketplace: 'Sape',
        price: Math.floor(Math.random() * 10000) + 3000,
        currency: 'RUB',
        dr: Math.floor(Math.random() * 25) + 50,
        link_type: 'article',
        url: `https://sape.ru/site/${domain}`
      }
    ]
  } catch (error) {
    console.error('Sape API error:', error)
    return []
  }
}

/**
 * PRChecker API
 */
async function searchPRChecker(domain: string): Promise<MarketplaceOffer[]> {
  try {
    // TODO: Интегрировать с реальным API
    
    return [
      {
        domain,
        marketplace: 'PRChecker',
        price: Math.floor(Math.random() * 150) + 70,
        currency: 'USD',
        dr: Math.floor(Math.random() * 30) + 55,
        link_type: 'guest_post'
      }
    ]
  } catch (error) {
    console.error('PRChecker API error:', error)
    return []
  }
}

/**
 * Проверка бесплатного размещения
 */
export async function checkFreeOpportunities(domain: string) {
  const opportunities = []

  // Проверка страницы "Write for us"
  const writeForUsUrls = [
    `https://${domain}/write-for-us`,
    `https://${domain}/guest-post`,
    `https://${domain}/contribute`,
    `https://${domain}/submit-article`
  ]

  for (const url of writeForUsUrls) {
    const isAvailable = await checkURL(url)
    if (isAvailable) {
      opportunities.push({
        type: 'guest_post',
        url,
        available: true,
        cost: 0,
        method: 'free_submission'
      })
      break // Нашли одну - достаточно
    }
  }

  // Проверка контактной формы
  const contactUrls = [
    `https://${domain}/contact`,
    `https://${domain}/contacts`,
    `https://${domain}/about/contact`
  ]

  for (const url of contactUrls) {
    const isAvailable = await checkURL(url)
    if (isAvailable) {
      opportunities.push({
        type: 'contact_form',
        url,
        available: true,
        cost: 0,
        method: 'outreach'
      })
      break
    }
  }

  return opportunities
}

async function checkURL(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    })
    return response.ok
  } catch {
    return false
  }
}
