// app/backlinks/page.tsx (НОВАЯ СТРАНИЦА С ФИЛЬТРАМИ)
'use client'

import { useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Header } from '@/components/Header'
import { useLanguage } from '@/lib/language-context'
import { useProjects, useBacklinks } from '@/lib/hooks'
import { useFilters } from '@/lib/hooks/useFilters'
import { SearchBar, FilterPanel, SortSelector } from '@/components/filters'
import { Button, Card, Badge, Table, TableHeader, TableBody, TableRow, TableCell, Select } from '@/components/ui'
import type { Backlink } from '@/lib/types'
import { extractDomain, copyToClipboard } from '@/lib/utils'
import { useToast } from '@/components/ui'

export default function BacklinksPage() {
  const { language } = useLanguage()
  const { projects } = useProjects()
  const { showToast } = useToast()
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const { backlinks, loading, stats } = useBacklinks(selectedProjectId)

  // ✅ ФИЛЬТРЫ для бэклинков
  const {
    filteredData: filteredBacklinks,
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
  } = useFilters<Backlink>(backlinks, {
    searchFields: ['source_domain', 'source_url', 'anchor_text', 'target_url'],
    dateField: 'discovered_at',
  })

  const content = {
    EN: {
      title: 'Backlinks Analysis',
      selectProject: 'Select Project',
      search: 'Search backlinks...',
      showing: 'Showing',
      of: 'of',
      backlinks: 'backlinks',
      noBacklinks: 'No backlinks found',
      exportCSV: 'Export CSV',
      exportExcel: 'Export Excel',
      domain: 'Domain',
      anchor: 'Anchor Text',
      target: 'Target URL',
      type: 'Type',
      dr: 'DR',
      traffic: 'Traffic',
      actions: 'Actions',
      copyUrl: 'Copy URL',
      visit: 'Visit',
      copied: 'Copied to clipboard!'
    },
    RU: {
      title: 'Анализ бэклинков',
      selectProject: 'Выберите проект',
      search: 'Поиск бэклинков...',
      showing: 'Показано',
      of: 'из',
      backlinks: 'бэклинков',
      noBacklinks: 'Бэклинки не найдены',
      exportCSV: 'Экспорт CSV',
      exportExcel: 'Экспорт Excel',
      domain: 'Домен',
      anchor: 'Анкор',
      target: 'Целевой URL',
      type: 'Тип',
      dr: 'DR',
      traffic: 'Трафик',
      actions: 'Действия',
      copyUrl: 'Копировать URL',
      visit: 'Посетить',
      copied: 'Скопировано в буфер обмена!'
    }
  }

  const t = content[language]

  // Группы фильтров для бэклинков
  const filterGroups = [
    {
      key: 'link_type',
      label: 'Link Type',
      type: 'select' as const,
      options: [
        { label: 'Dofollow', value: 'dofollow' },
        { label: 'Nofollow', value: 'nofollow' }
      ]
    },
    {
      key: 'dr_min',
      label: 'Minimum DR',
      type: 'range' as const,
      min: 0,
      max: 100
    },
    {
      key: 'is_available',
      label: 'Availability',
      type: 'select' as const,
      options: [
        { label: 'Available', value: 'true' },
        { label: 'Not Available', value: 'false' }
      ]
    }
  ]

  // Опции сортировки
  const sortOptions = [
    { value: 'dr', label: 'Domain Rating' },
    { value: 'source_domain', label: 'Domain Name' },
    { value: 'discovered_at', label: 'Discovery Date' },
    { value: 'traffic', label: 'Traffic' }
  ]

  // Экспорт в CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Domain', 'DR', 'Anchor Text', 'Target URL', 'Type', 'Traffic'].join(','),
      ...filteredBacklinks.map(link => [
        link.source_domain,
        link.dr || 0,
        link.anchor_text || '',
        link.target_url,
        link.link_type,
        link.traffic || 0
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backlinks-${new Date().toISOString()}.csv`
    a.click()
  }

  const handleCopyUrl = async (url: string) => {
    const success = await copyToClipboard(url)
    if (success) {
      showToast(t.copied, 'success')
    }
  }

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
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#ff6b00] to-red-600 bg-clip-text text-transparent">
                {t.title}
              </span>
            </h1>

            {/* Project Selector */}
            <div className="max-w-md">
              <Select
                label={t.selectProject}
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                options={[
                  { value: '', label: '-- ' + t.selectProject + ' --' },
                  ...projects.map(p => ({ value: p.id, label: p.name }))
                ]}
              />
            </div>
          </div>

          {selectedProjectId && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card padding="md">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#ff6b00]">
                      {stats.total}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Total Backlinks</div>
                  </div>
                </Card>

                <Card padding="md">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">
                      {stats.dofollow}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Dofollow</div>
                  </div>
                </Card>

                <Card padding="md">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">
                      {stats.avgDR}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Avg DR</div>
                  </div>
                </Card>

                <Card padding="md">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-500">
                      {stats.highDR}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">High DR (70+)</div>
                  </div>
                </Card>
              </div>

              {/* Filters & Search */}
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
                    onChange={(value) => setSortBy(value as keyof Backlink)}
                    onOrderChange={setSortOrder}
                  />

                  <Button variant="secondary" onClick={exportToCSV}>
                    📊 {t.exportCSV}
                  </Button>
                </div>
              </div>

              {/* Results count */}
              {hasActiveFilters && (
                <div className="mb-4 text-sm text-gray-400">
                  {t.showing} <span className="text-white font-semibold">{filteredCount}</span> {t.of} {totalCount} {t.backlinks}
                  <button
                    onClick={resetFilters}
                    className="ml-2 text-[#ff6b00] hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {/* Backlinks Table */}
              {filteredBacklinks.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔗</div>
                    <p className="text-gray-400">{t.noBacklinks}</p>
                  </div>
                </Card>
              ) : (
                <Card padding="none">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableCell header>{t.domain}</TableCell>
                        <TableCell header>{t.dr}</TableCell>
                        <TableCell header>{t.anchor}</TableCell>
                        <TableCell header>{t.type}</TableCell>
                        <TableCell header>{t.traffic}</TableCell>
                        <TableCell header>{t.actions}</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBacklinks.map((link) => (
                        <TableRow key={link.id}>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              <div className="font-semibold text-white">
                                {link.source_domain}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {link.source_url}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant={
                              (link.dr || 0) >= 70 ? 'success' :
                              (link.dr || 0) >= 40 ? 'warning' :
                              'default'
                            }>
                              DR: {link.dr || 0}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="max-w-xs truncate text-gray-400">
                              {link.anchor_text || '[no anchor]'}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant={link.link_type === 'dofollow' ? 'success' : 'warning'}>
                              {link.link_type}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <span className="text-gray-400">
                              {link.traffic ? link.traffic.toLocaleString() : '-'}
                            </span>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCopyUrl(link.source_url)}
                                className="p-1 hover:text-[#ff6b00] transition-colors"
                                title={t.copyUrl}
                              >
                                📋
                              </button>
                              <a
                                href={link.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:text-[#ff6b00] transition-colors"
                                title={t.visit}
                              >
                                🔗
                              </a>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
