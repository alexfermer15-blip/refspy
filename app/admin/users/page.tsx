'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/lib/auth-context'
import { usersAPI } from '@/lib/supabase'

export default function AdminUsers() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    // Проверка прав админа
    if (user && !isAdmin(user)) {
      router.push('/dashboard')
      return
    }

    if (user) {
      loadUsers()
    }
  }, [user])

  const isAdmin = (user: any) => {
    return user?.email === 'admin@refspy.com' || 
           user?.user_metadata?.role === 'admin' ||
           user?.email?.includes('admin')
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await usersAPI.getAll()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      setUpdating(userId)
      await usersAPI.update(userId, { status })
      await loadUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user status')
    } finally {
      setUpdating(null)
    }
  }

  const updateUserPlan = async (userId: string, plan: string) => {
    try {
      setUpdating(userId)
      await usersAPI.update(userId, { plan })
      await loadUsers()
    } catch (error) {
      console.error('Error updating plan:', error)
      alert('Failed to update user plan')
    } finally {
      setUpdating(null)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setUpdating(userId)
      await usersAPI.delete(userId)
      await loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    } finally {
      setUpdating(null)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.status === filter || user.plan === filter
    const matchesSearch = user.email?.toLowerCase().includes(search.toLowerCase()) || 
                         (user.name && user.name?.toLowerCase().includes(search.toLowerCase()))
    return matchesFilter && matchesSearch
  })

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
                <Link href="/admin/users" className="text-[#ff6b00] font-bold">
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
              👥 User <span className="text-[#ff6b00]">Management</span>
            </h1>
            <p className="text-gray-400">Manage users, plans, and access control</p>
          </div>

          {/* Filters */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="🔍 Search by email or name..."
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
                <option value="all">All Users ({users.length})</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="free">Free Plan</option>
                <option value="starter">Starter Plan</option>
                <option value="pro">Pro Plan</option>
                <option value="agency">Agency Plan</option>
              </select>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-[#ff6b00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading users...</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/50 border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        API Usage
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredUsers.map((userData) => (
                      <tr 
                        key={userData.id} 
                        className={`hover:bg-black/50 transition ${updating === userData.id ? 'opacity-50' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">
                              {userData.name || 'No name'}
                            </div>
                            <div className="text-sm text-gray-400">{userData.email}</div>
                            {userData.role === 'admin' && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-red-900/30 text-red-400 text-xs rounded font-medium">
                                🛡️ Admin
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={userData.plan || 'free'}
                            onChange={(e) => updateUserPlan(userData.id, e.target.value)}
                            disabled={updating === userData.id}
                            className="px-3 py-1.5 bg-black border border-gray-700 rounded text-sm focus:border-[#ff6b00] focus:outline-none transition disabled:opacity-50"
                          >
                            <option value="free">Free</option>
                            <option value="starter">Starter</option>
                            <option value="pro">Pro</option>
                            <option value="agency">Agency</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={userData.status || 'active'}
                            onChange={(e) => updateUserStatus(userData.id, e.target.value)}
                            disabled={updating === userData.id}
                            className={`px-3 py-1.5 rounded text-sm font-medium focus:outline-none transition disabled:opacity-50 ${
                              userData.status === 'active' 
                                ? 'bg-green-900/30 text-green-400 border border-green-600/30' 
                                : 'bg-red-900/30 text-red-400 border border-red-600/30'
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="banned">Banned</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-800 rounded-full h-2 min-w-[60px]">
                              <div 
                                className="bg-[#ff6b00] h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${Math.min(((userData.api_calls_used || 0) / (userData.api_calls_limit || 100)) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {userData.api_calls_used || 0}/{userData.api_calls_limit || 100}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-yellow-400">
                            {userData.credits || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(userData.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/users/${userData.id}`}
                              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm transition"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => deleteUser(userData.id)}
                              disabled={updating === userData.id}
                              className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded text-sm transition disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">👤</div>
                  <p>No users found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

