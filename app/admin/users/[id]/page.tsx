'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/lib/auth-context'
import { usersAPI, activityLogsAPI, paymentsAPI } from '@/lib/supabase'

export default function UserDetailPage() {
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    // Проверка прав админа
    if (currentUser && !isAdmin(currentUser)) {
      router.push('/dashboard')
      return
    }

    if (currentUser) {
      loadUserData()
    }
  }, [userId, currentUser])

  const isAdmin = (user: any) => {
    return user?.email === 'admin@refspy.com' || 
           user?.user_metadata?.role === 'admin' ||
           user?.email?.includes('admin')
  }

  const loadUserData = async () => {
    try {
      setLoading(true)
      const [userData, activityData, paymentsData] = await Promise.all([
        usersAPI.getById(userId).catch(() => null),
        activityLogsAPI.getByUser(userId).catch(() => []),
        paymentsAPI.getByUser(userId).catch(() => [])
      ])
      setUser(userData)
      setActivity(activityData)
      setPayments(paymentsData)
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (updates: any) => {
    try {
      setUpdating(true)
      await usersAPI.update(userId, updates)
      await loadUserData()
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    } finally {
      setUpdating(false)
    }
  }

  const deleteUser = async () => {
    if (!confirm('⚠️ Are you sure you want to DELETE this user? This action CANNOT be undone!')) {
      return
    }

    try {
      setUpdating(true)
      await usersAPI.delete(userId)
      router.push('/admin/users')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
      setUpdating(false)
    }
  }

  if (!currentUser || !isAdmin(currentUser)) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ff6b00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
            <p className="text-gray-400 mb-4">The user you're looking for doesn't exist</p>
            <Link href="/admin/users" className="text-[#ff6b00] hover:underline">
              ← Back to Users
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const totalSpent = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)

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
          {/* Back Button */}
          <Link 
            href="/admin/users" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Users
          </Link>

          {/* User Header */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#ff6b00] to-red-600 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-1">
                      {user.name || 'No Name'}
                    </h1>
                    <p className="text-gray-400 text-lg">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-900/30 text-green-400 border border-green-600/30' 
                          : 'bg-red-900/30 text-red-400 border border-red-600/30'
                      }`}>
                        {user.status || 'active'}
                      </span>
                      <span className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-600/30 rounded text-sm font-medium">
                        {user.plan || 'free'} plan
                      </span>
                      {user.role === 'admin' && (
                        <span className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-600/30 rounded text-sm font-medium">
                          🛡️ Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Member since</div>
                <div className="font-medium text-lg">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-800">
              <button
                onClick={() => {
                  const newPlan = prompt('Enter new plan (free/starter/pro/agency):', user.plan)
                  if (newPlan) updateUser({ plan: newPlan })
                }}
                disabled={updating}
                className="px-4 py-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded transition disabled:opacity-50"
              >
                Change Plan
              </button>
              <button
                onClick={() => {
                  const newCredits = prompt('Enter new credits amount:', user.credits)
                  if (newCredits) updateUser({ credits: parseInt(newCredits) })
                }}
                disabled={updating}
                className="px-4 py-2 bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-400 rounded transition disabled:opacity-50"
              >
                Add Credits
              </button>
              <button
                onClick={() => updateUser({ 
                  status: user.status === 'active' ? 'suspended' : 'active' 
                })}
                disabled={updating}
                className="px-4 py-2 bg-orange-900/30 hover:bg-orange-900/50 text-orange-400 rounded transition disabled:opacity-50"
              >
                {user.status === 'active' ? 'Suspend' : 'Activate'}
              </button>
              <button
                onClick={deleteUser}
                disabled={updating}
                className="ml-auto px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition disabled:opacity-50"
              >
                🗑️ Delete User
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-[#ff6b00] transition">
              <div className="text-gray-400 text-sm mb-2">API Usage</div>
              <div className="text-3xl font-bold text-[#ff6b00] mb-2">
                {user.api_calls_used || 0}/{user.api_calls_limit || 100}
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-[#ff6b00] h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(((user.api_calls_used || 0) / (user.api_calls_limit || 100)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-yellow-600 transition">
              <div className="text-gray-400 text-sm mb-2">Credits</div>
              <div className="text-3xl font-bold text-yellow-400">{user.credits || 0}</div>
              <div className="text-xs text-gray-500 mt-1">Available balance</div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-green-600 transition">
              <div className="text-gray-400 text-sm mb-2">Total Spent</div>
              <div className="text-3xl font-bold text-green-400">${totalSpent.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-1">{payments.length} payments</div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-blue-600 transition">
              <div className="text-gray-400 text-sm mb-2">Last Login</div>
              <div className="text-lg font-bold text-blue-400">
                {user.last_login_at 
                  ? new Date(user.last_login_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'Never'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {user.last_login_at 
                  ? new Date(user.last_login_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'No login recorded'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                📝 Recent Activity
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activity.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p>No activity yet</p>
                  </div>
                ) : (
                  activity.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-start justify-between p-3 bg-black/50 rounded border border-gray-800/50 hover:border-gray-700 transition"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white">{log.action}</div>
                        {log.resource_type && (
                          <div className="text-xs text-gray-500 mt-1">
                            {log.resource_type} • {log.resource_id?.substring(0, 8)}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        {new Date(log.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                💳 Payment History
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {payments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">💸</div>
                    <p>No payments yet</p>
                  </div>
                ) : (
                  payments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-3 bg-black/50 rounded border border-gray-800/50 hover:border-gray-700 transition"
                    >
                      <div>
                        <div className="font-medium text-green-400 text-lg">
                          ${Number(payment.amount || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.plan || 'Unknown'} • {payment.billing_period || 'One-time'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs px-2 py-1 rounded font-medium ${
                          payment.status === 'succeeded' || payment.status === 'completed'
                            ? 'bg-green-900/30 text-green-400'
                            : payment.status === 'pending'
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : 'bg-red-900/30 text-red-400'
                        }`}>
                          {payment.status}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(payment.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
