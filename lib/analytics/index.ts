// lib/analytics/index.ts
// Отслеживание событий и метрик

interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: Date
}

class Analytics {
  private queue: AnalyticsEvent[] = []
  private isInitialized = false

  // Инициализация
  init() {
    if (this.isInitialized) return
    this.isInitialized = true
    console.log('📊 Analytics initialized')
  }

  // Отслеживание события
  track(name: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: new Date()
    }

    this.queue.push(event)
    this.sendEvent(event)
  }

  // Отслеживание просмотра страницы
  page(path: string, properties?: Record<string, any>) {
    this.track('page_view', {
      path,
      ...properties
    })
  }

  // Идентификация пользователя
  identify(userId: string, traits?: Record<string, any>) {
    this.track('user_identified', {
      userId,
      ...traits
    })
  }

  // Отправка события (можно интегрировать с Google Analytics, Mixpanel и т.д.)
  private async sendEvent(event: AnalyticsEvent) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event)
      return
    }

    // TODO: Интеграция с реальной аналитикой
    try {
      // Пример для Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.name, event.properties)
      }
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }

  // Получение всех событий из очереди
  getQueue() {
    return this.queue
  }

  // Очистка очереди
  clearQueue() {
    this.queue = []
  }
}

export const analytics = new Analytics()

// Хелперы для частых событий
export const trackEvent = {
  // Проекты
  projectCreated: (projectId: string, projectName: string) => {
    analytics.track('project_created', { projectId, projectName })
  },
  projectDeleted: (projectId: string) => {
    analytics.track('project_deleted', { projectId })
  },
  projectViewed: (projectId: string) => {
    analytics.track('project_viewed', { projectId })
  },

  // Конкуренты
  competitorsAnalyzed: (projectId: string, count: number) => {
    analytics.track('competitors_analyzed', { projectId, count })
  },
  competitorSelected: (competitorDomain: string) => {
    analytics.track('competitor_selected', { competitorDomain })
  },

  // Бэклинки
  backlinksLoaded: (projectId: string, count: number) => {
    analytics.track('backlinks_loaded', { projectId, count })
  },
  backlinkExported: (projectId: string, format: string) => {
    analytics.track('backlink_exported', { projectId, format })
  },

  // Пользователь
  userSignedUp: (userId: string, email: string) => {
    analytics.track('user_signed_up', { userId, email })
  },
  userLoggedIn: (userId: string) => {
    analytics.track('user_logged_in', { userId })
  },
  userLoggedOut: () => {
    analytics.track('user_logged_out')
  },

  // Оплата
  subscriptionUpgraded: (plan: string, userId: string) => {
    analytics.track('subscription_upgraded', { plan, userId })
  },
  paymentCompleted: (amount: number, currency: string) => {
    analytics.track('payment_completed', { amount, currency })
  }
}
