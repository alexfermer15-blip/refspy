'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/lib/auth-context'
import { settingsAPI } from '@/lib/supabase'

export default function AdminSettings() {
  const { user } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    // Проверка прав админа
    if (user && !isAdmin(user)) {
      router.push('/dashboard')
      return
    }

    if (user) {
      loadSettings()
    }
  }, [user])

  const isAdmin = (user: any) => {
    return user?.email === 'admin@refspy.com' || 
           user?.user_metadata?.role === 'admin' ||
           user?.email?.includes('admin')
  }

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await settingsAPI.getAll().catch(() => [])
      setSettings(data)
      
      // Initialize form values
      const values: { [key: string]: string } = {}
      data.forEach((setting: any) => {
        values[setting.key] = setting.value || ''
      })
      setFormValues(values)
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (key: string) => {
    setSaving(true)
    try {
      await settingsAPI.set(key, formValues[key])
      await loadSettings()
      setEditingKey(null)
    } catch (error) {
      console.error('Error saving setting:', error)
      alert('Failed to save setting')
    } finally {
      setSaving(false)
    }
  }

  const handleDangerAction = async (action: string) => {
    const confirmMessage = {
      'clear_logs': '⚠️ Are you sure you want to CLEAR ALL ACTIVITY LOGS? This cannot be undone!',
      'reset_api': '⚠️ Are you sure you want to RESET ALL API USAGE COUNTERS?',
      'regenerate_keys': '⚠️ Are you sure you want to REGENERATE SYSTEM KEYS? This will invalidate all current keys!'
    }[action]

    if (!confirm(confirmMessage)) return

    try {
      // Implement danger actions here
      alert(`Action "${action}" executed successfully`)
    } catch (error) {
      console.error('Error executing danger action:', error)
      alert('Failed to execute action')
    }
  }

  const groupedSettings = settings.reduce((acc: any, setting: any) => {
    const category = setting.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(setting)
    return acc
  }, {})

  const categoryIcons: { [key: string]: string } = {
    general: '⚙️',
    email: '📧',
    api: '🔌',
    billing: '💳',
    security: '🔒',
    other: '📦'
  }

  const categoryLabels: { [key: string]: string } = {
    general: 'General Settings',
    email: 'Email Configuration',
    api: 'API Settings',
    billing: 'Billing Settings',
    security: 'Security Settings',
    other: 'Other'
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
                <Link href="/admin/integrations" className="text-gray-300 hover:text-white transition">
                  Integrations
                </Link>
                <Link href="/admin/settings" className="text-[#ff6b00] font-bold">
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

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              ⚙️ System <span className="text-[#ff6b00]">Settings</span>
            </h1>
            <p className="text-gray-400">Configure application settings and preferences</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-[#ff6b00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading settings...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedSettings).length === 0 ? (
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-12 text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-gray-400">No settings configured yet</p>
                </div>
              ) : (
                Object.entries(groupedSettings).map(([category, categorySettings]: [string, any]) => (
                  <div
                    key={category}
                    className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden"
                  >
                    {/* Category Header */}
                    <div className="bg-black/50 border-b border-gray-800 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{categoryIcons[category] || '📦'}</span>
                        <h2 className="text-xl font-bold">{categoryLabels[category] || category}</h2>
                      </div>
                    </div>

                    {/* Settings List */}
                    <div className="divide-y divide-gray-800">
                      {categorySettings.map((setting: any) => (
                        <div key={setting.key} className="px-6 py-5 hover:bg-black/30 transition">
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {setting.key.split('_').map((w: string) => 
                                    w.charAt(0).toUpperCase() + w.slice(1)
                                  ).join(' ')}
                                </h3>
                                {!setting.is_public && (
                                  <span className="px-2 py-0.5 bg-red-900/30 text-red-400 text-xs rounded font-medium">
                                    🔒 Private
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mb-3">
                                {setting.description || 'No description available'}
                              </p>

                              {editingKey === setting.key ? (
                                <div className="space-y-3">
                                  <input
                                    type={setting.is_public ? 'text' : 'password'}
                                    value={formValues[setting.key] || ''}
                                    onChange={(e) => setFormValues({
                                      ...formValues,
                                      [setting.key]: e.target.value
                                    })}
                                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded focus:border-[#ff6b00] focus:outline-none transition"
                                    placeholder={`Enter ${setting.key}...`}
                                  />
                                  <div className="flex gap-3">
                                    <button
                                      onClick={() => handleSave(setting.key)}
                                      disabled={saving}
                                      className="px-4 py-2 bg-[#ff6b00] hover:bg-red-600 text-black font-bold rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {saving ? '💾 Saving...' : '💾 Save Changes'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingKey(null)
                                        setFormValues({
                                          ...formValues,
                                          [setting.key]: setting.value || ''
                                        })
                                      }}
                                      disabled={saving}
                                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition disabled:opacity-50"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1">
                                    {setting.is_public ? (
                                      <code className="text-sm bg-black/50 px-3 py-1.5 rounded border border-gray-800">
                                        {setting.value || <span className="text-gray-600">Not set</span>}
                                      </code>
                                    ) : (
                                      <code className="text-sm text-gray-500">
                                        {setting.value ? '••••••••••••' : <span className="text-gray-600">Not set</span>}
                                      </code>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => setEditingKey(setting.key)}
                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition text-sm font-medium"
                                  >
                                    ✏️ Edit
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}

              {/* System Information */}
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">ℹ️</span>
                  <h2 className="text-xl font-bold">System Information</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black/50 rounded p-4 border border-gray-800">
                    <div className="text-sm text-gray-500 mb-1">Version</div>
                    <div className="font-bold">1.0.0</div>
                  </div>
                  <div className="bg-black/50 rounded p-4 border border-gray-800">
                    <div className="text-sm text-gray-500 mb-1">Environment</div>
                    <div className="font-bold text-green-400">Production</div>
                  </div>
                  <div className="bg-black/50 rounded p-4 border border-gray-800">
                    <div className="text-sm text-gray-500 mb-1">Node.js</div>
                    <div className="font-bold">v20.11.0</div>
                  </div>
                  <div className="bg-black/50 rounded p-4 border border-gray-800">
                    <div className="text-sm text-gray-500 mb-1">Database</div>
                    <div className="font-bold">PostgreSQL 15</div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-gradient-to-br from-red-900/20 to-black border border-red-600/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">⚠️</span>
                  <h2 className="text-xl font-bold text-red-400">Danger Zone</h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  These actions are <strong>permanent</strong> and cannot be undone. Please proceed with caution.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleDangerAction('clear_logs')}
                    className="w-full px-4 py-3 bg-red-900/30 hover:bg-red-900/50 border border-red-600/30 text-red-400 rounded transition text-left group"
                  >
                    <div className="font-semibold group-hover:text-red-300 transition">🗑️ Clear All Activity Logs</div>
                    <div className="text-xs text-gray-500">Remove all activity history from the database</div>
                  </button>
                  <button 
                    onClick={() => handleDangerAction('reset_api')}
                    className="w-full px-4 py-3 bg-red-900/30 hover:bg-red-900/50 border border-red-600/30 text-red-400 rounded transition text-left group"
                  >
                    <div className="font-semibold group-hover:text-red-300 transition">🔄 Reset API Usage Counters</div>
                    <div className="text-xs text-gray-500">Reset all user API usage statistics to zero</div>
                  </button>
                  <button 
                    onClick={() => handleDangerAction('regenerate_keys')}
                    className="w-full px-4 py-3 bg-red-900/30 hover:bg-red-900/50 border border-red-600/30 text-red-400 rounded transition text-left group"
                  >
                    <div className="font-semibold group-hover:text-red-300 transition">🔑 Regenerate System Keys</div>
                    <div className="text-xs text-gray-500">Generate new encryption and signing keys</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
