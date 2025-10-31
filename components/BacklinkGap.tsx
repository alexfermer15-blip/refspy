'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

interface BacklinkGapProps {
  projectId: string
  yourDomain: string
}

interface GapOpportunity {
  source_domain: string
  competitor_count: number
  avg_dr: number
  total_links: number
  competitors: string[]
}

export function BacklinkGap({ projectId, yourDomain }: BacklinkGapProps) {
  const [opportunities, setOpportunities] = useState<GapOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    minCompetitors: 2,
    minDR: 30
  })

  useEffect(() => {
    loadGapAnalysis()
  }, [projectId, filter])

  const loadGapAnalysis = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // 1. Получаем все бэклинки конкурентов
      const { data: allBacklinks, error } = await supabase
        .from('backlinks')
        .select(`
          id,
          source_url,
          dr,
          competitors!inner(domain)
        `)
        .eq('project_id', projectId)
        .gte('dr', filter.minDR)

      if (error) throw error

      // 2. Группируем по source_domain
      const grouped = new Map<string, {
        competitors: Set<string>
        drs: number[]
        count: number
      }>()

      allBacklinks?.forEach((link: any) => {
        const sourceDomain = new URL(link.source_url).hostname
        const competitorDomain = link.competitors.domain

        // Пропускаем, если это ваш домен
        if (sourceDomain.includes(yourDomain)) return

        if (!grouped.has(sourceDomain)) {
          grouped.set(sourceDomain, {
            competitors: new Set(),
            drs: [],
            count: 0
          })
        }

        const group = grouped.get(sourceDomain)!
        group.competitors.add(competitorDomain)
        group.drs.push(link.dr)
        group.count++
      })

      // 3. Фильтруем и форматируем
      const results: GapOpportunity[] = []

      grouped.forEach((value, domain) => {
        const competitorCount = value.competitors.size

        if (competitorCount >= filter.minCompetitors) {
          results.push({
            source_domain: domain,
            competitor_count: competitorCount,
            avg_dr: Math.round(value.drs.reduce((a, b) => a + b, 0) / value.drs.length),
            total_links: value.count,
            competitors: Array.from(value.competitors)
          })
        }
      })

      // 4. Сортируем по приоритету
      results.sort((a, b) => {
        const scoreA = a.competitor_count * a.avg_dr
        const scoreB = b.competitor_count * b.avg_dr
        return scoreB - scoreA
      })

      setOpportunities(results)
    } catch (error) {
      console.error('Error loading gap analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    const csv = [
      ['Source Domain', 'Competitors Linking', 'Avg DR', 'Total Links', 'Competitors'],
      ...opportunities.map(o => [
        o.source_domain,
        o.competitor_count,
        o.avg_dr,
        o.total_links,
        o.competitors.join('; ')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backlink-gap.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🎯 Backlink Gap Analysis</h2>
            <p className="text-brand-text-gray">
              Сайты, которые ссылаются на {opportunities.length > 0 && opportunities[0].competitor_count} конкурентов, но не на вас
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary">{opportunities.length}</div>
            <div className="text-sm text-brand-text-gray">возможностей</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-brand-dark border border-white/10 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-brand-text-gray">
              Минимум конкурентов
            </label>
            <select
              value={filter.minCompetitors}
              onChange={(e) => setFilter({...filter, minCompetitors: Number(e.target.value)})}
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white"
            >
              <option value="1">1+ конкурентов</option>
              <option value="2">2+ конкурентов</option>
              <option value="3">3+ конкурентов</option>
              <option value="5">5+ конкурентов</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-brand-text-gray">
              Минимальный DR
            </label>
            <select
              value={filter.minDR}
              onChange={(e) => setFilter({...filter, minDR: Number(e.target.value)})}
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white"
            >
              <option value="0">Любой DR</option>
              <option value="30">DR &gt; 30</option>
              <option value="50">DR &gt; 50</option>
              <option value="70">DR &gt; 70</option>
            </select>
          </div>

          <button
            onClick={exportCSV}
            disabled={opportunities.length === 0}
            className="mt-6 px-6 py-2 bg-primary hover:bg-primary-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
          >
            📥 Экспорт CSV
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-brand-dark border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-brand-text-gray">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-brand-text-gray">Source Domain</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-brand-text-gray">Competitors</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-brand-text-gray">Avg DR</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-brand-text-gray">Links</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-brand-text-gray">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-brand-text-gray">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Анализируем...
                    </div>
                  </td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-brand-text-gray">
                    Возможностей не найдено. Попробуйте изменить фильтры.
                  </td>
                </tr>
              ) : (
                opportunities.map((opp, index) => {
                  const priority = opp.competitor_count >= 3 && opp.avg_dr >= 50 ? 'high' :
                                   opp.competitor_count >= 2 && opp.avg_dr >= 30 ? 'medium' : 'low'
                  
                  return (
                    <tr key={opp.source_domain} className="hover:bg-white/5 transition">
                      <td className="px-4 py-3 text-center text-brand-text-gray">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://${opp.source_domain}`}
                          target="_blank"
                          rel="noopener"
                          className="text-primary hover:underline font-medium"
                        >
                          {opp.source_domain}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-500/20 text-purple-400">
                          {opp.competitor_count} 🎯
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                          opp.avg_dr >= 70 ? 'bg-green-500/20 text-green-400' :
                          opp.avg_dr >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {opp.avg_dr}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-brand-text-gray">
                        {opp.total_links}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                          priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {priority === 'high' ? '🔥 HIGH' : priority === 'medium' ? '⚡ MEDIUM' : '💡 LOW'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights */}
      {opportunities.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 to-primary/10 border border-purple-500/30 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🤖</span> AI Insights
          </h3>
          <div className="space-y-2 text-sm text-brand-text-gray">
            <p>
              ✅ Найдено <strong className="text-white">{opportunities.filter(o => o.avg_dr >= 50).length}</strong> высококачественных сайтов (DR &gt; 50)
            </p>
            <p>
              🎯 <strong className="text-white">{opportunities.slice(0, 3).map(o => o.source_domain).join(', ')}</strong> — лучшие возможности для аутрича
            </p>
            <p>
              💡 Рекомендация: начните с TOP-10 сайтов с наибольшим количеством ссылающихся конкурентов
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
