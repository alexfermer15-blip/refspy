// lib/middleware/rateLimit.ts
// Ограничение запросов

interface RateLimitConfig {
  windowMs: number  // Окно времени в миллисекундах
  maxRequests: number  // Максимум запросов
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()

  constructor(private config: RateLimitConfig) {
    // Очистка старых записей каждую минуту
    setInterval(() => this.cleanup(), 60000)
  }

  // Проверка лимита
  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.store.get(key)

    // Если записи нет или время истекло
    if (!entry || now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.config.windowMs
      }
      this.store.set(key, newEntry)

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: newEntry.resetTime
      }
    }

    // Если лимит превышен
    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    // Увеличиваем счетчик
    entry.count++
    this.store.set(key, entry)

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }

  // Очистка старых записей
  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  // Сброс для конкретного ключа
  reset(key: string) {
    this.store.delete(key)
  }
}

// Предустановленные лимиты
export const rateLimiters = {
  // API запросы - 100 запросов в минуту
  api: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100
  }),

  // Анализ конкурентов - 10 запросов в час
  analysis: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 10
  }),

  // Экспорт - 5 раз в час
  export: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 5
  }),

  // Авторизация - 5 попыток в 15 минут
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5
  })
}

// Хелпер для создания ключа rate limit
export function getRateLimitKey(userId: string, action: string): string {
  return `${userId}:${action}`
}
