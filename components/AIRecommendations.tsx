'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

interface AIRecommendationsProps {
  projectId: string
}

interface Recommendation {
  id: string
  type: 'success' | 'warning' | 'info'
  icon: string
  title: string
  description: string
  action?: string
  actionUrl?: string
}

export function AIRecommendations({ projectId }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateRecommendations()
  }, [projectId])

  const generateRecommendations = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Получаем данные проекта
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      const { data: competitors } = await supabase
        .from('competitors')
        .select('*')
        .eq('project_id', projectId)

      const { data: backlinks } = await supabase
        .from('backlinks')
        .select('*')
        .eq('project_id', projectId)

      const { data: rankHistory } = await supabase
        .from('rank_tracking')
        .select('*')
        .eq('project_id', projectId)
        .order('checked_at', { ascending: false })
        .limit(7)

      const recs: Recommendation[] = []

      // 1. Анализ конкурентов
      if (competitors && competitors.length > 0) {
        recs.push({
          id: '1',
          type: 'success',
          icon: '✅',
          title: `Найдено ${competitors.length} конкурентов`,
          description: `Проанализировано ${competitors.length} сайтов в TOP-${competitors.length} по запросу "${project?.keyword}"`,
        })
      } else {
        recs.push({
          id: '1',
          type: 'warning',
          icon: '⚠️',
          title: 'Конкуренты не найдены',
          description: 'Запустите анализ для поиска конкурентов',
          action: 'Запустить анализ',
          actionUrl: '#analyze'
        })
      }

      // 2. Анализ бэклинков
      if (backlinks && backlinks.length > 0) {
        const highQuality = backlinks.filter((b: any) => b.dr >= 50 && b.is_dofollow)
        
        if (highQuality.length > 0) {
          recs.push({
            id: '2',
            type: 'success',
            icon: '🔗',
            title: `${highQuality.length} качественных бэклинков`,
            description: `Найдено ${highQuality.length} ссылок с DR > 50 и dofollow`,
          })
        }

        const avgDR = Math.round(backlinks.reduce((sum: number, b: any) => sum + (b.dr || 0), 0) / backlinks.length)
        
        if (avgDR < 30) {
          recs.push({
            id: '3',
            type: 'warning',
            icon: '📉',
            title: 'Низкое качество ссылок',
            description: `Средний DR конкурентов: ${avgDR}. Рекомендуем фокусироваться на более авторитетных сайтах`,
          })
        } else if (avgDR >= 50) {
          recs.push({
            id: '3',
            type: 'success',
            icon: '📈',
            title: 'Отличное качество ссылок',
            description: `Средний DR конкурентов: ${avgDR}. Конкуренты используют качественные источники`,
          })
        }
      }

      // 3. Анализ позиций
      if (rankHistory && rankHistory.length >= 2) {
        const current = rankHistory[0].position
        const previous = rankHistory[1].position
        const change = previous - current

        if (change > 0) {
          recs.push({
            id: '4',
            type: 'success',
            icon: '🚀',
            title: `Позиция выросла на ${change} пункт${change > 1 ? 'а' : ''}`,
            description: `Текущая позиция: #${current}. Продолжайте работу над ссылками!`,
          })
        } else if (change < 0) {
          recs.push({
            id: '4',
            type: 'warning',
            icon: '📉',
            title: `Позиция упала на ${Math.abs(change)} пункт${Math.abs(change) > 1 ? 'а' : ''}`,
            description: `Текущая позиция: #${current}. Рекомендуем проанализировать изменения у конкурентов`,
            action: 'Проверить конкурентов',
            actionUrl: '#competitors'
          })
        }
      }

      // 4. Новые возможности
      if (backlinks && backlinks.length > 100) {
        const grouped = new Map()
        backlinks.forEach((b: any) => {
          const domain = new URL(b.source_url).hostname
          grouped.set(domain, (grouped.get(domain) || 0) + 1)
        })

        const multiLinks = Array.from(grouped.entries()).filter(([_, count]) => (count as number) >= 2)
        
        if (multiLinks.length > 0) {
          recs.push({
            id: '5',
            type: 'info',
            icon: '💡',
            title: `${multiLinks.length} сайтов ссылаются на несколько конкурентов`,
            description: 'Эти домены — приоритетные цели для аутрича кампании',
            action: 'Посмотреть список',
            actionUrl: '#gap'
          })
        }
      }

      setRecommendations(recs)
    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-brand-dark border border-white/10 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-3 bg-white/5 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>🤖</span> AI Recommendations
        </h2>
        <button
          onClick={generateRecommendations}
          className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition"
        >
          🔄 Обновить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`p-4 rounded-lg border ${
              rec.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
              rec.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-blue-500/10 border-blue-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{rec.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold mb-1">{rec.title}</h3>
                <p className="text-sm text-brand-text-gray mb-3">{rec.description}</p>
                {rec.action && rec.actionUrl && (
                  <a
                    href={rec.actionUrl}
                    className="inline-block text-sm font-medium text-primary hover:underline"
                  >
                    {rec.action} →
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
