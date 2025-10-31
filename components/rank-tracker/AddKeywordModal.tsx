'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AddKeywordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddKeywordModal({
  isOpen,
  onClose,
  onSuccess,
}: AddKeywordModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    keyword: '',
    target_url: '',
    search_engine: 'google' as 'google' | 'yandex' | 'bing',
    location: 'global',
    language: 'en',
    device: 'desktop' as 'desktop' | 'mobile' | 'tablet',
    check_frequency: 'daily' as 'hourly' | 'daily' | 'weekly' | 'monthly',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('Пожалуйста, войдите в систему')
        return
      }

      const { error } = await supabase
        .from('keywords')
        .insert({
          ...formData,
          user_id: user.id,
        })

      if (error) throw error
      
      // Сброс формы
      setFormData({
        keyword: '',
        target_url: '',
        search_engine: 'google',
        location: 'global',
        language: 'en',
        device: 'desktop',
        check_frequency: 'daily',
      })
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to add keyword:', error)
      alert('Не удалось добавить ключевое слово')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-gray-900 border border-orange-500/30 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-500" />
              Добавить ключевое слово
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Keyword */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ключевое слово *
              </label>
              <input
                type="text"
                value={formData.keyword}
                onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="купить iphone 15"
                required
              />
            </div>

            {/* Target URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Целевой URL *
              </label>
              <input
                type="url"
                value={formData.target_url}
                onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://example.com/iphone-15"
                required
              />
            </div>

            {/* Search Engine & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Поисковик
                </label>
                <select
                  value={formData.search_engine}
                  onChange={(e) => setFormData({ ...formData, search_engine: e.target.value as 'google' | 'yandex' | 'bing' })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value="google">Google</option>
                  <option value="yandex">Яндекс</option>
                  <option value="bing">Bing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Регион
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                  placeholder="Москва, Россия"
                />
              </div>
            </div>

            {/* Language & Device */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Язык
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="de">Deutsch</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Устройство
                </label>
                <select
                  value={formData.device}
                  onChange={(e) => setFormData({ ...formData, device: e.target.value as 'desktop' | 'mobile' | 'tablet' })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value="desktop">Десктоп</option>
                  <option value="mobile">Мобильный</option>
                  <option value="tablet">Планшет</option>
                </select>
              </div>
            </div>

            {/* Check Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Частота проверки
              </label>
              <select
                value={formData.check_frequency}
                onChange={(e) => setFormData({ ...formData, check_frequency: e.target.value as 'hourly' | 'daily' | 'weekly' | 'monthly' })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="hourly">Каждый час</option>
                <option value="daily">Ежедневно</option>
                <option value="weekly">Еженедельно</option>
                <option value="monthly">Ежемесячно</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                disabled={loading}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
