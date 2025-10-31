// lib/config/site.ts
export const siteConfig = {
  name: 'RefSpy',
  description: 'Your competitive intelligence platform for SEO success',
  url: 'https://refspy.com',
  
  // Цвета
  colors: {
    primary: '#ff6b00',
    secondary: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  },

  // Социальные сети
  social: {
    twitter: 'https://twitter.com/refspy',
    github: 'https://github.com/refspy',
    linkedin: 'https://linkedin.com/company/refspy'
  },

  // Лимиты
  limits: {
    free: {
      projects: 3,
      competitors: 10,
      backlinks: 50,
      aiScans: 10
    },
    basic: {
      projects: 10,
      competitors: 50,
      backlinks: 500,
      aiScans: 100
    },
    pro: {
      projects: 50,
      competitors: 200,
      backlinks: 5000,
      aiScans: 1000
    },
    enterprise: {
      projects: -1, // unlimited
      competitors: -1,
      backlinks: -1,
      aiScans: -1
    }
  },

  // Цены
  pricing: {
    free: {
      price: 0,
      currency: 'USD',
      period: 'forever'
    },
    basic: {
      price: 29,
      currency: 'USD',
      period: 'month'
    },
    pro: {
      price: 99,
      currency: 'USD',
      period: 'month'
    },
    enterprise: {
      price: 499,
      currency: 'USD',
      period: 'month'
    }
  },

  // API endpoints
  api: {
    serpApi: 'https://serpapi.com/search',
    dataForSeo: 'https://api.dataforseo.com/v3'
  },

  // Регионы для поиска
  regions: [
    { value: 'Russia', label: '🇷🇺 Russia', code: 'RU' },
    { value: 'United States', label: '🇺🇸 United States', code: 'US' },
    { value: 'United Kingdom', label: '🇬🇧 United Kingdom', code: 'GB' },
    { value: 'Germany', label: '🇩🇪 Germany', code: 'DE' },
    { value: 'France', label: '🇫🇷 France', code: 'FR' },
    { value: 'Spain', label: '🇪🇸 Spain', code: 'ES' },
    { value: 'Italy', label: '🇮🇹 Italy', code: 'IT' },
    { value: 'Canada', label: '🇨🇦 Canada', code: 'CA' },
    { value: 'Australia', label: '🇦🇺 Australia', code: 'AU' },
    { value: 'Japan', label: '🇯🇵 Japan', code: 'JP' }
  ]
}
