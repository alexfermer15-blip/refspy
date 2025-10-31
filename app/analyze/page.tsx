// app/analyze/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Header } from '@/components/Header'
import { useLanguage } from '@/lib/language-context'
import { useProjects } from '@/lib/hooks/useProjects'
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import type { CreateProjectData } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { siteConfig } from '@/lib/config/site'

export default function AnalyzePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { createProject } = useProjects()

  const [keyword, setKeyword] = useState('')
  const [domain, setDomain] = useState('')
  const [region, setRegion] = useState('Russia')
  const [depth, setDepth] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const content = {
    EN: {
      title: 'Start New Analysis',
      subtitle: 'Analyze your competitors and discover link opportunities',
      keyword: 'Target Keyword',
      keywordPlaceholder: 'Enter keyword to analyze...',
      keywordHelp: 'The keyword you want to rank for',
      domain: 'Your Domain (optional)',
      domainPlaceholder: 'example.com',
      domainHelp: 'Your website domain to compare against competitors',
      region: 'Search Region',
      regionHelp: 'Target geographic region for search results',
      depth: 'Search Depth',
      depthHelp: 'Number of top results to analyze',
      analyze: 'Start Analysis',
      analyzing: 'Analyzing...',
      error: 'Error starting analysis',
      keywordRequired: 'Keyword is required'
    },
    RU: {
      title: 'Начать новый анализ',
      subtitle: 'Анализируйте конкурентов и находите возможности для ссылок',
      keyword: 'Целевое ключевое слово',
      keywordPlaceholder: 'Введите ключевое слово для анализа...',
      keywordHelp: 'Ключевое слово по которому вы хотите ранжироваться',
      domain: 'Ваш домен (опционально)',
      domainPlaceholder: 'example.com',
      domainHelp: 'Домен вашего сайта для сравнения с конкурентами',
      region: 'Регион поиска',
      regionHelp: 'Целевой географический регион для результатов поиска',
      depth: 'Глубина поиска',
      depthHelp: 'Количество топ результатов для анализа',
      analyze: 'Начать анализ',
      analyzing: 'Анализируем...',
      error: 'Ошибка при запуске анализа',
      keywordRequired: 'Ключевое слово обязательно'
    }
  }

  const t = content[language]

  const handleStartAnalysis = async () => {
    if (!user) return

    // Валидация
    if (!keyword.trim()) {
      setError(t.keywordRequired)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const projectData: CreateProjectData = {
        user_id: user.id,
        name: `Analysis: "${keyword}"`,
        keyword: keyword.trim(),
        domain: domain.trim() || undefined,
        region,
        depth,
        status: 'analyzing'
      }

      const newProject = await createProject(projectData)
      
      // ✅ ДОБАВЛЕНА ПРОВЕРКА
      if (!newProject) {
        setError(t.error)
        setLoading(false)
        return
      }

      // Перенаправляем на страницу результатов
      router.push(`/results/${newProject.id}`)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(t.error)
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-[#ff6b00] to-red-600 bg-clip-text text-transparent">
                {t.title}
              </span>
            </h1>
            <p className="text-gray-400">{t.subtitle}</p>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Analysis Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Keyword */}
                <div>
                  <Input
                    label={t.keyword}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={t.keywordPlaceholder}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">{t.keywordHelp}</p>
                </div>

                {/* Domain */}
                <div>
                  <Input
                    label={t.domain}
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder={t.domainPlaceholder}
                  />
                  <p className="mt-1 text-xs text-gray-500">{t.domainHelp}</p>
                </div>

                {/* Region */}
                <div>
                  <Select
                    label={t.region}
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    options={siteConfig.regions.map(r => ({ value: r.value, label: r.label }))}
                  />
                  <p className="mt-1 text-xs text-gray-500">{t.regionHelp}</p>
                </div>

                {/* Depth */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.depth}: <span className="text-[#ff6b00] font-bold">{depth}</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={depth}
                    onChange={(e) => setDepth(parseInt(e.target.value))}
                    className="w-full accent-[#ff6b00]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5</span>
                    <span>{t.depthHelp}</span>
                    <span>50</span>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                    ⚠️ {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleStartAnalysis}
                  disabled={!keyword.trim() || loading}
                  fullWidth
                  size="lg"
                >
                  {loading ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      {t.analyzing}
                    </>
                  ) : (
                    <>🚀 {t.analyze}</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card padding="md">
              <div className="text-center">
                <div className="text-3xl mb-2">🔍</div>
                <div className="font-semibold text-white">Competitor Analysis</div>
                <div className="text-xs text-gray-400 mt-1">Find top ranking sites</div>
              </div>
            </Card>
            
            <Card padding="md">
              <div className="text-center">
                <div className="text-3xl mb-2">🔗</div>
                <div className="font-semibold text-white">Backlink Discovery</div>
                <div className="text-xs text-gray-400 mt-1">Extract link sources</div>
              </div>
            </Card>
            
            <Card padding="md">
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <div className="font-semibold text-white">DR Analysis</div>
                <div className="text-xs text-gray-400 mt-1">Measure domain authority</div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
