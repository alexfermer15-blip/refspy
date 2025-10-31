'use client'

import { useState } from 'react'
import { Eye, Sparkles, Send, Brain, Shield, Lock } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIAssistantProps {
  projectData?: any
  competitorsData?: any[]
  backlinksData?: any[]
}

export function AIAssistant({ projectData, competitorsData, backlinksData }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '🕵️ Агент онлайн. Разведывательная система готова. Какой интел вам нужен по вашим конкурентам?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 🇷🇺 Быстрые действия на русском
  const quickActions = [
    '🎯 Определи топ-10 точек инфильтрации',
    '📅 Разверни 30-дневный план скрытой операции',
    '🔍 Проанализируй тактическое преимущество врага',
    '💡 Укрепи оборонительные позиции',
    '📊 Расшифруй ключевые метрики разведки'
  ]

  const handleQuickAction = (action: string) => {
    setInput(action)
    handleSend(action)
  }

  const handleSend = async (message?: string) => {
    const userMessage = message || input.trim()
    if (!userMessage) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: {
            project: projectData,
            competitors: competitorsData?.length || 0,
            backlinks: backlinksData?.length || 0
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response
        }])
      } else {
        throw new Error(data.error || 'Failed to get AI response')
      }
    } catch (error: any) {
      console.error('AI Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Связь нарушена. Попытка восстановления соединения...'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat Window - Spy Themed */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-[450px] h-[650px] bg-black border-2 border-[#00ff00] rounded-2xl shadow-[0_0_30px_rgba(0,255,0,0.3)] flex flex-col z-50 animate-slide-up backdrop-blur-xl">
          {/* Header - Spy Style */}
          <div className="relative bg-gradient-to-r from-black via-gray-900 to-black text-[#00ff00] p-4 rounded-t-2xl border-b-2 border-[#00ff00] flex items-center justify-between overflow-hidden">
            {/* Animated scanlines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.1)_50%)] bg-[length:100%_4px] animate-scan"></div>
            </div>

            <div className="flex items-center gap-3 z-10 relative">
              {/* Spy Eye Icon with scanning effect */}
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-[#00ff00] rounded-full animate-ping opacity-20"></div>
                <div className="relative w-12 h-12 bg-black border-2 border-[#00ff00] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,0,0.5)]">
                  <Eye className="w-6 h-6 text-[#00ff00] animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 w-8 h-0.5 bg-[#00ff00] animate-radar origin-left -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2 font-mono">
                  <Shield className="w-4 h-4" />
                  SPY INTEL AI
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 bg-[#00ff00] rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,0,0.8)]"></span>
                  <span className="font-mono">ENCRYPTED • ONLINE</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="text-[#00ff00] hover:text-white hover:bg-[#00ff00]/20 p-2 rounded-lg transition text-xl border border-[#00ff00]/30 z-10 relative"
            >
              <Lock className="w-5 h-5" />
            </button>
          </div>

          {/* Messages - Terminal Style */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black relative">
            {/* Matrix rain effect (subtle) */}
            <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
              <div className="text-[#00ff00] text-xs font-mono whitespace-pre leading-3 animate-matrix-rain">
                {Array(50).fill('01010101 ').join('\n')}
              </div>
            </div>

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg font-mono text-sm border ${
                    message.role === 'user'
                      ? 'bg-[#00ff00] text-black border-[#00ff00] shadow-[0_0_15px_rgba(0,255,0,0.4)]'
                      : 'bg-black text-[#00ff00] border-[#00ff00] shadow-[0_0_10px_rgba(0,255,0,0.2)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start relative z-10">
                <div className="bg-black border border-[#00ff00] text-[#00ff00] p-3 rounded-lg flex items-center gap-3 shadow-[0_0_15px_rgba(0,255,0,0.3)] font-mono">
                  <Brain className="w-5 h-5 animate-pulse" />
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#00ff00] rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-[#00ff00] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-[#00ff00] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                  <span className="text-sm">АНАЛИЗ ДАННЫХ...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 pb-2 bg-black">
              <p className="text-xs text-[#00ff00]/70 mb-2 font-semibold font-mono flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                БЫСТРЫЕ ЗАПРОСЫ ИНТЕЛА:
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="w-full text-left text-xs p-2.5 bg-black hover:bg-[#00ff00]/10 text-[#00ff00] rounded-lg transition border border-[#00ff00]/30 hover:border-[#00ff00] font-mono hover:shadow-[0_0_10px_rgba(0,255,0,0.3)]"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input - Terminal Style */}
          <div className="p-4 border-t-2 border-[#00ff00]/30 bg-black">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="ВВЕДИТЕ ЗАПРОС..."
                className="flex-1 bg-black text-[#00ff00] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ff00] border border-[#00ff00]/50 font-mono placeholder-[#00ff00]/30 shadow-[inset_0_0_10px_rgba(0,255,0,0.1)]"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="bg-[#00ff00] hover:bg-[#00cc00] text-black px-6 py-3 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,255,0,0.4)] border border-[#00ff00] font-mono flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                ОТПРАВИТЬ
              </button>
            </div>
            <p className="text-xs text-[#00ff00]/50 mt-2 text-center font-mono">
              ⚠️ СЕКРЕТНЫЙ ИНТЕЛ • ПРОВЕРЯЙТЕ ВСЕ ДАННЫЕ
            </p>
          </div>
        </div>
      )}

      {/* Floating Button - Spy Eye */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-20 h-20 bg-black border-4 border-[#00ff00] rounded-full shadow-[0_0_40px_rgba(0,255,0,0.6)] flex items-center justify-center transition transform hover:scale-110 z-50 overflow-hidden group"
        title="Активировать AI разведки"
      >
        {/* Scanning pulse effect */}
        <div className="absolute inset-0 bg-[#00ff00] rounded-full animate-ping opacity-20"></div>
        
        {/* Rotating radar sweep */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-[#00ff00] to-transparent animate-radar origin-left -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Icon */}
        <div className="relative z-10">
          {isOpen ? (
            <Lock className="w-8 h-8 text-[#00ff00]" />
          ) : (
            <Eye className="w-8 h-8 text-[#00ff00] group-hover:scale-110 transition" />
          )}
        </div>

        {/* Status indicator */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#00ff00] rounded-full animate-pulse shadow-[0_0_15px_rgba(0,255,0,0.8)] border-2 border-black"></div>
      </button>

      {/* Custom Spy Animations */}
      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        @keyframes radar {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes matrix-rain {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .animate-scan { animation: scan 8s linear infinite; }
        .animate-radar { animation: radar 3s linear infinite; }
        .animate-matrix-rain { animation: matrix-rain 20s linear infinite; }
      `}</style>
    </>
  )
}
