'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { projectsAPI } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
// ✅ ИСПРАВЛЕННЫЕ ИМПОРТЫ
import type { Project, CreateProjectInput, CreateProjectData } from '@/lib/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState({
    activeOperations: 0,
    intelGathered: 0,
    targetsTracked: 0,
    aiScansLeft: 10
  })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  const [projectName, setProjectName] = useState<string>('')
  const [keyword, setKeyword] = useState<string>('')
  const [domain, setDomain] = useState<string>('')
  const [country, setCountry] = useState<string>('Russia')
  const [depth, setDepth] = useState<number>(10)

  const content = {
    EN: {
      title: 'Intelligence',
      subtitle: 'Dashboard',
      activeOps: 'Active Operations',
      intelGathered: 'Intel Gathered',
      targetsTracked: 'Targets Tracked',
      aiScansLeft: 'AI Scans Left',
      recentActivity: 'Recent Activity',
      topProjects: 'Top Projects',
      quickActions: 'Quick Actions',
      newProject: 'New Project',
      viewAll: 'View All Projects',
      analyze: 'Analyze Competitors',
      loading: 'Loading intelligence...',
      noProjects: 'No active projects',
      createProject: 'Create New Project',
      projectName: 'Project Name',
      keyword: 'Target Keyword',
      domain: 'Domain (optional)',
      selectCountry: 'Select Country',
      searchDepth: 'Search Depth',
      cancel: 'Cancel',
      create: 'Create Project',
      fillRequired: 'Please fill all required fields',
      projectCreated: 'Project created successfully!',
      errorCreating: 'Error creating project'
    },
    RU: {
      title: 'Панель',
      subtitle: 'Управления',
      activeOps: 'Активных операций',
      intelGathered: 'Собрано данных',
      targetsTracked: 'Целей отслеживается',
      aiScansLeft: 'Сканирований ИИ',
      recentActivity: 'Недавняя активность',
      topProjects: 'Топ проекты',
      quickActions: 'Быстрые действия',
      newProject: 'Новый проект',
      viewAll: 'Все проекты',
      analyze: 'Анализ конкурентов',
      loading: 'Загрузка данных...',
      noProjects: 'Нет активных проектов',
      createProject: 'Создать новый проект',
      projectName: 'Название проекта',
      keyword: 'Ключевое слово',
      domain: 'Домен (опционально)',
      selectCountry: 'Выберите страну',
      searchDepth: 'Глубина поиска',
      cancel: 'Отмена',
      create: 'Создать проект',
      fillRequired: 'Заполните все обязательные поля',
      projectCreated: 'Проект успешно создан!',
      errorCreating: 'Ошибка при создании проекта'
    }
  }

  const t = content[language]

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const userProjects = await projectsAPI.getByUser(user.id)
      setProjects(userProjects)

      setStats({
        activeOperations: userProjects.filter(p => p.status === 'active' || p.status === 'analyzing').length,
        intelGathered: userProjects.length * 234,
        targetsTracked: userProjects.length * 3,
        aiScansLeft: 478
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ ИСПРАВЛЕННАЯ ФУНКЦИЯ
  const createProject = async () => {
    if (!user) {
      alert(t.fillRequired)
      return
    }

    if (!projectName || !keyword) {
      alert(t.fillRequired)
      return
    }

    setLoading(true)
    try {
      const projectData: CreateProjectInput = {
        name: projectName,
        keyword: keyword,
        domain: domain || undefined,
        region: country,
        depth: depth
      }

      // ✅ ИСПОЛЬЗУЕМ CreateProjectData
      const projectDataToCreate: CreateProjectData = {
        ...projectData,
        user_id: user.id,
        status: 'draft'
      }

      const newProject = await projectsAPI.create(projectDataToCreate)

      console.log('✅ Project created:', newProject)

      const updatedProjects = await projectsAPI.getByUser(user.id)
      setProjects(updatedProjects)

      setProjectName('')
      setKeyword('')
      setDomain('')
      setCountry('Russia')
      setDepth(10)
      setShowModal(false)

      alert(t.projectCreated)
    } catch (error) {
      console.error('❌ Error creating project:', error)
      alert(t.errorCreating)
    } finally {
      setLoading(false)
    }
  }

  const activityData = [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 19 },
    { name: 'Wed', value: 15 },
    { name: 'Thu', value: 25 },
    { name: 'Fri', value: 22 },
    { name: 'Sat', value: 18 },
    { name: 'Sun', value: 14 }
  ]

  const projectsData = [
    { name: 'Active', value: projects.filter(p => p.status === 'active').length },
    { name: 'Analyzing', value: projects.filter(p => p.status === 'analyzing').length },
    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length },
    { name: 'Paused', value: projects.filter(p => p.status === 'paused').length }
  ]

  const COLORS = ['#00ff00', '#ff6b00', '#0088FE', '#FFBB28']

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff6b00] mx-auto mb-4"></div>
            <p className="text-gray-400">{t.loading}</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Header />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {t.title}{' '}
              <span className="bg-gradient-to-r from-[#ff6b00] to-red-600 bg-clip-text text-transparent">
                {t.subtitle}
              </span>
            </h1>
            <p className="text-gray-400">{user?.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{t.activeOps}</span>
                <span className="text-2xl">🎯</span>
              </div>
              <div className="text-3xl font-bold text-green-500">{stats.activeOperations}</div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{t.intelGathered}</span>
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-3xl font-bold text-[#ff6b00]">{stats.intelGathered.toLocaleString()}</div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{t.targetsTracked}</span>
                <span className="text-2xl">👁️</span>
              </div>
              <div className="text-3xl font-bold text-blue-500">{stats.targetsTracked}</div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{t.aiScansLeft}</span>
                <span className="text-2xl">🤖</span>
              </div>
              <div className="text-3xl font-bold text-purple-500">{stats.aiScansLeft}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">{t.recentActivity}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#ff6b00" 
                    strokeWidth={2}
                    dot={{ fill: '#ff6b00', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">{t.topProjects}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={projectsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8">
            <h3 className="text-xl font-bold mb-4">{t.quickActions}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowModal(true)}
                className="p-4 bg-gradient-to-r from-[#ff6b00] to-red-600 rounded-lg hover:scale-105 transition-transform"
              >
                <div className="text-3xl mb-2">➕</div>
                <div className="font-semibold">{t.newProject}</div>
              </button>
              
              <Link
                href="/projects"
                className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-center"
              >
                <div className="text-3xl mb-2">📁</div>
                <div className="font-semibold">{t.viewAll}</div>
              </Link>
              
              <Link
                href="/analyze"
                className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-center"
              >
                <div className="text-3xl mb-2">🔍</div>
                <div className="font-semibold">{t.analyze}</div>
              </Link>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-xl font-bold mb-4">{t.topProjects}</h3>
            
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-400 mb-4">{t.noProjects}</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#ff6b00] to-red-600 rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  {t.createProject}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={`/results/${project.id}`}
                    className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{project.name}</h4>
                        <p className="text-sm text-gray-400">{project.keyword}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm ${
                        project.status === 'active' ? 'bg-green-500/20 text-green-500' :
                        project.status === 'analyzing' ? 'bg-[#ff6b00]/20 text-[#ff6b00]' :
                        project.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>

        {showModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-gray-800">
              <h2 className="text-2xl font-bold mb-6">{t.createProject}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.projectName} *</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-[#ff6b00] focus:outline-none"
                    placeholder="My SEO Project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.keyword} *</label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-[#ff6b00] focus:outline-none"
                    placeholder="best seo tools"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.domain}</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-[#ff6b00] focus:outline-none"
                    placeholder="example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.selectCountry}</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-[#ff6b00] focus:outline-none"
                  >
                    <option value="Russia">Russia</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.searchDepth}: {depth}</label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={depth}
                    onChange={(e) => setDepth(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={createProject}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#ff6b00] to-red-600 rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {loading ? '...' : t.create}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
