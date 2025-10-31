'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@supabase/ssr'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Создаём Supabase клиент
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('🔐 Starting login for:', email)

    try {
      // Вход через Supabase напрямую
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('❌ Login error:', signInError)
        toast.error(signInError.message || 'Invalid credentials')
        setError(signInError.message || 'Invalid credentials')
        setLoading(false)
        return
      }

      if (!data || !data.user) {
        console.error('❌ No user data received')
        toast.error('Login failed - no user data')
        setError('Login failed')
        setLoading(false)
        return
      }

      console.log('✅ Login successful! User ID:', data.user.id)

      // Получаем данные пользователя из таблицы users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, name')
        .eq('id', data.user.id)
        .single()

      if (userError) {
        console.warn('⚠️ Could not fetch user data:', userError.message)
      }

      // Сохраняем в localStorage
      const userInfo = {
        id: data.user.id,
        email: data.user.email,
        name: userData?.name || data.user.user_metadata?.name || email.split('@')[0],
        role: userData?.role || 'user'
      }

      localStorage.setItem('user', JSON.stringify(userInfo))

      toast.success('✅ Access granted! Redirecting...')

      // Перенаправляем в зависимости от роли
      setTimeout(() => {
        if (userData?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
        router.refresh()
      }, 500)

    } catch (err: any) {
      console.error('❌ Unexpected error:', err)
      toast.error('Connection failed. Please try again.')
      setError(err.message || 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold hover:opacity-80 transition">
            Ref<span className="text-[#ff6b00]">Spy</span>
          </Link>
          <p className="text-sm text-red-500 mt-2 font-mono tracking-wider">
            ● CLASSIFIED • ACCESS RESTRICTED
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-red-900/30 rounded-lg p-8 shadow-2xl hover-glow">
          <div className="mb-6">
            <div className="text-xs text-[#ff6b00] font-bold tracking-widest mb-2">
              ▸ ACCESS CONTROL
            </div>
            <h1 className="text-2xl font-bold">AGENT LOGIN</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm animate-slide-up">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-black/50 border border-gray-800 rounded px-4 py-3 text-white focus:outline-none focus:border-[#ff6b00] transition hover-lift disabled:opacity-50"
                placeholder="agent@refspy.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-black/50 border border-gray-800 rounded px-4 py-3 text-white focus:outline-none focus:border-[#ff6b00] transition hover-lift disabled:opacity-50"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#ff6b00] to-red-600 hover:from-red-600 hover:to-[#ff6b00] text-black font-bold py-3 rounded transition disabled:opacity-50 hover-lift flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                  AUTHENTICATING...
                </>
              ) : (
                'ENTER SYSTEM →'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Need clearance?{' '}
            <Link href="/sign-up" className="text-[#ff6b00] hover:underline font-semibold">
              Request Access
            </Link>
          </div>
        </div>

        {/* Debug Info (удалите в продакшене) */}
        <div className="mt-4 p-3 bg-gray-900 border border-gray-800 rounded text-xs text-gray-500 text-center">
          <div>✓ Using Supabase Auth</div>
          <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</div>
          <div>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</div>
        </div>
      </div>
    </div>
  )
}
