'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'

function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
    }> = []
    
    const particleCount = 60
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      })
    }

    let animationFrameId: number

    function animate() {
      if (!ctx || !canvas) return
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.fillStyle = 'rgba(255, 107, 0, 0.8)'
        ctx.shadowBlur = 10
        ctx.shadowColor = 'rgba(255, 107, 0, 0.8)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        particles.slice(i + 1).forEach(p2 => {
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            ctx.strokeStyle = `rgba(255, 107, 0, ${0.3 * (1 - distance / 120)})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        })
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.3 }} />
}

export default function HomePage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [activeOperations, setActiveOperations] = useState(0)
  const [backlinksAnalyzed, setBacklinksAnalyzed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOperations(prev => (prev < 1247 ? prev + 17 : 1247))
      setBacklinksAnalyzed(prev => (prev < 50000000 ? prev + 500000 : 50000000))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const content = {
    EN: {
      hero: {
        badge: 'CLASSIFIED INTELLIGENCE SYSTEM',
        title: 'RefSpy: Uncover Your ',
        titleAccent: "Competitors'",
        titleEnd: ' Link Strategy',
        subtitle: 'Discover hidden backlink opportunities in seconds with AI-powered competitive intelligence',
        cta: 'Start Your Free 14-Day Trial',
        guarantee: 'No credit card required • Cancel anytime • 100% money-back guarantee',
      },
      stats: {
        agents: 'Active Intelligence Agents',
        backlinks: 'Backlinks Analyzed',
        accuracy: 'AI Accuracy Rate',
      },
      features: {
        badge: 'POWERED BY GPT-4',
        title: 'AI-Powered Intelligence Engine',
        subtitle: "Our advanced AI analyzes millions of backlinks in real-time, uncovering opportunities your competitors don't want you to find",
        items: [
          { icon: '🎯', title: 'Smart Target Identification', desc: 'AI identifies high-value backlink opportunities automatically' },
          { icon: '⚡', title: 'Real-Time Analysis', desc: 'Process thousands of domains in seconds, not hours' },
          { icon: '🛡️', title: 'Threat Detection', desc: 'Monitor competitor moves and respond instantly' },
          { icon: '📊', title: 'Predictive Analytics', desc: 'Forecast which links will drive the most traffic' }
        ],
        chatLabel: 'AI ASSISTANT ACTIVE',
        chatUser: 'User:',
        chatQuery: 'Find backlinks for semrush.com',
        chatAI: 'AI:',
        chatResponse: '✓ Analyzing 15,847 backlinks...\n✓ Found 234 high-value opportunities\n✓ Identified 12 competitor vulnerabilities\nReady to deploy strategy.'
      }
    },
    RU: {
      hero: {
        badge: 'СЕКРЕТНАЯ РАЗВЕДЫВАТЕЛЬНАЯ СИСТЕМА',
        title: 'RefSpy: Вскрой ',
        titleAccent: 'Ссылочную Стратегию',
        titleEnd: ' Конкурентов',
        subtitle: 'Раскрывай скрытые возможности бэклинков за секунды с помощью ИИ-разведки',
        cta: 'Начать 14-дневный пробный период',
        guarantee: 'Без кредитной карты • Отмена в любое время • Гарантия возврата 100%',
      },
      stats: {
        agents: 'Активных разведчиков',
        backlinks: 'Проанализировано бэклинков',
        accuracy: 'Точность ИИ',
      },
      features: {
        badge: 'НА БАЗЕ GPT-4',
        title: 'ИИ-движок разведки',
        subtitle: 'Наш продвинутый ИИ анализирует миллионы бэклинков в реальном времени, находя возможности, которые конкуренты не хотят чтобы вы нашли',
        items: [
          { icon: '🎯', title: 'Умная Идентификация Целей', desc: 'ИИ автоматически находит ценные возможности для бэклинков' },
          { icon: '⚡', title: 'Анализ в Реальном Времени', desc: 'Обрабатывайте тысячи доменов за секунды, а не часы' },
          { icon: '🛡️', title: 'Обнаружение Угроз', desc: 'Отслеживайте действия конкурентов и реагируйте мгновенно' },
          { icon: '📊', title: 'Предиктивная Аналитика', desc: 'Прогнозируйте какие ссылки принесут больше трафика' }
        ],
        chatLabel: 'ИИ-АССИСТЕНТ АКТИВЕН',
        chatUser: 'Пользователь:',
        chatQuery: 'Найди бэклинки для semrush.com',
        chatAI: 'ИИ:',
        chatResponse: '✓ Анализирую 15,847 бэклинков...\n✓ Найдено 234 ценных возможности\n✓ Выявлено 12 уязвимостей конкурентов\nСтратегия готова к развёртыванию.'
      }
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <ParticlesBackground />
      
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#FF6B00 1px, transparent 1px), linear-gradient(90deg, #FF6B00 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      <section id="hero" className="min-h-[90vh] flex items-center justify-center px-4 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10 py-20">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-red-900/10 border border-red-900/30 rounded-full">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-red-400 text-xs font-bold uppercase tracking-wider">
              {t.hero.badge}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight" style={{ letterSpacing: '-0.02em' }}>
            {t.hero.title}<span className="text-[#ff6b00]">{t.hero.titleAccent}</span>{t.hero.titleEnd}
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={() => router.push('/sign-up')}
              className="bg-gradient-to-r from-[#ff6b00] to-red-600 hover:from-red-600 hover:to-[#ff6b00] text-black font-bold px-8 py-4 rounded-lg text-lg transition hover:scale-105 inline-flex items-center gap-2"
            >
              {t.hero.cta} →
            </button>
            <p className="text-sm text-gray-500">
              {t.hero.guarantee}
            </p>
          </div>
        </div>

        <div className="absolute bottom-12 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-black text-[#ff6b00] mb-2 font-mono">
                  {activeOperations.toLocaleString()}+
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold font-mono">
                  {t.stats.agents}
                </div>
              </div>
              <div>
                <div className="text-5xl font-black text-[#ff6b00] mb-2 font-mono">
                  {(backlinksAnalyzed / 1000000).toFixed(1)}M+
                </div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold font-mono">
                  {t.stats.backlinks}
                </div>
              </div>
              <div>
                <div className="text-5xl font-black text-[#ff6b00] mb-2 font-mono">99.8%</div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold font-mono">
                  {t.stats.accuracy}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-900/20 border border-blue-900/50 rounded-full">
              <span className="text-blue-400 text-sm font-mono">🤖 {t.features.badge}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t.features.title}</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {t.features.items.map((feature, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-gradient-to-r from-gray-900/80 to-black/80 border border-gray-800 rounded-lg p-6 hover:border-primary/50 transition backdrop-blur-sm">
                  <div className="text-4xl">{feature.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-green-900/30 rounded-lg p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-mono">{t.features.chatLabel}</span>
              </div>
              <div className="space-y-4 font-mono text-sm">
                <div className="bg-black/50 rounded-lg p-4 border-l-2 border-[#ff6b00]">
                  <div className="text-gray-500 mb-1">{t.features.chatUser}</div>
                  <div className="text-white">{t.features.chatQuery}</div>
                </div>
                <div className="bg-black/50 rounded-lg p-4 border-l-2 border-green-400">
                  <div className="text-gray-500 mb-1">{t.features.chatAI}</div>
                  <div className="text-green-400 whitespace-pre-line">
                    {t.features.chatResponse}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
