'use client'

import Link from 'next/link'

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-red-900/30 bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-2xl font-bold">
              Ref<span className="text-[#ff6b00]">Spy</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">
          🎯 Анализ <span className="text-[#ff6b00]">угроз</span>
        </h1>
        <p className="text-gray-400 mb-8">Глубокий анализ конкурентной среды</p>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-400">Запустите мониторинг для получения данных</p>
        </div>
      </div>
    </div>
  )
}
