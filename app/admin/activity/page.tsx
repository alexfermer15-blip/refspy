'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/lib/auth-context'
import { activityLogsAPI } from '@/lib/supabase'

export default function AdminActivity() {
  const { user } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(50)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Проверка прав админа
    if (user && !isAdmin(user)) {
      router.push('/dashboard')
      return
    }

    if (user) {
      loadLogs()
    }
  }, [limit, user])

  const isAdmin = (user: any) => {
    return user?.email === 'admin@refspy.com' || 
           user?.user_metadata?.role === 'admin' ||
           user?.email?.includes('admin')
  }

  const loadLogs = async () => {
    try {
      setLoading(true)
      const data = await activityLogsAPI.getRecent(limit).catch(() => [])
      setLogs(data)
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshLogs = async () => {
    try {
      setRefreshing(true)
      await loadLogs()
    } finally {
      setRefreshing(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.action?.toLowerCase().includes(filter.toLowerCase())
    const matchesSearch = !search || 
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.users?.email?.toLowerCase().includes(search.toLowerCase()) ||
      log.users?.name?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getActionIcon = (action: string) => {
    if (!action) return '📝'
    const lowerAction = action.toLowerCase()
    if (lowerAction.includes('login')) return '🔐'
    if (lowerAction.includes('create')) return '✨'
    if (lowerAction.includes('update')) return '✏️'
    if (lowerAction.includes('delete')) return '🗑️'
    if (lowerAction.includes('payment')) return '💳'
    if (lowerAction.includes('api')) return '🔌'
    if (lowerAction.includes('export')) return '📥'
    if (lowerAction.includes('import')) return '📤'
    return '📝'
  }

  const getActionColor = (action: string) => {
    if (!action) return 'text-gray-400'
    const lowerAction = action.toLowerCase()
    if (lowerAction.includes('delete')) return 'text-red-400'
    if (lowerAction.includes('create')) return 'text-green-400'
    if (lowerAction.includes('update')) return 'text-yellow-400'
    if (lowerAction.includes('payment')) return 'text-blue-400'
    if (lowerAction.includes('login')) return 'text-purple-400'
    return 'text-gray-400'
  }

  if (!user || !isAdmin(user)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">Admin access required</p>
          <Link href="/dashboard" className="text-[#ff6b00] hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        {/* Admin Header */}
        <header className="border-b border-red-900/30 bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-2xl font-bold">
                  Ref<span className="text-[#ff6b00]">Spy</span>
                </Link>
                <span className="px-3 py-1 bg-red-600 text-xs font-bold rounded animate-pulse">
                  ADMIN
                </span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/admin" className="text-gray-300 hover:text-white transition">
                  Dashboard
                </Link>
                <Link href="/admin/users" className="text-gray-300 hover:text-white transition">
                  Users
                </Link>
                <Link href="/admin/payments" className="text-gray-300 hover:text-white transition">
                  Payments
                </Link>
                <Link href="/admin/activity" className="text-[#ff6b00] font-bold">
                  Activity
                </Link>
                <Link href="/admin/integrations" className="text-gray-300 hover:text-white transition">
                  Integrations
                </Link>
                <Link href="/admin/settings" className="text-gray-300 hover:text-white transition">
                  Settings
                </Link>
              </nav>
              <Link 
                href="/dashboard"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition"
              >
                ← User View
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              📝 Activity <span className="text-[#ff6b00]">Logs</span>
            </h1>
            <p className="text-gray-400">Monitor system activity and user actions</p>
          </div>

          {/* Filters */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="🔍 Search by action or user..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:border-[#ff6b00] focus:outline-none transition"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full md:w-auto px-4 py-3 bg-black border border-gray-700 rounded-lg focus:border-[#ff6b00] focus:outline-none transition"
              >
                <option value="all">All Actions</option>
                <option value="login">Login</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="payment">Payment</option>
                <option value="api">API Call</option>
              </select>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-full md:w-auto px-4 py-3 bg-black border border-gray-700 rounded-lg focus:border-[#ff6b00] focus:outline-none transition"
              >
                <option value="50">Last 50</option>
                <option value="100">Last 100</option>
                <option value="200">Last 200</option>
                <option value="500">Last 500</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', icon: '📋', label: 'All' },
                { value: 'login', icon: '🔐', label: 'Login' },
                { value: 'create', icon: '✨', label: 'Create' },
                { value: 'update', icon: '✏️', label: 'Update' },
                { value: 'delete', icon: '🗑️', label: 'Delete' },
                { value: 'payment', icon: '💳', label: 'Payment' }
              ].map(({ value, icon, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-3 py-1.5 rounded text-sm transition ${
                    filter === value 
                      ? 'bg-[#ff6b00] text-black font-bold' 
                      : 'bg-black hover:bg-gray-800 text-gray-400'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-[#ff6b00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading activity logs...</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg">
              {/* Stats Bar */}
              <div className="bg-black/50 border-b border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing <span className="text-[#ff6b00] font-bold">{filteredLogs.length}</span> of {logs.length} logs
                  </div>
                  <button
                    onClick={refreshLogs}
                    disabled={refreshing}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {refreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
                  </button>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="divide-y divide-gray-800">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p>No activity logs found</p>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="px-6 py-4 hover:bg-black/50 transition"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="text-2xl mt-1">
                          {getActionIcon(log.action)}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1 flex-wrap">
                                <span className={`font-semibold ${getActionColor(log.action)}`}>
                                  {log.action || 'Unknown action'}
                                </span>
                                {log.resource_type && (
                                  <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                                    {log.resource_type}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 mb-2">
                                {log.users ? (
                                  <>
                                    <span className="font-medium text-gray-400">
                                      {log.users.name || log.users.email}
                                    </span>
                                    {log.users.email && log.users.name && (
                                      <span className="ml-2">({log.users.email})</span>
                                    )}
                                  </>
                                ) : (
                                  <span>System</span>
                                )}
                              </div>
                              {log.resource_id && (
                                <div className="text-xs text-gray-600 mb-1">
                                  ID: <code className="bg-black/50 px-2 py-0.5 rounded">
                                    {log.resource_id.substring(0, 16)}...
                                  </code>
                                </div>
                              )}
                              {log.ip_address && (
                                <div className="text-xs text-gray-600">
                                  IP: {log.ip_address}
                                </div>
                              )}
                            </div>

                            {/* Timestamp */}
                            <div className="text-right whitespace-nowrap">
                              <div className="text-sm font-medium">
                                {new Date(log.created_at).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(log.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Metadata */}
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 transition">
                                📄 View metadata
                              </summary>
                              <pre className="mt-2 p-3 bg-black rounded text-xs overflow-x-auto border border-gray-800">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Load More */}
              {filteredLogs.length >= limit && filteredLogs.length < logs.length && (
                <div className="border-t border-gray-800 p-6 text-center">
                  <button
                    onClick={() => setLimit(limit + 50)}
                    className="px-6 py-3 bg-[#ff6b00] hover:bg-red-600 text-black font-bold rounded transition"
                  >
                    Load More Activities
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
