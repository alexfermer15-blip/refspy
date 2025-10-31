'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Header } from '@/components/Header'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { language, setLanguage } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [emailReports, setEmailReports] = useState(false)

  // 🌐 TRANSLATIONS
  const content = {
    EN: {
      title: 'Settings',
      subtitle: 'Manage your account settings and preferences',
      profile: 'Profile Information',
      fullName: 'Full Name',
      emailAddress: 'Email Address',
      emailReadonly: 'Email cannot be changed',
      languageSettings: 'Language Settings',
      interfaceLanguage: 'Interface Language',
      notificationsTitle: 'Notifications',
      positionAlerts: 'Position change alerts',
      positionAlertsDesc: 'Get notified when competitor positions change',
      weeklyReports: 'Weekly reports',
      weeklyReportsDesc: 'Receive weekly summary reports via email',
      save: 'Save Settings',
      saving: 'Saving...',
      saved: 'Settings saved successfully!',
      error: 'Error saving settings',
      signOut: 'Sign Out',
      confirmSignOut: 'Are you sure you want to sign out?'
    },
    RU: {
      title: 'Настройки',
      subtitle: 'Управляйте настройками аккаунта и предпочтениями',
      profile: 'Информация профиля',
      fullName: 'Полное имя',
      emailAddress: 'Email адрес',
      emailReadonly: 'Email нельзя изменить',
      languageSettings: 'Настройки языка',
      interfaceLanguage: 'Язык интерфейса',
      notificationsTitle: 'Уведомления',
      positionAlerts: 'Уведомления об изменении позиций',
      positionAlertsDesc: 'Получать уведомления при изменении позиций конкурентов',
      weeklyReports: 'Еженедельные отчёты',
      weeklyReportsDesc: 'Получать еженедельные отчёты на email',
      save: 'Сохранить настройки',
      saving: 'Сохранение...',
      saved: 'Настройки успешно сохранены!',
      error: 'Ошибка при сохранении настроек',
      signOut: 'Выйти',
      confirmSignOut: 'Вы уверены что хотите выйти?'
    }
  }

  const t = content[language]

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || '')
      setEmail(user.email || '')
    }
  }, [user])

  const saveSettings = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name }
      })

      if (error) throw error

      // Save notification preferences to localStorage
      localStorage.setItem('notifications', JSON.stringify(notifications))
      localStorage.setItem('emailReports', JSON.stringify(emailReports))

      alert(t.saved)
    } catch (error: any) {
      console.error('Error updating settings:', error)
      alert(t.error + ': ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (confirm(t.confirmSignOut)) {
      await signOut()
      router.push('/login')
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              ⚙️ <span className="text-[#ff6b00]">{t.title}</span>
            </h1>
            <p className="text-gray-400">{t.subtitle}</p>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">👤 {t.profile}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.fullName}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:border-[#ff6b00] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.emailAddress}
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg cursor-not-allowed opacity-60"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.emailReadonly}</p>
                </div>
              </div>
            </div>

            {/* Language Settings */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">🌐 {t.languageSettings}</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">{t.interfaceLanguage}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLanguage('EN')}
                    className={`px-4 py-3 rounded-lg font-medium transition ${
                      language === 'EN'
                        ? 'bg-[#ff6b00] text-black'
                        : 'bg-black border border-gray-700 hover:border-[#ff6b00]'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => setLanguage('RU')}
                    className={`px-4 py-3 rounded-lg font-medium transition ${
                      language === 'RU'
                        ? 'bg-[#ff6b00] text-black'
                        : 'bg-black border border-gray-700 hover:border-[#ff6b00]'
                    }`}
                  >
                    🇷🇺 Русский
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">🔔 {t.notificationsTitle}</h2>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-[#ff6b00]"
                  />
                  <div>
                    <div className="font-medium group-hover:text-[#ff6b00] transition">
                      {t.positionAlerts}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t.positionAlertsDesc}
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={emailReports}
                    onChange={(e) => setEmailReports(e.target.checked)}
                    className="w-5 h-5 mt-0.5 accent-[#ff6b00]"
                  />
                  <div>
                    <div className="font-medium group-hover:text-[#ff6b00] transition">
                      {t.weeklyReports}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t.weeklyReportsDesc}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={saveSettings}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-[#ff6b00] to-red-600 hover:from-red-600 hover:to-[#ff6b00] text-black font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  {t.saving}
                </>
              ) : (
                t.save
              )}
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition"
            >
              🚪 {t.signOut}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
