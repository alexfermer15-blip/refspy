'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { projectsAPI } from '@/lib/supabase'
import { Plus, Search, Trash2, ExternalLink } from 'lucide-react'

interface Project {
  id: string
  name: string
  keyword: string
  domain: string
  status: string
  region?: string
  created_at: string
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    keyword: '',
    domain: '',
    region: 'RU'
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await projectsAPI.getAll()
      setProjects(data)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async () => {
    if (!newProject.name || !newProject.keyword) {
      alert('Заполните обязательные поля')
      return
    }

    try {
      const project = await projectsAPI.create({
        name: newProject.name,
        keyword: newProject.keyword,
        domain: newProject.domain,
        status: 'active',
        region: newProject.region
      })

      setProjects(prev => [project, ...prev])
      setShowCreateModal(false)
      setNewProject({ name: '', keyword: '', domain: '', region: 'RU' })
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Ошибка создания проекта')
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Удалить проект?')) return

    try {
      await projectsAPI.delete(id)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Ошибка удаления проекта')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Загрузка проектов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Мои проекты</h1>
            <p className="text-slate-400">Управление SEO проектами и анализ конкурентов</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Новый проект</span>
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-20 h-20 text-slate-700 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Нет проектов</h2>
            <p className="text-slate-400 mb-6">Создайте первый проект для начала анализа</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Создать проект
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-orange-500 transition-all cursor-pointer"
                onClick={() => router.push(`/results/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{project.name}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteProject(project.id)
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Search className="w-4 h-4" />
                    <span className="text-sm">{project.keyword}</span>
                  </div>
                  {project.domain && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm">{project.domain}</span>
                    </div>
                  )}
                  {project.region && (
                    <div className="text-xs text-slate-500">
                      Регион: {project.region}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-500">
                    {new Date(project.created_at).toLocaleDateString('ru-RU')}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    project.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {project.status === 'active' ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-6">Новый проект</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 mb-2 text-sm">
                    Название проекта <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
                    placeholder="Мой сайт"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-2 text-sm">
                    Ключевое слово <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newProject.keyword}
                    onChange={(e) => setNewProject(prev => ({ ...prev, keyword: e.target.value }))}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
                    placeholder="купить iPhone"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-2 text-sm">
                    Домен (необязательно)
                  </label>
                  <input
                    type="text"
                    value={newProject.domain}
                    onChange={(e) => setNewProject(prev => ({ ...prev, domain: e.target.value }))}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
                    placeholder="example.com"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-2 text-sm">
                    Регион <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newProject.region}
                    onChange={(e) => setNewProject(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
                  >
                    <option value="RU">Россия</option>
                    <option value="BY">Беларусь</option>
                    <option value="UA">Украина</option>
                    <option value="KZ">Казахстан</option>
                    <option value="US">США</option>
                    <option value="EU">Европа</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={createProject}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Создать
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewProject({ name: '', keyword: '', domain: '', region: 'RU' })
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
