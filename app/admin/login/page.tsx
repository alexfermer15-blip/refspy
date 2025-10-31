// app/admin/login/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isAdmin = (email: string) => {
    return email === 'admin@refspy.com' || 
           email.includes('admin') ||
           email.endsWith('@refspy.com')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Проверка прав админа ДО входа
      if (!isAdmin(email)) {
        setError('❌ Access denied: Admin email required')
        setLoading(false)
        return
      }

      // Вход через Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      // Успешный вход - перенаправление в админку
      router.push('/admin')
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-4xl font-bold">
              Ref<span className="text-[#ff6b00]">Spy</span>
            </h1>
          </Link>
          <div className="text-6xl mb-4">🛡️</div>
          <h2 className="text-3xl font-bold mb-2">
            Admin <span className="text-[#ff6b00]">Portal</span>
          </h2>
          <p className="text-gray-400">Enter your administrator credentials</p>
        </div>

        {/* Login Form */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-red-600/30 rounded-lg p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 focus:outline-none transition"
                placeholder="admin@refspy.com"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 focus:outline-none transition"
                placeholder="••••••••••"
                required
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-600/30 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#ff6b00] to-red-600 hover:from-red-600 hover:to-[#ff6b00] text-black font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                '🔐 Login as Admin'
              )}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-gray-400 hover:text-[#ff6b00] transition"
            >
              ← Back to Homepage
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔒</div>
            <div className="flex-1">
              <div className="font-semibold text-sm mb-1">Secure Admin Access</div>
              <p className="text-xs text-gray-500">
                This area is restricted to authorized administrators only. 
                All login attempts are monitored and logged.
              </p>
            </div>
          </div>
        </div>

        {/* Test Credentials (Remove in production!) */}
        <div className="mt-6 p-4 bg-yellow-900/10 border border-yellow-600/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-yellow-400 mb-1">
                Test Credentials
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Email: <code className="bg-black px-2 py-0.5 rounded">admin@refspy.com</code></p>
                <p>Password: <code className="bg-black px-2 py-0.5 rounded">your-password</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
