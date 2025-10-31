'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, Calendar, DollarSign, Target, TrendingUp, ExternalLink } from 'lucide-react'

interface AIPlan {
  id: string
  project_id: string
  summary: string
  budget_breakdown: any[]
  timeline: any[]
  expected_results: any
  budget: number
  provider: string
  created_at: string
  project: {
    name: string
    keyword: string
    domain: string
  }
}

export default function AIPlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<AIPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/ai-plans')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch plans')
      }

      setPlans(data.data || [])
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Загрузка AI планов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
            <Brain className="w-10 h-10 text-orange-500" />
            Мои AI Планы
          </h1>
          <p className="text-slate-400">
            Все сохраненные планы линкбилдинга с рекомендациями AI
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <div className="bg-slate-900/50 rounded-lg p-12 text-center border border-slate-800">
            <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Нет сохраненных планов</h3>
            <p className="text-slate-400 mb-6">
              Создайте AI план на странице проекта и сохраните его
            </p>
            <button
              onClick={() => router.push('/dashboard/projects')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Перейти к проектам
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-slate-900/50 rounded-lg p-6 border border-slate-800 hover:border-orange-500/50 transition-colors cursor-pointer group"
                onClick={() => router.push(`/dashboard/projects/${plan.project_id}`)}
              >
                {/* Plan Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                      {plan.project.name}
                    </h3>
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      {plan.project.keyword}
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-600 group-hover:text-orange-400 transition-colors" />
                </div>

                {/* Summary */}
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                  {plan.summary}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-orange-400 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-xs font-medium">Бюджет</span>
                    </div>
                    <p className="text-white font-bold">${plan.budget}</p>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                      <Target className="w-4 h-4" />
                      <span className="text-xs font-medium">Доменов</span>
                    </div>
                    <p className="text-white font-bold">{plan.budget_breakdown.length}</p>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">Месяцев</span>
                    </div>
                    <p className="text-white font-bold">{plan.timeline.length}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(plan.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    {plan.provider}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
