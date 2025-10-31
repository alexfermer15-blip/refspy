'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/lib/auth-context'
import { 
  usersAPI, 
  paymentsAPI, 
  projectsAPI, 
  activityLogsAPI 
} from '@/lib/supabase'

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Проверка прав админа
    if (user && !isAdmin(user)) {
      router.push('/dashboard')
      return
    }

    if (user) {
      loadDashboardData()
    }
  }, [user])

  const isAdmin = (user: any) => {
    // Проверяем email админа или роль
    return user?.email === 'admin@refspy.com' || 
           user?.user_metadata?.role === 'admin' ||
           user?.email?.includes('admin')
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      const [usersData, paymentsData, projectsData, activityData] = await Promise.all([
        usersAPI.getAll().catch(() => []),
        paymentsAPI.getStats().catch(() => ({ total: 0, monthlyRevenue: 0 })),
        projectsAPI.getAll().catch(() => []),
        activityLogsAPI.getRecent(10).catch(() => [])
      ])

      setStats({
        totalUsers: usersData?.length || 0,
        activeUsers: usersData?.filter((u: any) => u.status === 'active')?.length || 0,
        totalProjects: projectsData?.length || 0,
        totalRevenue: paymentsData?.total || 0,
        monthlyRevenue: paymentsData?.monthlyRevenue || 0
      })

      setRecentActivity(activityData || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || !isAdmin(user)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">You don't have permission to access this page</p>
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
                <Link href="/admin" className="text-[#ff6b00] font-bold">
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
              🛡️ Admin <span className="text-[#ff6b00]">Dashboard</span>
            </h1>
            <p className="text-gray-400">Monitor and manage your RefSpy platform</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-[#ff6b00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading admin dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <Link href="/admin/users">
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-[#ff6b00] transition cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Total Users</span>
                      <span className="text-2xl group-hover:scale-110 transition">👥</span>
                    </div>
                    <div className="text-3xl font-bold text-[#ff6b00]">{stats.totalUsers}</div>
                    <div className="text-xs text-gray-500 mt-1">{stats.activeUsers} active</div>
                  </div>
                </Link>

                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Projects</span>
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-400">{stats.totalProjects}</div>
                  <div className="text-xs text-gray-500 mt-1">Total created</div>
                </div>

                <Link href="/admin/payments">
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-[#ff6b00] transition cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Total Revenue</span>
                      <span className="text-2xl group-hover:scale-110 transition">💰</span>
                    </div>
                    <div className="text-3xl font-bold text-green-400">
                      ${stats.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">All time</div>
                  </div>
                </Link>

                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Monthly Revenue</span>
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="text-3xl font-bold text-yellow-400">
                    ${stats.monthlyRevenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">This month</div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">System Status</span>
                    <span className="text-2xl">🟢</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">Online</div>
                  <div className="text-xs text-gray-500 mt-1">All systems operational</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">📝 Recent Activity</h2>
                  <Link href="/admin/activity" className="text-[#ff6b00] hover:underline text-sm">
                    View All →
                  </Link>
                </div>

                {recentActivity.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p>No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((log) => (
                      <div 
                        key={log.id}
                        className="flex items-center justify-between p-4 bg-black/50 rounded-lg hover:bg-black/70 transition border border-gray-800/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 bg-[#ff6b00] rounded-full animate-pulse"></div>
                          <div>
                            <div className="font-medium">
                              {log.users?.email || 'System'} • <span className="text-[#ff6b00]">{log.action}</span>
                            </div>
                            {log.resource_type && (
                              <div className="text-xs text-gray-500">
                                {log.resource_type} #{log.resource_id?.substring(0, 8)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
