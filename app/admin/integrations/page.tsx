'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/lib/auth-context'
import { integrationsAPI } from '@/lib/supabase'

export default function AdminIntegrations() {
  const { user } = useAuth()
  const router = useRouter()
  const [integrations, setIntegrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Проверка прав админа
    if (user && !isAdmin(user)) {
      router.push('/dashboard')
      return
    }

    if (user) {
      loadIntegrations()
    }
  }, [user])

  const isAdmin = (user: any) => {
    return user?.email === 'admin@refspy.com' || 
           user?.user_metadata?.role === 'admin' ||
           user?.email?.includes('admin')
  }

  const loadIntegrations = async () => {
    try {
      setLoading(true)
      const data = await integrationsAPI.getAll().catch(() => [])
      setIntegrations(data)
    } catch (error) {
      console.error('Error loading integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (integration: any) => {
    setEditingId(integration.id)
    setFormData({
      api_key: integration.api_key || '',
      status: integration.status,
      rate_limit: integration.rate_limit
    })
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    try {
      await integrationsAPI.update(id, formData)
      await loadIntegrations()
      setEditingId(null)
    } catch (error) {
      console.error('Error updating integration:', error)
      alert('Failed to save integration settings')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      await integrationsAPI.update(id, { status: newStatus })
      await loadIntegrations()
    } catch (error) {
      console.error('Error toggling status:', error)
      alert('Failed to toggle status')
    }
  }

  const testIntegration = async (id: string, name: string) => {
    try {
      // TODO: Implement actual API test
      alert(`Testing ${name} integration...`)
      // const result = await integrationsAPI.test(id)
      // if (result.success) {
      //   alert('✅ Integration test successful!')
      // } else {
      //   alert('❌ Integration test failed!')
      // }
    } catch (error) {
      console.error('Error testing integration:', error)
      alert('Failed to test integration')
    }
  }

  const getIntegrationIcon = (name: string) => {
    const icons: any = {
      ahrefs: '🔗',
      moz: '📊',
      openai: '🤖',
      scraperapi: '🕷️',
      stripe: '💳',
      sendgrid: '📧'
    }
    return icons[name?.toLowerCase()] || '⚙️'
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (!limit) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
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
                <Link href="/admin/activity" className="text-gray-300 hover:text-white transition">
                  Activity
                </Link>
                <Link href="/admin/integrations" className="text-[#ff6b00] font-bold">
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
              🔌 API <span className="text-[#ff6b00]">Integrations</span>
            </h1>
            <p className="text-gray-400">Manage external API connections and services</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-[#ff6b00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading integrations...</p>
            </div>
          ) : integrations.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">🔌</div>
              <p className="text-gray-400">No integrations configured yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {integrations.map((integration) => {
                const usagePercentage = getUsagePercentage(
                  integration.requests_used || 0, 
                  integration.rate_limit || 100
                )

                return (
                  <div
                    key={integration.id}
                    className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{getIntegrationIcon(integration.name)}</div>
                        <div>
                          <h3 className="text-2xl font-bold capitalize">
                            {integration.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-gray-800 rounded-full h-2 w-32">
                              <div 
                                className={`h-2 rounded-full transition-all ${getUsageColor(usagePercentage)}`}
                                style={{ width: `${usagePercentage}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-500">
                              {integration.requests_used || 0} / {integration.rate_limit || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleStatus(integration.id, integration.status)}
                        className={`px-4 py-2 rounded font-medium transition ${
                          integration.status === 'active'
                            ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50 border border-green-600/30'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {integration.status === 'active' ? '✓ Active' : '○ Inactive'}
                      </button>
                    </div>

                    {/* Edit Form */}
                    {editingId === integration.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">API Key</label>
                          <input
                            type="password"
                            value={formData.api_key}
                            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                            className="w-full px-4 py-2 bg-black border border-gray-700 rounded focus:border-[#ff6b00] focus:outline-none transition"
                            placeholder="Enter API key..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Rate Limit (per day)</label>
                          <input
                            type="number"
                            value={formData.rate_limit}
                            onChange={(e) => setFormData({ ...formData, rate_limit: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 bg-black border border-gray-700 rounded focus:border-[#ff6b00] focus:outline-none transition"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleSave(integration.id)}
                            disabled={saving}
                            className="flex-1 bg-[#ff6b00] hover:bg-red-600 text-black font-bold py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {saving ? '💾 Saving...' : '💾 Save Changes'}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={saving}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded transition disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-gray-800">
                          <span className="text-gray-400">API Key</span>
                          <span className="text-sm font-mono">
                            {integration.api_key 
                              ? '••••••••••••' + integration.api_key.slice(-4) 
                              : <span className="text-gray-600">Not set</span>
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-800">
                          <span className="text-gray-400">Rate Limit</span>
                          <span className="text-sm font-medium">
                            {integration.rate_limit || 0}/day
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-gray-400">Last Sync</span>
                          <span className="text-sm">
                            {integration.last_sync_at 
                              ? new Date(integration.last_sync_at).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Never'}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(integration)}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded transition font-medium"
                          >
                            ⚙️ Configure
                          </button>
                          <button
                            onClick={() => testIntegration(integration.id, integration.name)}
                            className="flex-1 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-600/30 py-2 rounded transition font-medium"
                          >
                            🧪 Test
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {integration.last_error && (
                      <div className="mt-4 p-3 bg-red-900/20 border border-red-600/30 rounded text-sm text-red-400">
                        <div className="font-semibold mb-1">⚠️ Last Error</div>
                        {integration.last_error}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
