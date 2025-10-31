'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { projectsAPI, competitorsAPI, backlinksAPI } from '@/lib/supabase'
import { Search, ArrowLeft, FileDown, Sparkles, TrendingUp, DollarSign, Calendar, Target, ExternalLink, Save, Check, AlertCircle } from 'lucide-react'

interface Project {
  id: string
  name: string
  keyword: string
  domain: string
  status: string
  region?: string
  created_at: string
}

interface Competitor {
  id: string
  domain: string
  position: number
  dr?: number
  backlinks_count?: number
  traffic?: number
  is_selected: boolean
}

interface Backlink {
  id: string
  source_domain: string
  source_url: string
  target_url: string
  anchor_text: string
  dr: number
  link_type: string
  competitor_id: string
  competitor_count?: number
  competitors?: string[]
  ai_score?: number
  is_selected: boolean
}

interface GapOpportunity {
  source_domain: string
  competitor_count: number
  avg_dr: number
  total_links: number
  competitors: string[]
}

interface MarketplaceOffer {
  domain: string
  marketplace: string
  price: number
  currency: string
  dr: number
  link_type: string
  url?: string
}

interface AIBudgetItem {
  domain: string
  type: string
  priority: string
  cost: number
}

interface AITimelineItem {
  month: number
  action: string
  expected_links: number
}

interface AIExpectedResults {
  position_improvement: string
  estimated_traffic: string
}

interface AIPlan {
  summary: string
  budget_breakdown: AIBudgetItem[]
  timeline: AITimelineItem[]
  expected_results: AIExpectedResults
}

interface SaveAIPlanButtonProps {
  projectId: string
  aiPlan: AIPlan | null
  budget: number
  disabled?: boolean
}

function SaveAIPlanButton({ projectId, aiPlan, budget, disabled }: SaveAIPlanButtonProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!aiPlan) return

    try {
      setSaving(true)
      setError('')

      const response = await fetch('/api/ai-plans/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          summary: aiPlan.summary,
          budget_breakdown: aiPlan.budget_breakdown,
          timeline: aiPlan.timeline,
          expected_results: aiPlan.expected_results,
          budget,
          provider: 'OpenRouter'
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to save plan')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      console.error('Save error:', err)
      setError(err.message || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleSave}
        disabled={disabled || saving || !aiPlan}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Сохранение...
          </>
        ) : saved ? (
          <>
            <Check className="w-4 h-4" />
            Сохранено!
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Сохранить план
          </>
        )}
      </button>
      {error && (
        <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Project | null>(null)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [backlinks, setBacklinks] = useState<Backlink[]>([])
  const [gapOpportunities, setGapOpportunities] = useState<GapOpportunity[]>([])
  const [marketplaceOffers, setMarketplaceOffers] = useState<MarketplaceOffer[]>([])
  const [aiPlan, setAIPlan] = useState<AIPlan | null>(null)
  
  const [activeTab, setActiveTab] = useState<'competitors' | 'backlinks' | 'gap-analysis' | 'ai-plan'>('competitors')
  const [searching, setSearching] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [runningGapAnalysis, setRunningGapAnalysis] = useState(false)
  const [creatingPlan, setCreatingPlan] = useState(false)
  const [budget, setBudget] = useState(50000)

  useEffect(() => {
    loadProjectData()
  }, [projectId])

  const loadProjectData = async () => {
    try {
      setLoading(true)
      
      const projectData = await projectsAPI.getById(projectId)
      setProject(projectData)

      const competitorsData = await competitorsAPI.getByProject(projectId)
      setCompetitors(competitorsData)

      const backlinksData = await backlinksAPI.getByProject(projectId)
      setBacklinks(backlinksData)

    } catch (error) {
      console.error('Error loading project data:', error)
    } finally {
      setLoading(false)
    }
  }

  const findCompetitors = async () => {
    if (!project) return

    setSearching(true)
    try {
      const response = await fetch('/api/competitors/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: project.keyword,
          region: project.region || 'ru',
          project_id: project.id
        })
      })

      const result = await response.json()

      if (result.success) {
        await loadProjectData()
      } else {
        alert(`Ошибка: ${result.error}`)
      }
    } catch (error) {
      console.error('Error finding competitors:', error)
      alert('Ошибка при поиске конкурентов')
    } finally {
      setSearching(false)
    }
  }

  // ⚡⚡⚡ ИСПРАВЛЕННАЯ ФУНКЦИЯ ⚡⚡⚡
  const analyzeBacklinks = async () => {
    const selected = competitors.filter(c => c.is_selected)
    if (selected.length === 0) {
      alert('Выберите хотя бы одного конкурента!')
      return
    }
    
    setAnalyzing(true)
    try {
      const competitorIds = selected.map(c => c.id)
      const competitorUrls = selected.map(c => c.domain)  // ⚡ ДОБАВЛЕНО!
      
      console.log('🔍 Analyzing backlinks for competitors:', selected)
      console.log('📊 Competitor URLs:', competitorUrls)
      
      const response = await fetch('/api/backlinks/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project?.id,
          competitor_ids: competitorIds,
          competitor_urls: competitorUrls  // ⚡ ДОБАВЛЕНО!
        })
      })
      
      const result = await response.json()
      console.log('✅ API Response:', result)
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze backlinks')
      }
      
      if (result.success) {
        alert(`✅ Найдено ${result.count} бэклинков!`)
        await loadProjectData()
        setActiveTab('backlinks')
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error: any) {
      console.error('❌ Error analyzing backlinks:', error)
      alert(`Ошибка: ${error.message}`)
    } finally {
      setAnalyzing(false)
    }
  }

  const toggleCompetitor = async (competitorId: string) => {
    try {
      const competitor = competitors.find(c => c.id === competitorId)
      if (!competitor) return

      await competitorsAPI.update(competitorId, {
        is_selected: !competitor.is_selected
      })

      setCompetitors(competitors.map(c =>
        c.id === competitorId ? { ...c, is_selected: !c.is_selected } : c
      ))
    } catch (error) {
      console.error('Error toggling competitor:', error)
    }
  }

  const toggleBacklink = async (backlinkId: string) => {
    try {
      const backlink = backlinks.find(b => b.id === backlinkId)
      if (!backlink) return

      await backlinksAPI.update(backlinkId, {
        is_selected: !backlink.is_selected
      })

      setBacklinks(backlinks.map(b =>
        b.id === backlinkId ? { ...b, is_selected: !b.is_selected } : b
      ))
    } catch (error) {
      console.error('Error toggling backlink:', error)
    }
  }
  const runGapAnalysis = async () => {
    const selected = backlinks.filter(b => b.is_selected)
    if (selected.length === 0) {
      alert('Выберите бэклинки для Gap Analysis!')
      return
    }

    setRunningGapAnalysis(true)
    try {
      const response = await fetch('/api/gap-analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project?.id,
          backlink_ids: selected.map(b => b.id)
        })
      })

      const result = await response.json()

      if (result.success) {
        setGapOpportunities(result.opportunities)
        setMarketplaceOffers(result.marketplace_offers)
        setActiveTab('gap-analysis')
      } else {
        alert(`Ошибка: ${result.error}`)
      }
    } catch (error) {
      console.error('Error running gap analysis:', error)
      alert('Ошибка при выполнении Gap Analysis')
    } finally {
      setRunningGapAnalysis(false)
    }
  }

  const createAIPlan = async () => {
    if (gapOpportunities.length === 0) {
      alert('Сначала выполните Gap Analysis!')
      return
    }

    setCreatingPlan(true)
    try {
      const response = await fetch('/api/ai-plans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project?.id,
          opportunities: gapOpportunities,
          marketplace_offers: marketplaceOffers,
          budget,
          keyword: project?.keyword
        })
      })

      const result = await response.json()

      if (result.success) {
        setAIPlan(result.plan)
        setActiveTab('ai-plan')
      } else {
        alert(`Ошибка: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating AI plan:', error)
      alert('Ошибка при создании AI плана')
    } finally {
      setCreatingPlan(false)
    }
  }

  const exportResults = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: 'GET'
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `refspy-${project?.keyword}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Ошибка при экспорте')
    }
  }

  const selectedCompetitors = competitors.filter(c => c.is_selected)
  const selectedBacklinks = backlinks.filter(b => b.is_selected)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка данных проекта...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Проект не найден</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
          >
            Вернуться к проектам
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад к проектам
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Ключевое слово: <span className="text-orange-500">{project.keyword}</span>
              </h1>
              {project.domain && (
                <p className="text-gray-400">
                  Домен: <span className="text-white">{project.domain}</span>
                </p>
              )}
            </div>

            <button
              onClick={exportResults}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <FileDown className="w-5 h-5" />
              Экспорт PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('competitors')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'competitors'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Конкуренты ({competitors.length})
            </div>
          </button>

          <button
            onClick={() => setActiveTab('backlinks')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'backlinks'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Бэклинки ({backlinks.length})
            </div>
          </button>

          <button
            onClick={() => setActiveTab('gap-analysis')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'gap-analysis'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Gap Analysis ({gapOpportunities.length})
            </div>
          </button>

          <button
            onClick={() => setActiveTab('ai-plan')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'ai-plan'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI План
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'competitors' && (
          <div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Поиск конкурентов</h2>
                  <p className="text-gray-400">
                    Выбрано: {selectedCompetitors.length} из {competitors.length}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={findCompetitors}
                    disabled={searching}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                  >
                    {searching ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        Поиск...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Найти конкурентов
                      </>
                    )}
                  </button>

                  <button
                    onClick={analyzeBacklinks}
                    disabled={analyzing || selectedCompetitors.length === 0}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                  >
                    {analyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        Анализ...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-5 h-5" />
                        Анализировать бэклинки
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {competitors.length === 0 ? (
              <div className="bg-gray-800/30 rounded-lg p-12 text-center">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Конкуренты не найдены.</p>
                <p className="text-gray-500">Нажмите "Найти конкурентов" чтобы начать анализ.</p>
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left">✓</th>
                      <th className="px-6 py-4 text-left">🎯 Домен</th>
                      <th className="px-6 py-4 text-left">📊 Позиция</th>
                      <th className="px-6 py-4 text-left">⚡ DR</th>
                      <th className="px-6 py-4 text-left">🔗 Бэклинки</th>
                      <th className="px-6 py-4 text-left">📈 Трафик</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitors.map((comp) => (
                      <tr key={comp.id} className="border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={comp.is_selected}
                            onChange={() => toggleCompetitor(comp.id)}
                            className="w-5 h-5 cursor-pointer accent-orange-500"
                          />
                        </td>
                        <td className="px-6 py-4 font-medium">{comp.domain}</td>
                        <td className="px-6 py-4">#{comp.position}</td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${
                            (comp.dr || 0) >= 70 ? 'text-green-500' :
                            (comp.dr || 0) >= 40 ? 'text-yellow-500' :
                            'text-red-500'
                          }`}>
                            {comp.dr || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">{(comp.backlinks_count || 0).toLocaleString()}</td>
                        <td className="px-6 py-4">{(comp.traffic || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {activeTab === 'backlinks' && (
          <div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Бэклинки конкурентов</h2>
                  <p className="text-gray-400">
                    Выбрано: {selectedBacklinks.length} из {backlinks.length}
                  </p>
                </div>

                <button
                  onClick={runGapAnalysis}
                  disabled={runningGapAnalysis || selectedBacklinks.length === 0}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                >
                  {runningGapAnalysis ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Анализ...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Gap Analysis
                    </>
                  )}
                </button>
              </div>
            </div>

            {backlinks.length === 0 ? (
              <div className="bg-gray-800/30 rounded-lg p-12 text-center">
                <ExternalLink className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Нет бэклинков.</p>
                <p className="text-gray-500">Нажмите "Анализировать бэклинки" на вкладке конкурентов.</p>
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left">✓</th>
                      <th className="px-6 py-4 text-left">🌐 Домен</th>
                      <th className="px-6 py-4 text-left">🔗 Анкор</th>
                      <th className="px-6 py-4 text-left">⚡ DR</th>
                      <th className="px-6 py-4 text-left">📊 Тип</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backlinks.map((link) => (
                      <tr key={link.id} className="border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={link.is_selected}
                            onChange={() => toggleBacklink(link.id)}
                            className="w-5 h-5 cursor-pointer accent-orange-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={link.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-400 hover:text-orange-300 hover:underline flex items-center gap-2"
                          >
                            {link.source_domain}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{link.anchor_text}</td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${
                            link.dr >= 70 ? 'text-green-500' :
                            link.dr >= 40 ? 'text-yellow-500' :
                            'text-red-500'
                          }`}>
                            {link.dr}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            link.link_type === 'dofollow' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {link.link_type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gap-analysis' && (
          <div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Gap Analysis</h2>
                  <p className="text-gray-400">
                    Найдено возможностей: {gapOpportunities.length}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={createAIPlan}
                    disabled={creatingPlan || gapOpportunities.length === 0}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg transition-all flex items-center gap-2"
                  >
                    {creatingPlan ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        Создание плана...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Создать AI план
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {gapOpportunities.length === 0 ? (
              <div className="bg-gray-800/30 rounded-lg p-12 text-center">
                <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Gap Analysis не выполнен.</p>
                <p className="text-gray-500">Выберите бэклинки на вкладке "Бэклинки" и нажмите "Gap Analysis".</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Gap Opportunities */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    Топ возможности
                  </h3>
                  <div className="space-y-3">
                    {gapOpportunities.slice(0, 10).map((opp, idx) => (
                      <div key={idx} className="bg-gray-900/50 rounded-lg p-4 hover:bg-gray-900/70 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white mb-1">{opp.source_domain}</p>
                            <p className="text-sm text-gray-400">
                              У {opp.competitor_count} конкурентов • Средний DR: {opp.avg_dr} • {opp.total_links} ссылок
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                            Приоритет #{idx + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Marketplace Offers */}
                {marketplaceOffers.length > 0 && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      Предложения на маркетплейсах
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {marketplaceOffers.slice(0, 9).map((offer, idx) => (
                        <div key={idx} className="bg-gray-900/50 rounded-lg p-4 hover:bg-gray-900/70 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium text-white">{offer.domain}</p>
                            <span className={`px-2 py-1 rounded text-xs ${
                              offer.dr >= 70 ? 'bg-green-500/20 text-green-400' :
                              offer.dr >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              DR {offer.dr}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{offer.marketplace}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-orange-400">
                              {offer.price.toLocaleString()} {offer.currency}
                            </span>
                            <span className="text-xs text-gray-500">{offer.link_type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai-plan' && (
          <div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    AI План продвижения
                  </h2>
                  <div className="flex items-center gap-4 mt-3">
                    <label className="text-gray-400">
                      Бюджет:
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="ml-2 px-3 py-1 bg-gray-900/50 border border-gray-700 rounded-lg text-white w-32"
                        min="10000"
                        step="5000"
                      />
                      <span className="ml-2">₽</span>
                    </label>
                  </div>
                </div>

                <SaveAIPlanButton
                  projectId={projectId}
                  aiPlan={aiPlan}
                  budget={budget}
                  disabled={!aiPlan}
                />
              </div>
            </div>

            {!aiPlan ? (
              <div className="bg-gray-800/30 rounded-lg p-12 text-center">
                <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">AI план не создан.</p>
                <p className="text-gray-500">Выполните Gap Analysis и нажмите "Создать AI план".</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold mb-3 text-purple-300">📋 Резюме</h3>
                  <p className="text-gray-300 leading-relaxed">{aiPlan.summary}</p>
                </div>

                {/* Budget Breakdown */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Распределение бюджета
                  </h3>
                  <div className="space-y-3">
                    {aiPlan.budget_breakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{item.domain}</p>
                          <p className="text-sm text-gray-400">{item.type} • {item.priority}</p>
                        </div>
                        <span className="text-lg font-bold text-green-400">{item.cost.toLocaleString()} ₽</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Временной план
                  </h3>
                  <div className="space-y-3">
                    {aiPlan.timeline.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg">
                        <div className="w-20 flex-shrink-0">
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                            Месяц {item.month}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white mb-1">{item.action}</p>
                          <p className="text-sm text-gray-400">Ожидается: {item.expected_links} ссылок</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected Results */}
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm rounded-lg p-6 border border-green-500/20">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-300">
                    <TrendingUp className="w-5 h-5" />
                    Ожидаемые результаты
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-900/30 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Улучшение позиций</p>
                      <p className="text-xl font-bold text-green-400">{aiPlan.expected_results.position_improvement}</p>
                    </div>
                    <div className="p-4 bg-gray-900/30 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Прогноз трафика</p>
                      <p className="text-xl font-bold text-green-400">{aiPlan.expected_results.estimated_traffic}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
