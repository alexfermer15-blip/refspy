'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SurveillancePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-red-900/30 bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-2xl font-bold">
              Ref<span className="text-[#ff6b00]">Spy</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
                Dashboard
              </Link>
              <Link href="/dashboard/surveillance" className="text-[#ff6b00] font-bold">
                Surveillance
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            🛡️ <span className="text-[#ff6b00]">Операции</span> наблюдения
          </h1>
          <p className="text-gray-400">Активный мониторинг конкурентов в реальном времени</p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">📊 Активные операции</h3>
            <p className="text-gray-400">Мониторинг запущен для 0 конкурентов</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">🔔 Последние изменения</h3>
            <p className="text-gray-400">Нет новых данных</p>
          </div>
        </div>
      </div>
    </div>
  )
}
