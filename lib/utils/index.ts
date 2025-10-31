// lib/utils/index.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Объединение Tailwind классов
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Форматирование чисел
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

// Форматирование даты
export function formatDate(date: string | Date, locale: 'en' | 'ru' = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d)
}

// Форматирование относительного времени
export function formatRelativeTime(date: string | Date, locale: 'en' | 'ru' = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  const t = {
    en: {
      justNow: 'just now',
      minutesAgo: (n: number) => `${n} ${n === 1 ? 'minute' : 'minutes'} ago`,
      hoursAgo: (n: number) => `${n} ${n === 1 ? 'hour' : 'hours'} ago`,
      daysAgo: (n: number) => `${n} ${n === 1 ? 'day' : 'days'} ago`
    },
    ru: {
      justNow: 'только что',
      minutesAgo: (n: number) => `${n} ${n === 1 ? 'минуту' : n < 5 ? 'минуты' : 'минут'} назад`,
      hoursAgo: (n: number) => `${n} ${n === 1 ? 'час' : n < 5 ? 'часа' : 'часов'} назад`,
      daysAgo: (n: number) => `${n} ${n === 1 ? 'день' : n < 5 ? 'дня' : 'дней'} назад`
    }
  }

  const trans = t[locale]

  if (diffSecs < 60) return trans.justNow
  if (diffMins < 60) return trans.minutesAgo(diffMins)
  if (diffHours < 24) return trans.hoursAgo(diffHours)
  return trans.daysAgo(diffDays)
}

// Извлечение домена из URL
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}

// Усечение текста
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// Генерация случайного цвета для аватара
export function generateColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color = Math.floor(Math.abs((Math.sin(hash) * 16777215) % 1) * 16777215)
  return '#' + color.toString(16).padStart(6, '0')
}

// Копирование в буфер обмена
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// Скачивание файла
export function downloadFile(data: Blob | string, filename: string) {
  const blob = typeof data === 'string' ? new Blob([data], { type: 'text/plain' }) : data
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Задержка (для debounce)
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Debounce функция
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
