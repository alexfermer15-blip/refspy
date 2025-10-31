'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // ✅ Регистрация через Supabase Auth (БЕЗ вставки в public.users)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: 'user'
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      console.log('✅ User registered successfully:', authData.user.id)
      
      // Успешная регистрация - перенаправление
      router.push('/dashboard')
      
    } catch (err: any) {
      console.error('❌ Registration error:', err)
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
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
            ● CLASSIFIED • TOP SECRET
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-red-900/30 rounded-lg p-8 shadow-2xl hover-glow">
          <div className="mb-6">
            <div className="text-xs text-[#ff6b00] font-bold tracking-widest mb-2">
              ▸ REQUEST CLEARANCE
            </div>
            <h1 className="text-2xl font-bold">CREATE AGENT PROFILE</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm animate-slide-up">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/50 border border-gray-800 rounded px-4 py-3 text-white focus:outline-none focus:border-[#ff6b00] transition hover-lift"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-gray-800 rounded px-4 py-3 text-white focus:outline-none focus:border-[#ff6b00] transition hover-lift"
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
                className="w-full bg-black/50 border border-gray-800 rounded px-4 py-3 text-white focus:outline-none focus:border-[#ff6b00] transition hover-lift"
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#ff6b00] to-red-600 hover:from-red-600 hover:to-[#ff6b00] text-black font-bold py-3 rounded transition disabled:opacity-50 hover-lift flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                  PROCESSING...
                </>
              ) : (
                'REQUEST ACCESS →'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have clearance?{' '}
            <Link href="/sign-in" className="text-[#ff6b00] hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
