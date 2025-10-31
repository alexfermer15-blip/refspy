'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/lib/auth-context'
import { paymentsAPI } from '@/lib/supabase'

export default function AdminPayments() {
  const { user } = useAuth()
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    // Проверка прав админа
    if (user && !isAdmin(user)) {
      router.push('/dashboard')
      return
    }

    if (user) {
      loadPayments()
    }
  }, [user])

  const isAdmin = (user: any) => {
    return user?.email === 'admin@refspy.com' || 
           user?.user_metadata?.role === 'admin' ||
           user?.email?.includes('admin')
  }

  const loadPayments = async () => {
    try {
      setLoading(true)
      const [paymentsData, statsData] = await Promise.all([
        paymentsAPI.getAll().catch(() => []),
        paymentsAPI.getStats().catch(() => ({
          total: 0,
          monthlyRevenue: 0,
          successful: 0,
          pending: 0,
          failed: 0
        }))
      ])
      setPayments(paymentsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    const headers = ['Date', 'User', 'Email', 'Plan', 'Amount', 'Status', 'Method', 'Transaction ID']
    const rows = filteredPayments.map(p => [
      new Date(p.created_at).toLocaleDateString(),
      p.users?.name || 'N/A',
      p.users?.email || 'N/A',
      p.plan || 'N/A',
      p.amount,
      p.status,
      p.payment_method || 'Card',
      p.stripe_payment_id || 'N/A'
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter
    const matchesSearch = 
      payment.users?.email?.toLowerCase().includes(search.toLowerCase()) ||
      payment.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
      payment.stripe_payment_id?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'completed':
        return 'bg-green-900/30 text-green-400 border-green-600/30'
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-600/30'
      case 'failed':
        return 'bg-red-900/30 text-red-400 border-red-600/30'
      case 'refunded':
        return 'bg-gray-700 text-gray-400 border-gray-600/30'
      default:
        return 'bg-gray-700 text-gray-400'
    }
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
                <Link href="/admin/payments" className="text-[#ff6b00] font-bold">
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
              💳 Payment <span className="text-[#ff6b00]">Management</span>
            </h1>
            <p className="text-gray-400">Track payments, subscriptions, and revenue</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-[#ff6b00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading payments...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-green-600 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-400 text-sm">Total Revenue</div>
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="text-3xl font-bold text-green-400">
                      ${stats.total.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">All time</div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-yellow-600 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-400 text-sm">Monthly Revenue</div>
                      <span className="text-2xl">📈</span>
                    </div>
                    <div className="text-3xl font-bold text-yellow-400">
                      ${stats.monthlyRevenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">This month</div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-[#ff6b00] transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-400 text-sm">Successful</div>
                      <span className="text-2xl">✅</span>
                    </div>
                    <div className="text-3xl font-bold text-[#ff6b00]">{stats.successful || 0}</div>
                    <div className="text-xs text-gray-500 mt-1">Completed payments</div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-red-600 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-400 text-sm">Issues</div>
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <div className="text-3xl font-bold text-red-400">
                      {(stats.pending || 0) + (stats.failed || 0)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Pending/Failed</div>
                  </div>
                </div>
              )}

              {/* Search & Filters */}
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="🔍 Search by user, email, or transaction ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:border-[#ff6b00] focus:outline-none transition"
                    />
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    {['all', 'succeeded', 'pending', 'failed', 'refunded'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded transition ${
                          filter === status
                            ? 'bg-[#ff6b00] text-black font-bold'
                            : 'bg-black hover:bg-gray-800 text-gray-400'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={exportCSV}
                    className="px-4 py-2 bg-[#ff6b00] hover:bg-red-600 text-black font-bold rounded transition whitespace-nowrap"
                  >
                    📥 Export CSV
                  </button>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Showing {filteredPayments.length} of {payments.length} payments
                </div>
              </div>

              {/* Payments Table */}
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-black/50 border-b border-gray-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Transaction ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-black/50 transition">
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            {new Date(payment.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-white">
                                {payment.users?.name || 'No name'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.users?.email || 'No email'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs font-medium rounded">
                              {payment.plan || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-green-400 font-bold text-lg">
                              ${Number(payment.amount || 0).toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              {payment.currency || 'USD'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 border rounded text-xs font-medium ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {payment.payment_method || 'Card'}
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs text-gray-500 bg-black px-2 py-1 rounded">
                              {payment.stripe_payment_id?.substring(0, 20) || 'N/A'}...
                            </code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredPayments.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">💸</div>
                    <p>No payments found</p>
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
