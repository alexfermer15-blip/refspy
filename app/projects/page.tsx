// app/projects/page.tsx (ПОЛНАЯ ВЕРСИЯ С ФИЛЬТРАМИ)
'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Header } from '@/components/Header'
import { useLanguage } from '@/lib/language-context'
import { useProjects } from '@/lib/hooks'
import { useFilters } from '@/lib/hooks/useFilters'
import { SearchBar, FilterPanel, SortSelector } from '@/components/filters'
import { Button, Card, CardHeader, CardTitle, CardContent, StatusBadge, Modal, ModalFooter, Input, Select } from '@/components/ui'
import type { CreateProjectData, Project } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { siteConfig } from '@/lib/config/site'

export default function ProjectsPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  
  const { projects, loading, stats, createProject, deleteProject } = useProjects()
  
  const [showModal, setShowModal] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [keyword, setKeyword] = useState('')
  const [domain, setDomain] = useState('')
  const [region, setRegion] = useState('Russia')
  const [depth, setDepth] = useState(10)

  // ✅ ФИЛЬТРЫ
  const {
    filteredData: filteredProjects,
    searchQuery,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    sortBy,
    sortOrder,
    setFilter,
    resetFilters,
    customFilters,
    hasActiveFilters,
    filteredCount,
    totalCount
  } = useFilters<Project>(projects, {
    searchFields: ['name', 'keyword', 'domain'],
    dateField: 'created_at',
  })

  const content = {
    EN: {
      title: 'My Projects',
      newProject: 'New Project',
      search: 'Search projects...',
      showing: 'Showing',
      of: 'of',
      projects: 'projects',
      noProjects: 'No projects found',
      createProject: 'Create New Project',
      projectName: 'Project Name',
      keyword: 'Keyword',
      domain: 'Domain (optional)',
      region: 'Region',
      depth: 'Search Depth',
      cancel: 'Cancel',
      create: 'Create',
      delete: 'Delete',
      view: 'View Results',
      confirmDelete: 'Are you sure you want to delete this project?'
    },
    RU: {
      title: 'Мои проекты',
      newProject: 'Новый проект',
      search: 'Поиск проектов...',
      showing: 'Показано',
      of: 'из',
      projects: 'проектов',
      noProjects: 'Проекты не найдены',
      createProject: 'Создать новый проект',
      projectName: 'Название проекта',
      keyword: 'Ключевое слово',
      domain: 'Домен (опционально)',
      region: 'Регион',
      depth: 'Глубина поиска',
      cancel: 'Отмена',
      create: 'Создать',
      delete: 'Удалить',
      view: 'Посмотреть результаты',
      confirmDelete: 'Вы уверены что хотите удалить этот проект?'
    }
  }

  const t = content[language]

  const handleCreateProject = async () => {
    if (!user || !projectName || !keyword) return

    const projectData: CreateProjectData = {
      name: projectName,
      keyword: keyword,
      domain: domain || undefined,
      region: region,
      depth: depth,
      user_id: user.id,
      status: 'draft'
    }

    const result = await createProject(projectData)
    
    if (result) {
      setShowModal(false)
      setProjectName('')
      setKeyword('')
      setDomain('')
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (confirm(t.confirmDelete)) {
      await deleteProject(id)
    }
  }

  // Фильтры для FilterPanel
  const filterGroups = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Analyzing', value: 'analyzing' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Paused', value: 'paused' }
      ]
    },
    {
      key: 'region',
      label: 'Region',
      type: 'select' as const,
      options: siteConfig.regions.map(r => ({ label: r.label, value: r.value }))
    },
    {
      key: 'depth',
      label: 'Search Depth',
      type: 'range' as const,
      min: 5,
      max: 50
    }
  ]

  // Опции сортировки
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'created_at', label: 'Date' },
    { value: 'status', label: 'Status' },
    { value: 'keyword', label: 'Keyword' }
  ]

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b00]"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-[#ff6b00] to-red-600 bg-clip-text text-transparent">
                  {t.title}
                </span>
              </h1>
              <p className="text-gray-400 mt-2">
                {stats.total} total • {stats.active} active • {stats.completed} completed
              </p>
            </div>
            
            <Button onClick={() => setShowModal(true)} size="lg">
              ➕ {t.newProject}
            </Button>
          </div>

          {/* ✅ ФИЛЬТРЫ И ПОИСК */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t.search}
              />
            </div>
            
            <div className="flex gap-2">
              <FilterPanel
                groups={filterGroups}
                activeFilters={customFilters}
                onFilterChange={setFilter}
                onReset={resetFilters}
              />
              
              <SortSelector
                options={sortOptions}
                value={sortBy as string}
                order={sortOrder}
                onChange={(value) => setSortBy(value as keyof Project)}
                onOrderChange={setSortOrder}
              />
            </div>
          </div>

          {/* Results count */}
          {hasActiveFilters && (
            <div className="mb-4 text-sm text-gray-400">
              {t.showing} <span className="text-white font-semibold">{filteredCount}</span> {t.of} {totalCount} {t.projects}
              <button
                onClick={resetFilters}
                className="ml-2 text-[#ff6b00] hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-400 mb-4">{t.noProjects}</p>
              <Button onClick={() => setShowModal(true)}>
                {t.createProject}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} hover>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>{project.name}</CardTitle>
                      <StatusBadge status={project.status} />
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center text-gray-400">
                        <span className="mr-2">🎯</span>
                        <span>{project.keyword}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <span className="mr-2">🌐</span>
                        <span>{project.region}</span>
                      </div>
                      {project.domain && (
                        <div className="flex items-center text-gray-400">
                          <span className="mr-2">🔗</span>
                          <span>{project.domain}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/results/${project.id}`} className="flex-1">
                        <Button variant="secondary" fullWidth size="sm">
                          {t.view}
                        </Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        {/* Create Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={t.createProject}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label={t.projectName}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My SEO Project"
              required
            />

            <Input
              label={t.keyword}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="best seo tools"
              required
            />

            <Input
              label={t.domain}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
            />

            <Select
              label={t.region}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              options={siteConfig.regions.map(r => ({ value: r.value, label: r.label }))}
            />

            <div>
              <label className="block text-sm font-medium mb-2">
                {t.depth}: {depth}
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
            </div>
          </div>

          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowModal(false)} fullWidth>
              {t.cancel}
            </Button>
            <Button 
              onClick={handleCreateProject} 
              fullWidth
              disabled={!projectName || !keyword}
            >
              {t.create}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </ProtectedRoute>
  )
}
