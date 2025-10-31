'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';

const navigation = {
  public: [
    { name: { EN: 'Home', RU: 'Главная' }, href: '/' },
    { name: { EN: 'Features', RU: 'Возможности' }, href: '/features' },
    { name: { EN: 'Pricing', RU: 'Тарифы' }, href: '/pricing' },
    { name: { EN: 'Help', RU: 'Помощь' }, href: '/help' },
    { name: { EN: 'About', RU: 'О нас' }, href: '/about' },
  ],
  dashboard: [
    { name: { EN: 'Dashboard', RU: 'Панель' }, href: '/dashboard', icon: '📊' },
    { name: { EN: 'Projects', RU: 'Проекты' }, href: '/projects', icon: '📁' },
    { name: { EN: 'Rank Tracker', RU: 'Трекер Позиций' }, href: '/dashboard/rank-tracker', icon: '📈' },
    { name: { EN: 'AI Plans', RU: 'AI Планы' }, href: '/dashboard/ai-plans', icon: '🤖' },
    { name: { EN: 'Analysis', RU: 'Анализ' }, href: '/analyze', icon: '🔍' },
  ],
};

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { user, loading, signOut } = useAuth();

  const isActive = (path: string) => pathname === path;
  const isPublic = !pathname?.startsWith('/dashboard') && !pathname?.startsWith('/admin') && !pathname?.startsWith('/rank-tracker') && !pathname?.startsWith('/projects') && !pathname?.startsWith('/analyze');
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/projects') || pathname?.startsWith('/rank-tracker') || pathname?.startsWith('/analyze');
  const isHomePage = pathname === '/';

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all ${
      isHomePage 
        ? 'bg-transparent' 
        : 'bg-black/95 backdrop-blur-sm border-b border-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Ref</span>
            <span className="text-2xl font-bold text-white">Spy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Public Links */}
            {isPublic && navigation.public.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition font-medium ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-brand-text-gray hover:text-white'
                }`}
              >
                {link.name[language]}
              </Link>
            ))}

            {/* Dashboard Links */}
            {isDashboard && navigation.dashboard.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 transition font-medium ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-brand-text-gray hover:text-white'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.name[language]}</span>
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center space-x-2 bg-brand-gray rounded-lg p-1">
              <button
                onClick={() => setLanguage('EN')}
                className={`px-2 py-1 rounded transition font-medium text-sm ${
                  language === 'EN'
                    ? 'bg-primary text-white'
                    : 'text-brand-text-gray hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('RU')}
                className={`px-2 py-1 rounded transition font-medium text-sm ${
                  language === 'RU'
                    ? 'bg-primary text-white'
                    : 'text-brand-text-gray hover:text-white'
                }`}
              >
                RU
              </button>
            </div>

            {/* Auth Buttons */}
            {!loading && (
              <>
                {user ? (
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-gray hover:bg-gray-700 transition">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-white text-sm">{user.email}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-brand-gray border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <Link href="/dashboard" className="block px-4 py-2 text-white hover:bg-gray-700 rounded-t-lg">
                        📊 {language === 'EN' ? 'Dashboard' : 'Панель'}
                      </Link>
                      <Link href="/settings" className="block px-4 py-2 text-white hover:bg-gray-700">
                        ⚙️ {language === 'EN' ? 'Settings' : 'Настройки'}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-primary hover:bg-gray-700 rounded-b-lg"
                      >
                        🚪 {language === 'EN' ? 'Sign Out' : 'Выйти'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-white hover:text-primary transition font-medium"
                    >
                      {language === 'EN' ? 'Sign In' : 'Войти'}
                    </Link>
                    <Link
                      href="/sign-up"
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition font-medium"
                    >
                      {language === 'EN' ? 'Start Free Trial' : 'Начать бесплатно'}
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-primary p-2"
          >
            <span className="text-2xl">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/98 border-t border-gray-800">
          <div className="px-4 py-4 space-y-4">
            {isPublic && navigation.public.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 font-medium ${
                  isActive(link.href) ? 'text-primary' : 'text-brand-text-gray'
                }`}
              >
                {link.name[language]}
              </Link>
            ))}

            {isDashboard && navigation.dashboard.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 py-2 font-medium ${
                  isActive(link.href) ? 'text-primary' : 'text-brand-text-gray'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.name[language]}</span>
              </Link>
            ))}

            <div className="pt-4 border-t border-gray-800">
              <div className="text-sm text-brand-text-gray mb-2">
                {language === 'EN' ? 'Language:' : 'Язык:'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('EN')}
                  className={`px-3 py-1 rounded transition text-sm font-medium ${
                    language === 'EN'
                      ? 'bg-primary text-white'
                      : 'bg-brand-gray text-brand-text-gray'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('RU')}
                  className={`px-3 py-1 rounded transition text-sm font-medium ${
                    language === 'RU'
                      ? 'bg-primary text-white'
                      : 'bg-brand-gray text-brand-text-gray'
                  }`}
                >
                  RU
                </button>
              </div>
            </div>

            {!loading && (
              <div className="pt-4 border-t border-gray-800">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-white"
                    >
                      📊 {language === 'EN' ? 'Dashboard' : 'Панель'}
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-white"
                    >
                      ⚙️ {language === 'EN' ? 'Settings' : 'Настройки'}
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 text-primary"
                    >
                      🚪 {language === 'EN' ? 'Sign Out' : 'Выйти'}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-white"
                    >
                      {language === 'EN' ? 'Sign In' : 'Войти'}
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 bg-primary text-white text-center rounded-lg mt-2"
                    >
                      {language === 'EN' ? 'Start Free Trial' : 'Начать бесплатно'}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
