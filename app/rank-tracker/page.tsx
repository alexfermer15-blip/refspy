'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, RefreshCw, Plus, Trash2, BarChart3, Download } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { KeywordHistoryChart } from '@/components/rank-tracker/KeywordHistoryChart'

// Локальные типы для страницы
interface Keyword {
  id: string
  keyword: string
  current_position: number | null
  previous_position: number | null
  best_position: number | null
  search_volume: number
  difficulty: number
  target_url: string
}

interface Project {
  id: string
  name: string
  domain: string
}

interface KeywordStats {
  total: number
  active: number
  in_top_3: number
  improved: number
  declined: number
}

export default function RankTrackerPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      fetchKeywords()
    }
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      if (data.success && data.projects?.length > 0) {
        setProjects(data.projects)
        setSelectedProject(data.projects[0].id)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchKeywords = async () => {
    try {
      const response = await fetch(`/api/keywords?project_id=${selectedProject}`)
      const data = await response.json()
      setKeywords(data.keywords || [])
    } catch (error) {
      console.error('Error fetching keywords:', error)
    }
  }

  const checkRanking = async (keywordId: string) => {
    setChecking(keywordId)
    try {
      const keyword = keywords.find(k => k.id === keywordId)
      if (!keyword) return

      const project = projects.find(p => p.id === selectedProject)
      if (!project) return

      const response = await fetch('/api/rank-tracker/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywordId: keywordId
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setKeywords(prev => prev.map(k => 
          k.id === keywordId 
            ? { 
                ...k, 
                current_position: data.position, 
                previous_position: k.current_position,
                best_position: data.position && k.best_position 
                  ? Math.min(k.best_position, data.position)
                  : data.position || k.best_position
              }
            : k
        ))
      }
    } catch (error) {
      console.error('Error checking ranking:', error)
    } finally {
      setChecking(null)
    }
  }

  const checkAllRankings = async () => {
    for (const keyword of keywords) {
      await checkRanking(keyword.id)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  const addKeyword = async () => {
    if (!newKeyword.trim()) return

    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProject,
          keyword: newKeyword,
          search_volume: 0,
          difficulty: 0
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setKeywords(prev => [data.keyword, ...prev])
        setNewKeyword('')
        setShowAddModal(false)
      } else {
        alert(data.error || 'Failed to add keyword')
      }
    } catch (error) {
      console.error('Error adding keyword:', error)
      alert('Failed to add keyword')
    }
  }

  const deleteKeyword = async (keywordId: string) => {
    if (!confirm('Delete this keyword?')) return

    try {
      const response = await fetch(`/api/keywords?id=${keywordId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        setKeywords(prev => prev.filter(k => k.id !== keywordId))
      }
    } catch (error) {
      console.error('Error deleting keyword:', error)
    }
  }

  const getPositionChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return { value: 0, direction: 'neutral' as const }
    const change = previous - current
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const
    }
  }

  const calculateStats = (): KeywordStats => {
    const total = keywords.length
    const active = keywords.filter(k => k.current_position !== null).length
    const in_top_3 = keywords.filter(k => k.current_position && k.current_position <= 3).length
    const improved = keywords.filter(k => {
      if (!k.current_position || !k.previous_position) return false
      return k.current_position < k.previous_position
    }).length
    const declined = keywords.filter(k => {
      if (!k.current_position || !k.previous_position) return false
      return k.current_position > k.previous_position
    }).length

    return { total, active, in_top_3, improved, declined }
  }

  const exportToCSV = () => {
    const headers = ['Keyword', 'Position', 'Change', 'Best Position', 'Volume', 'Difficulty', 'URL']
    const rows = keywords.map(k => [
      k.keyword,
      k.current_position || 'Not ranked',
      k.current_position && k.previous_position 
        ? (k.previous_position - k.current_position).toString()
        : '0',
      k.best_position || '-',
      k.search_volume || '0',
      k.difficulty || '0',
      k.target_url || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `refspy_keywords_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                Rank Tracker
              </h1>
              <p className="text-gray-400">Monitor your keyword rankings daily</p>
            </div>
            
            <div className="flex items-center gap-4">
              {projects.length > 0 && (
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg"
                >
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              )}

              {keywords.length > 0 && (
                <>
                  <button
                    onClick={checkAllRankings}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Check All
                  </button>

                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export to CSV
                  </button>
                </>
              )}

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Keyword
              </button>
            </div>
          </div>

          {keywords.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
                <div className="text-gray-400 text-sm">Total Keywords</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-500 mb-2">{stats.active}</div>
                <div className="text-gray-400 text-sm">Active</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="text-3xl font-bold text-orange-500 mb-2">{stats.in_top_3}</div>
                <div className="text-gray-400 text-sm">In Top 3</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="text-3xl font-bold text-blue-500 mb-2">{stats.improved}</div>
                <div className="text-gray-400 text-sm">Improved</div>
              </div>
            </div>
          )}

          {keywords.length === 0 ? (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl text-gray-400 mb-2">No keywords yet</h3>
              <p className="text-gray-500 mb-6">Add keywords to start tracking rankings</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
              >
                Add Your First Keyword
              </button>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="text-left p-4 text-gray-400 font-medium">Keyword</th>
                    <th className="text-center p-4 text-gray-400 font-medium">Position</th>
                    <th className="text-center p-4 text-gray-400 font-medium">Change</th>
                    <th className="text-center p-4 text-gray-400 font-medium">Best</th>
                    <th className="text-center p-4 text-gray-400 font-medium">Volume</th>
                    <th className="text-center p-4 text-gray-400 font-medium">Difficulty</th>
                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((keyword) => {
                    const change = getPositionChange(keyword.current_position, keyword.previous_position)
                    
                    return (
                      <tr key={keyword.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="p-4">
                          <div>
                            <div className="text-white font-medium">{keyword.keyword}</div>
                            {keyword.target_url && (
                              <div className="text-sm text-gray-500">{keyword.target_url}</div>
                            )}
                          </div>
                        </td>
                        
                        <td className="p-4 text-center">
                          {keyword.current_position ? (
                            <span className="text-2xl font-bold text-white">#{keyword.current_position}</span>
                          ) : (
                            <span className="text-gray-500">Not ranked</span>
                          )}
                        </td>
                        
                        <td className="p-4 text-center">
                          {change.direction === 'up' && (
                            <div className="flex items-center justify-center gap-1 text-green-500">
                              <TrendingUp className="w-4 h-4" />
                              <span>+{change.value}</span>
                            </div>
                          )}
                          {change.direction === 'down' && (
                            <div className="flex items-center justify-center gap-1 text-red-500">
                              <TrendingDown className="w-4 h-4" />
                              <span>-{change.value}</span>
                            </div>
                          )}
                          {change.direction === 'neutral' && (
                            <Minus className="w-4 h-4 text-gray-500 mx-auto" />
                          )}
                        </td>

                        <td className="p-4 text-center">
                          {keyword.best_position ? (
                            <span className="text-green-400 font-semibold">#{keyword.best_position}</span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        
                        <td className="p-4 text-center text-gray-300">
                          {keyword.search_volume > 0 ? keyword.search_volume.toLocaleString() : '-'}
                        </td>
                        
                        <td className="p-4 text-center">
                          {keyword.difficulty > 0 ? (
                            <span className={`px-2 py-1 rounded text-sm ${
                              keyword.difficulty > 70 ? 'bg-red-500/20 text-red-400' :
                              keyword.difficulty > 40 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {keyword.difficulty}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => checkRanking(keyword.id)}
                              disabled={checking === keyword.id}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                              title="Check ranking"
                            >
                              <RefreshCw 
                                className={`w-4 h-4 text-orange-500 ${checking === keyword.id ? 'animate-spin' : ''}`} 
                              />
                            </button>
                            <button
                              onClick={() => deleteKeyword(keyword.id)}
                              className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete keyword"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {keywords.length > 0 && (
            <div className="mt-8 space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Keyword History</h2>
              {keywords.map((keyword) => (
                <div key={keyword.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white">{keyword.keyword}</h3>
                    {keyword.target_url && (
                      <p className="text-sm text-gray-500">{keyword.target_url}</p>
                    )}
                  </div>
                  <KeywordHistoryChart keywordId={keyword.id} />
                </div>
              ))}
            </div>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-8 w-full max-w-md border border-gray-800">
              <h3 className="text-2xl font-bold text-white mb-6">Add Keyword</h3>
              
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Enter keyword..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg mb-6"
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                autoFocus
              />

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewKeyword('')
                  }}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={addKeyword}
                  disabled={!newKeyword.trim()}
                  className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50"
                >
                  Add Keyword
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
