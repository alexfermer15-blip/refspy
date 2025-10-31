// lib/hooks/useFilters.ts
'use client'

import { useState, useMemo } from 'react'
import { debounce } from '@/lib/utils'

export interface FilterConfig<T> {
  searchFields?: (keyof T)[]
  dateField?: keyof T
}

export function useFilters<T extends Record<string, any>>(
  data: T[],
  config: FilterConfig<T>
) {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({})
  const [sortBy, setSortBy] = useState<keyof T | ''>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [customFilters, setCustomFilters] = useState<Record<string, any>>({})

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchQuery(value), 300),
    []
  )

  // Фильтрация данных
  const filteredData = useMemo(() => {
    let result = [...data]

    // Поиск
    if (searchQuery && config.searchFields) {
      result = result.filter((item) =>
        config.searchFields!.some((field) => {
          const value = item[field]
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchQuery.toLowerCase())
          }
          return false
        })
      )
    }

    // Фильтр по датам
    if (config.dateField && (dateRange.start || dateRange.end)) {
      result = result.filter((item) => {
        const dateValue = item[config.dateField!]
        if (!dateValue) return false
        
        const date = new Date(dateValue as string)
        if (dateRange.start && date < new Date(dateRange.start)) return false
        if (dateRange.end && date > new Date(dateRange.end)) return false
        return true
      })
    }

    // Кастомные фильтры
    Object.entries(customFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        // Для минимального DR
        if (key === 'dr_min') {
          result = result.filter((item) => (item.dr || 0) >= Number(value))
          return
        }
        
        // Для is_available (конвертация string в boolean)
        if (key === 'is_available') {
          result = result.filter((item) => item.is_available === (value === 'true'))
          return
        }

        // Обычные фильтры
        if (Array.isArray(value)) {
          result = result.filter((item) => value.includes(item[key]))
        } else {
          result = result.filter((item) => item[key] === value)
        }
      }
    })

    // Сортировка
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]

        // Обработка undefined/null
        if (aVal === undefined || aVal === null) return sortOrder === 'asc' ? 1 : -1
        if (bVal === undefined || bVal === null) return sortOrder === 'asc' ? -1 : 1

        // Для строк
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal)
        }

        // Для чисел
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
        }

        // ✅ ИСПРАВЛЕНО: для дат (проверяем строки с датами)
        const aDate = new Date(aVal as string)
        const bDate = new Date(bVal as string)
        
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return sortOrder === 'asc' 
            ? aDate.getTime() - bDate.getTime() 
            : bDate.getTime() - aDate.getTime()
        }

        return 0
      })
    }

    return result
  }, [data, searchQuery, dateRange, customFilters, sortBy, sortOrder, config])

  // Сброс всех фильтров
  const resetFilters = () => {
    setSearchQuery('')
    setDateRange({})
    setSortBy('')
    setSortOrder('desc')
    setCustomFilters({})
  }

  // Установка кастомного фильтра
  const setFilter = (key: string, value: any) => {
    setCustomFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Удаление кастомного фильтра
  const removeFilter = (key: string) => {
    setCustomFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }

  return {
    // Данные
    filteredData,
    
    // Состояние
    searchQuery,
    dateRange,
    sortBy,
    sortOrder,
    customFilters,
    
    // Действия
    setSearchQuery: debouncedSearch,
    setDateRange,
    setSortBy,
    setSortOrder,
    setFilter,
    removeFilter,
    resetFilters,
    
    // Статистика
    totalCount: data.length,
    filteredCount: filteredData.length,
    hasActiveFilters: !!(
      searchQuery ||
      dateRange.start ||
      dateRange.end ||
      Object.keys(customFilters).length > 0
    )
  }
}
