'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-black/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-white hover:opacity-80 transition">
          Ref<span className="text-[#ff6b00]">Spy</span>
        </Link>
        
        {/* Navigation */}
        <nav className="hidden md:flex gap-8">
          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/analyze" className="text-gray-400 hover:text-white transition-colors">
                Analyze
              </Link>
              <Link href="/projects" className="text-gray-400 hover:text-white transition-colors">
                Projects
              </Link>
            </>
          ) : (
            <>
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                Features
              </a>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <a href="#about" className="text-gray-400 hover:text-white transition-colors">
                About
              </a>
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* User Info - Desktop */}
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {user.user_metadata?.name || 'Agent'}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b00] to-red-600 rounded-full flex items-center justify-center font-bold text-white">
                  {(user.user_metadata?.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition text-sm font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              {/* Guest Buttons */}
              <Link
                href="/sign-in"
                className="text-gray-400 hover:text-white transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-[#ff6b00] hover:bg-[#cc5500] text-white px-6 py-2 rounded-lg transition-all transform hover:scale-105 font-semibold"
              >
                Start Free Trial
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
