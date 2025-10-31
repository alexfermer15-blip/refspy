'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Minus, Search, Plus, X, Download,
  Filter, Calendar, MapPin, Monitor, Smartphone, Tablet, Settings
} from 'lucide-react'

interface KeywordData {
  id: string
  keyword: string
  position: number | null
  previousPosition: number | null
  url: string | null
  visibility: number
  group: string
  change: number
  history: Array<{
    date: string
    position: number
  }>
}

interface GroupStats {
  top3: number
  top10: number
  top30: number
  top50: number
  top100: number
  out: number
}

export function RankTrackerDashboard({ projectId, domain }: { projectId: string, domain: string }) {
  const [keywords, setKeywords] = useState<KeywordData[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('30days')
  const [selectedEngine, setSelectedEngine] = useState('google')
  const [selectedDevice, setSelectedDevice] = useState('desktop')
  const [location, setLocation] = useState('russia')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadKeywords()
  }, [projectId])

  const loadKeywords = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('keywords')
        .select(`
          *,
          keyword_rankings (
            position,
            previous_position,
            url,
            visibility,
            checked_at
          )
        `)
        .eq('project_id', projectId)
        .eq('search_engine', selectedEngine)
        .eq('device', selectedDevice)
        .order('created_at', { ascending: false })

      if (error) throw error

      const processed = data?.map(kw => {
        const rankings = (kw.keyword_rankings || [])
          .sort((a: any, b: any) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime())
        
        const latest = rankings[0]
        const previous = rankings[1]
        const position = latest?.position || null
        const prevPosition = previous?.position || latest?.previous_position || null

        return {
          id: kw.id,
          keyword: kw.keyword,
          position,
          previousPosition: prevPosition,
          url: latest?.url || null,
          visibility: latest?.visibility || 0,
          group: kw.group_name || 'Без группы',
          change: position && prevPosition ? prevPosition - position : 0,
          history: rankings.slice(0, 30).map((r: any) => ({
            date: new Date(r.checked_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
            position: r.position
          })).reverse()
        }
      }) || []

      setKeywords(processed)
    } catch (error) {
      console.error('Error loading keywords:', error)
    } finally {
      setLoading(false)
    }
  }

  // Расчет статистики по группам
  const groupStats: GroupStats = useMemo(() => {
    return keywords.reduce((acc, kw) => {
      if (kw.position === null) {
        acc.out++
      } else if (kw.position <= 3) {
        acc.top3++
      } else if (kw.position <= 10) {
        acc.top10++
      } else if (kw.position <= 30) {
        acc.top30++
      } else if (kw.position <= 50) {
        acc.top50++
      } else if (kw.position <= 100) {
        acc.top100++
      } else {
        acc.out++
      }
      return acc
    }, { top3: 0, top10: 0, top30: 0, top50: 0, top100: 0, out: 0 })
  }, [keywords])

  // Средняя и медианная позиция
  const avgPosition = useMemo(() => {
    const positions = keywords.filter(k => k.position !== null).map(k => k.position!)
    if (positions.length === 0) return 0
    return Math.round(positions.reduce((a, b) => a + b, 0) / positions.length)
  }, [keywords])

  const medianPosition = useMemo(() => {
    const positions = keywords.filter(k => k.position !== null).map(k => k.position!).sort((a, b) => a - b)
    if (positions.length === 0) return 0
    const mid = Math.floor(positions.length / 2)
    return positions.length % 2 !== 0 ? positions[mid] : Math.round((positions[mid - 1] + positions[mid]) / 2)
  }, [keywords])

  // Общая видимость
  const totalVisibility = useMemo(() => {
    const total = keywords.reduce((sum, k) => sum + k.visibility, 0)
    return Math.round(total / keywords.length) || 0
  }, [keywords])

  // Данные для графика групп
  const groupChartData = useMemo(() => {
    const last30Days = [...Array(30)].map((_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
    })

    return last30Days.map(date => {
      // Здесь нужно получить исторические данные из БД
      // Упрощенный пример:
      return {
        date,
        'top3': Math.floor(Math.random() * groupStats.top3),
        'top10': Math.floor(Math.random() * groupStats.top10),
        'top30': Math.floor(Math.random() * groupStats.top30)
      }
    })
  }, [groupStats])

  const checkAllPositions = async () => {
    setChecking(true)
    try {
      for (const kw of keywords) {
        await fetch('/api/rank-tracker/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keywordId: kw.id,
            keyword: kw.keyword,
            domain,
            location,
            device: selectedDevice,
            searchEngine: selectedEngine
          })
        })
        // Задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      await loadKeywords()
    } catch (error) {
      console.error('Check error:', error)
    } finally {
      setChecking(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Запрос', 'Позиция', 'Изменение', 'URL', 'Видимость', 'Группа']
    const rows = keywords.map(k => [
      k.keyword,
      k.position || '—',
      k.change > 0 ? `+${k.change}` : k.change,
      k.url || '—',
      `${k.visibility}%`,
      k.group
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `positions-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="text-green-400 text-center py-12">⏳ Загрузка данных...</div>
  }

  return (
    <div className="space-y-6">
      {/* Верхняя панель управления */}
      <div className="bg-slate-900 border-2 border-green-500 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <select
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className="bg-black border border-green-500 text-green-400 px-3 py-2 rounded"
            >
              <option value="yandex">🟢 Yandex</option>
              <option value="google">🔴 Google</option>
              <option value="bing">🔵 Bing</option>
            </select>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-black border border-green-500 text-green-400 px-3 py-2 rounded flex items-center gap-2"
            >
              <option value="russia">📍 Россия</option>
              <option value="moscow">📍 Москва</option>
              <option value="saint-petersburg">📍 Санкт-Петербург</option>
              <option value="minsk">📍 Минск</option>
            </select>

            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="bg-black border border-green-500 text-green-400 px-3 py-2 rounded"
            >
              <option value="desktop">💻 Desktop</option>
              <option value="mobile">📱 Mobile</option>
              <option value="tablet">📲 Tablet</option>
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-black border border-green-500 text-green-400 px-3 py-2 rounded"
            >
              <option value="7days">📅 7 дней</option>
              <option value="30days">📅 30 дней</option>
              <option value="90days">📅 90 дней</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={checkAllPositions}
              disabled={checking}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-4 py-2 rounded flex items-center gap-2 font-bold transition"
            >
              <Search size={18} />
              {checking ? 'Проверяю...' : `Проверить (${keywords.length})`}
            </button>
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded flex items-center gap-2 font-bold transition"
            >
              <Download size={18} />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Статистика по группам */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-slate-900 border-2 border-green-500 rounded-lg p-4">
          <div className="text-5xl font-bold text-green-500 mb-2">{groupStats.top3}</div>
          <div className="text-green-400 text-sm">1-3</div>
          <div className="text-gray-500 text-xs mt-1">
            {keywords.length > 0 ? Math.round((groupStats.top3 / keywords.length) * 100) : 0}%
          </div>
        </div>

        <div className="bg-slate-900 border-2 border-green-400 rounded-lg p-4">
          <div className="text-5xl font-bold text-green-400 mb-2">{groupStats.top10}</div>
          <div className="text-green-400 text-sm">1-10</div>
          <div className="text-gray-500 text-xs mt-1">
            {keywords.length > 0 ? Math.round((groupStats.top10 / keywords.length) * 100) : 0}%
          </div>
        </div>

        <div className="bg-slate-900 border-2 border-yellow-500 rounded-lg p-4">
          <div className="text-5xl font-bold text-yellow-500 mb-2">{groupStats.top30}</div>
          <div className="text-yellow-400 text-sm">11-30</div>
          <div className="text-gray-500 text-xs mt-1">
            {keywords.length > 0 ? Math.round((groupStats.top30 / keywords.length) * 100) : 0}%
          </div>
        </div>

        <div className="bg-slate-900 border-2 border-orange-500 rounded-lg p-4">
          <div className="text-5xl font-bold text-orange-500 mb-2">{groupStats.top50}</div>
          <div className="text-orange-400 text-sm">31-50</div>
          <div className="text-gray-500 text-xs mt-1">
            {keywords.length > 0 ? Math.round((groupStats.top50 / keywords.length) * 100) : 0}%
          </div>
        </div>

        <div className="bg-slate-900 border-2 border-red-500 rounded-lg p-4">
          <div className="text-5xl font-bold text-red-500 mb-2">{groupStats.top100}</div>
          <div className="text-red-400 text-sm">51-100</div>
          <div className="text-gray-500 text-xs mt-1">
            {keywords.length > 0 ? Math.round((groupStats.top100 / keywords.length) * 100) : 0}%
          </div>
        </div>

        <div className="bg-slate-900 border-2 border-gray-500 rounded-lg p-4">
          <div className="text-5xl font-bold text-gray-400 mb-2">{groupStats.out}</div>
          <div className="text-gray-400 text-sm">101+</div>
          <div className="text-gray-500 text-xs mt-1">
            {keywords.length > 0 ? Math.round((groupStats.out / keywords.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Дополнительная статистика */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 border-2 border-green-500 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Видимость</div>
          <div className="text-3xl font-bold text-green-400">{totalVisibility}%</div>
        </div>

        <div className="bg-slate-900 border-2 border-green-500 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Средняя</div>
          <div className="text-3xl font-bold text-white">{avgPosition}</div>
        </div>

        <div className="bg-slate-900 border-2 border-green-500 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Медианная</div>
          <div className="text-3xl font-bold text-white">{medianPosition}</div>
        </div>

        <div className="bg-slate-900 border-2 border-green-500 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Запросов</div>
          <div className="text-3xl font-bold text-white">{keywords.length}</div>
        </div>
      </div>

      {/* График динамики */}
      <div className="bg-slate-900 border-2 border-green-500 rounded-lg p-6">
        <h3 className="text-xl font-bold text-green-400 mb-4">📊 Динамика позиций</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={groupChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#10b981" />
            <YAxis stroke="#10b981" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981' }}
              labelStyle={{ color: '#10b981' }}
            />
            <Legend />
            <Area type="monotone" dataKey="top3" stackId="1" stroke="#10b981" fill="#10b981" name="TOP-3" />
            <Area type="monotone" dataKey="top10" stackId="1" stroke="#22c55e" fill="#22c55e" name="TOP-10" />
            <Area type="monotone" dataKey="top30" stackId="1" stroke="#eab308" fill="#eab308" name="TOP-30" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Таблица запросов */}
      <div className="bg-slate-900 border-2 border-green-500 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-black border-b-2 border-green-500">
            <tr>
              <th className="px-6 py-4 text-left text-green-400">🔑 Запрос</th>
              <th className="px-6 py-4 text-center text-green-400">📊 Позиция</th>
              <th className="px-6 py-4 text-center text-green-400">📈 Изменение</th>
              <th className="px-6 py-4 text-left text-green-400">🔗 URL</th>
              <th className="px-6 py-4 text-center text-green-400">👁️ Видимость</th>
              <th className="px-6 py-4 text-center text-green-400">📂 Группа</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((kw) => (
              <tr key={kw.id} className="border-b border-green-500/30 hover:bg-green-500/5">
                <td className="px-6 py-4 text-white font-medium">{kw.keyword}</td>
                <td className="px-6 py-4 text-center">
                  {kw.position ? (
                    <span className={`text-2xl font-bold ${
                      kw.position <= 3 ? 'text-green-500' :
                      kw.position <= 10 ? 'text-green-400' :
                      kw.position <= 30 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      #{kw.position}
                    </span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {kw.change !== 0 && (
                    <span className={`flex items-center justify-center gap-1 ${
                      kw.change > 0 ? 'text-green-500' :
                      kw.change < 0 ? 'text-red-500' :
                      'text-gray-500'
                    }`}>
                      {kw.change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {Math.abs(kw.change)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {kw.url ? (
                    <a href={kw.url} target="_blank" rel="noopener noreferrer" 
                       className="text-green-400 hover:text-green-300 underline text-sm truncate block max-w-xs">
                      {kw.url}
                    </a>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center text-white">{kw.visibility}%</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
                    {kw.group}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
