'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!supabase) {
      console.error('❌ Supabase client not initialized')
      toast.error('System error: Supabase not configured')
    } else {
      console.log('✅ Supabase client initialized successfully')
    }
  }, [])

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Agent Name is required')
      toast.error('Agent Name is required')
      return false
    }

    if (!email.trim()) {
      setError('Email is required')
      toast.error('Email is required')
      return false
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email')
      toast.error('Please enter a valid email')
      return false
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      toast.error('Password must be at least 6 characters')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    setLoading(true)
    console.log('🚀 Starting registration process...')

    try {
      console.log('📧 Attempting to sign up with:', { email, name })

      // ✅ Регистрация через Supabase Auth - БЕЗ redirectTo
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
            role: 'user'
          }
        }
      })

      console.log('📊 Supabase response:', { authData, authError })

      if (authError) {
        console.error('❌ Auth error:', authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create user account - no user returned')
      }

      console.log('✅ User registered successfully!')
      console.log('👤 User ID:', authData.user.id)
      console.log('📧 User email:', authData.user.email)

      toast.success('Account created! Check your email to verify.')

      setTimeout(() => {
        console.log('🔄 Redirecting to sign-in page...')
        router.push('/sign-in')
      }, 1500)

    } catch (err: any) {
      console.error('❌ Registration error:', err)
      console.error('Error type:', err?.constructor?.name)
      console.error('Error message:', err?.message)
      console.error('Error details:', err)

      let errorMessage = 'Registration failed. Please try again.'

      if (err.message) {
        errorMessage = err.message
      }

      if (err.message?.includes('already registered')) {
        errorMessage = 'This email is already registered. Please sign in or use a different email.'
      }
      if (err.message?.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address'
      }
      if (err.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      }

      setError(errorMessage)
      toast.error(errorMessage)
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

        <div className="bg-gradient-to-br from-gray-900 to-black border border-red-900/30 rounded-lg p-8 shadow-2xl">
          <div className="mb-6">
            <div className="text-xs text-[#ff6b00] font-bold tracking-widest mb-2">
              ▸ REQUEST CLEARANCE
            </div>
            <h1 className="text-2xl font-bold">CREATE AGENT PROFILE</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm animate-slide-up flex items-start gap-2">
              <span className="text-red-500 flex-shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
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
                className="w-full bg-black/50 border border-gray-800 rounded px-4 py-3 text-white focus:outline-none focus:border-[#ff6b00] transition disabled:opacity-50 placeholder-gray-700"
                placeholder="John Doe"
                required
                disabled={loading}
                autoComplete="name"
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
                className="w-full bg-black/50 border border-gray-800 rounded px-4 py-3 text-white focus:outline-none focus:border-[#ff6b00] transition disabled:opacity-50 placeholder-gray-700"
                placeholder="agent@refspy.com"
                required
                disabled={loading}
                autoComplete="email"
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
                className="w-full bg-black/50 border border-gray-800 rounded px-4 py-3 text-white focus:outline-none focus:border-[#ff6b00] transition disabled:opacity-50 placeholder-gray-700"
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="new-password"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#ff6b00] to-red-600 hover:from-red-600 hover:to-[#ff6b00] text-black font-bold py-3 rounded transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></div>
                  <span>PROCESSING...</span>
                </>
              ) : (
                <>
                  <span>REQUEST ACCESS</span>
                  <span>→</span>
                </>
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
