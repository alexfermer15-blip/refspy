'use client'

import { useState, useEffect } from 'react'
import { Target, TrendingUp, TrendingDown, Search, Plus, MoreVertical, RefreshCw, Filter, Download, FileText, FileDown } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import AddKeywordModal from '@/components/rank-tracker/AddKeywordModal'
import PositionChart from '@/components/rank-tracker/PositionChart'
import { toast } from 'react-hot-toast'

interface Keyword {
  id: string
  keyword: string
  target_url: string
  current_position: number | null
  previous_position: number | null
  best_position: number | null
  search_engine: string
  location: string
  device: string
  is_active: boolean
  last_checked_at: string | null
  created_at: string
}

interface PositionData {
  date: string
  position: number | null
}

export default function RankTrackerPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [filteredKeywords, setFilteredKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [checkingIds, setCheckingIds] = useState<Set<string>>(new Set())
  const [showExportMenu, setShowExportMenu] = useState(false)
  
  // Фильтры
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEngine, setFilterEngine] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // График
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null)
  const [chartData, setChartData] = useState<PositionData[]>([])
  const [loadingChart, setLoadingChart] = useState(false)
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchKeywords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setKeywords(data || [])
      setFilteredKeywords(data || [])
    } catch (error) {
      console.error('Error fetching keywords:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeywords()
  }, [])

  // Закрытие меню экспорта при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showExportMenu && !target.closest('.export-menu')) {
        setShowExportMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showExportMenu])

  // Применение фильтров
  useEffect(() => {
    let filtered = [...keywords]

    // Поиск
    if (searchQuery) {
      filtered = filtered.filter(k => 
        k.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.target_url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Фильтр по поисковику
    if (filterEngine !== 'all') {
      filtered = filtered.filter(k => k.search_engine === filterEngine)
    }

    // Фильтр по статусу
    if (filterStatus !== 'all') {
      filtered = filtered.filter(k => 
        filterStatus === 'active' ? k.is_active : !k.is_active
      )
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aVal: any, bVal: any

      switch (sortBy) {
        case 'position':
          aVal = a.current_position ?? 999
          bVal = b.current_position ?? 999
          break
        case 'change':
          aVal = (a.previous_position && a.current_position) 
            ? a.previous_position - a.current_position 
            : 0
          bVal = (b.previous_position && b.current_position)
            ? b.previous_position - b.current_position
            : 0
          break
        case 'keyword':
          aVal = a.keyword
          bVal = b.keyword
          break
        default:
          aVal = a.created_at
          bVal = b.created_at
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredKeywords(filtered)
  }, [keywords, searchQuery, filterEngine, filterStatus, sortBy, sortOrder])

  // Экспорт в CSV
  const exportToCSV = () => {
    const headers = [
      'Ключевое слово',
      'URL',
      'Текущая позиция',
      'Предыдущая позиция',
      'Изменение',
      'Лучшая позиция',
      'Поисковик',
      'Локация',
      'Устройство',
      'Статус',
      'Последняя проверка',
      'Дата добавления'
    ]

    const rows = filteredKeywords.map(k => {
      const change = k.current_position && k.previous_position
        ? k.previous_position - k.current_position
        : 0
      
      return [
        k.keyword,
        k.target_url,
        k.current_position || 'Не найдено',
        k.previous_position || '—',
        change > 0 ? `+${change}` : change < 0 ? change : '—',
        k.best_position || '—',
        k.search_engine,
        k.location || '—',
        k.device || 'desktop',
        k.is_active ? 'Активно' : 'Неактивно',
        k.last_checked_at ? new Date(k.last_checked_at).toLocaleString('ru-RU') : '—',
        new Date(k.created_at).toLocaleString('ru-RU')
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `keywords_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Экспорт в PDF
  const exportToPDF = async () => {
    try {
      // Динамический импорт jsPDF
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default

      const doc = new jsPDF()
      
      // Заголовок
      doc.setFontSize(20)
      doc.setTextColor(249, 115, 22) // Orange
      doc.text('Отчёт по ключевым словам', 14, 22)
      
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 14, 30)

      // Подготовка данных для таблицы
      const tableData = filteredKeywords.map(k => {
        const change = k.current_position && k.previous_position
          ? k.previous_position - k.current_position
          : 0
        
        return [
          k.keyword,
          k.current_position || '—',
          change > 0 ? `+${change}` : change < 0 ? `${change}` : '—',
          k.search_engine,
          k.is_active ? 'Активно' : 'Неактивно'
        ]
      })

      // Создание таблицы
      autoTable(doc, {
        startY: 40,
        head: [['Ключевое слово', 'Позиция', 'Изменение', 'Поисковик', 'Статус']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [249, 115, 22],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 35 },
          4: { cellWidth: 30, halign: 'center' }
        }
      })

      // Статистика
      const finalY = (doc as any).lastAutoTable.finalY + 20
      doc.setFontSize(14)
      doc.setTextColor(249, 115, 22)
      doc.text('Статистика', 14, finalY)
      
      doc.setFontSize(10)
      doc.setTextColor(0)
      doc.text(`Всего ключевых слов: ${filteredKeywords.length}`, 14, finalY + 10)
      doc.text(`Активных: ${filteredKeywords.filter(k => k.is_active).length}`, 14, finalY + 18)
      doc.text(`В топ-3: ${filteredKeywords.filter(k => k.current_position && k.current_position <= 3).length}`, 14, finalY + 26)
      doc.text(`Улучшились: ${filteredKeywords.filter(k => k.current_position && k.previous_position && k.current_position < k.previous_position).length}`, 14, finalY + 34)

      // Футер
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(`Создано с помощью RefSpy — ${new Date().toLocaleString('ru-RU')}`, 14, doc.internal.pageSize.height - 10)

      // Сохранение
      doc.save(`keywords_${new Date().toISOString().split('T')[0]}.pdf`)
      
      toast.success('PDF успешно создан!')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error('Ошибка создания PDF')
    }
  }

  const loadHistory = async (keyword: Keyword) => {
    setLoadingChart(true)
    setSelectedKeyword(keyword)
    
    try {
      const response = await fetch(`/api/rank-tracker/history/${keyword.id}?days=30`)
      const result = await response.json()
      
      if (result.success) {
        setChartData(result.data)
      } else {
        toast.error('Ошибка загрузки истории')
      }
    } catch (error) {
      console.error('Error loading history:', error)
      toast.error('Ошибка загрузки истории')
    } finally {
      setLoadingChart(false)
    }
  }

  const handleCheckPosition = async (keywordId: string) => {
    setCheckingIds(prev => new Set(prev).add(keywordId))
    
    try {
      const response = await fetch('/api/rank-tracker/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywordId }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchKeywords()
        
        if (result.position) {
          toast.success(`✅ Позиция найдена: ${result.position}`)
        } else {
          toast.error('❌ Позиция не найдена в топ-100')
        }
      } else {
        toast.error(`❌ Ошибка: ${result.error}`)
      }
    } catch (error) {
      console.error('Error checking position:', error)
      toast.error('❌ Ошибка при проверке позиции')
    } finally {
      setCheckingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(keywordId)
        return newSet
      })
    }
  }

  const stats = {
    total: keywords.length,
    active: keywords.filter(k => k.is_active).length,
    inTop3: keywords.filter(k => k.current_position && k.current_position <= 3).length,
    improved: keywords.filter(k => 
      k.current_position && k.previous_position && 
      k.current_position < k.previous_position
    ).length,
  }

  const getPositionChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null
    const change = previous - current
    if (change > 0) return { type: 'up', value: change }
    if (change < 0) return { type: 'down', value: Math.abs(change) }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Заголовок */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Target className="w-8 h-8 text-orange-500" />
              Rank Tracker
            </h1>
            <p className="text-gray-400">
              Отслеживайте позиции ваших ключевых слов в поисковых системах
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Добавить ключевое слово
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm">Всего ключевых слов</h3>
            <Search className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm">Активные</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-3xl font-bold">{stats.active}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm">В топ-3</h3>
            <TrendingUp className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold">{stats.inTop3}</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm">Улучшились</h3>
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold">{stats.improved}</p>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Поиск */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по ключевому слову..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                />
              </div>
            </div>

            {/* Фильтр поисковика */}
            <select
              value={filterEngine}
              onChange={(e) => setFilterEngine(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
            >
              <option value="all">Все поисковики</option>
              <option value="google">Google</option>
              <option value="yandex">Yandex</option>
              <option value="bing">Bing</option>
            </select>

            {/* Фильтр статуса */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
            >
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>

            {/* Сортировка */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
            >
              <option value="created_at">По дате</option>
              <option value="position">По позиции</option>
              <option value="change">По изменению</option>
              <option value="keyword">По алфавиту</option>
            </select>
          </div>
        </div>
      </div>

      {/* Таблица ключевых слов */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Ключевые слова</h2>
              <p className="text-gray-400 text-sm mt-1">
                Показано: {filteredKeywords.length} из {keywords.length}
              </p>
            </div>
            
            {/* Меню экспорта */}
            <div className="relative export-menu">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Экспорт
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
                  <button
                    onClick={() => {
                      exportToCSV()
                      setShowExportMenu(false)
                      toast.success('CSV файл скачан!')
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3 transition-colors rounded-t-lg"
                  >
                    <FileText className="w-4 h-4 text-green-500" />
                    <span>Экспорт в CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      exportToPDF()
                      setShowExportMenu(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3 transition-colors rounded-b-lg"
                  >
                    <FileDown className="w-4 h-4 text-red-500" />
                    <span>Экспорт в PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {filteredKeywords.length === 0 ? (
            <div className="p-12 text-center">
              <Filter className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
              <p className="text-gray-400 mb-6">
                Попробуйте изменить параметры фильтрации
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      КЛЮЧЕВОЕ СЛОВО
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      ПОЗИЦИЯ
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      ИЗМЕНЕНИЕ
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      ПОИСКОВИК
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      СТАТУС
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      ДЕЙСТВИЯ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredKeywords.map((keyword) => {
                    const change = getPositionChange(keyword.current_position, keyword.previous_position)
                    const isChecking = checkingIds.has(keyword.id)
                    
                    return (
                      <tr key={keyword.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold">{keyword.keyword}</p>
                            <p className="text-sm text-gray-400 truncate max-w-xs">
                              {keyword.target_url}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {keyword.current_position ? (
                            <span className="text-2xl font-bold">
                              {keyword.current_position}
                            </span>
                          ) : (
                            <span className="text-gray-500">Не найдено</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {change ? (
                            <div className={`flex items-center gap-1 ${
                              change.type === 'up' ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {change.type === 'up' ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              <span className="font-semibold">{change.value}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="capitalize">{keyword.search_engine}</span>
                        </td>
                        <td className="px-6 py-4">
                          {keyword.is_active ? (
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                              Активно
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm font-medium">
                              Неактивно
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCheckPosition(keyword.id)}
                              disabled={isChecking}
                              className={`p-2 rounded-lg transition-colors ${
                                isChecking
                                  ? 'bg-gray-700 cursor-not-allowed'
                                  : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400'
                              }`}
                              title="Проверить позицию"
                            >
                              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                            </button>
                            
                            <button
                              onClick={() => loadHistory(keyword)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors group"
                              title="Показать график"
                            >
                              <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                            </button>
                            
                            <button
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Дополнительно"
                            >
                              <MoreVertical className="w-4 h-4" />
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
        </div>

        {/* График */}
        {selectedKeyword && (
          <div className="mt-8">
            {loadingChart ? (
              <div className="flex items-center justify-center h-64 bg-gray-900/50 border border-gray-800 rounded-xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Загрузка графика...</p>
                </div>
              </div>
            ) : (
              <PositionChart 
                data={chartData}
                keyword={selectedKeyword.keyword}
              />
            )}
          </div>
        )}
      </div>

      {/* Модальное окно */}
      <AddKeywordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false)
          fetchKeywords()
        }}
      />
    </div>
  )
}
